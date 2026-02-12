import { err, ok, type Result } from '@zokugun/xtry';
import { isSymbolic } from './is-symbolic.js';
import { type SymbolicMode } from './types.js';
import { normalizeError } from './utils/normalize-error.js';
import { type ClauseKind, type ClauseOperator, CLAUSE_PERMISSIONS, CLAUSE_REGEX, CLAUSE_TARGETS } from './utils/symbolic.js';

const TARGET_ORDER: ClauseKind[] = ['u', 'g', 'o'];
const OPERATOR_ORDER: ClauseOperator[] = ['+', '-', '='];
const PERMISSION_ORDER = ['r', 'w', 'x', 'X', 's', 't'];

type TargetDescriptor = { kind: ClauseKind; fromAll: boolean };
type TargetState = Map<string, ClauseOperator>;
type SymbolicState = Record<ClauseKind, TargetState>;

export function normalizeSymbolic(value: unknown): Result<SymbolicMode, string> {
	if(typeof value !== 'string') {
		return err(normalizeError(value, 'symbolic'));
	}

	const trimmed = value.trim();
	if(trimmed.length === 0) {
		return err(normalizeError(value, 'symbolic'));
	}

	if(!isSymbolic(trimmed)) {
		return err(normalizeError(value, 'symbolic'));
	}

	const clauses = trimmed.split(',').map((clause) => clause.trim());
	if(clauses.some((clause) => clause.length === 0)) {
		return err(normalizeError(value, 'symbolic'));
	}

	const state: SymbolicState = {
		u: new Map(),
		g: new Map(),
		o: new Map(),
	};

	for(const clause of clauses) {
		const match = CLAUSE_REGEX.exec(clause);
		if(!match) {
			return err(normalizeError(value, 'symbolic'));
		}

		const [, rawTargets, rawOperator, rawPermissions] = match;
		if(rawPermissions.length === 0) {
			continue;
		}

		const operator = rawOperator as ClauseOperator;
		const targets = expandTargets(rawTargets, value);
		if(targets.fails) {
			return targets;
		}

		for(const target of targets.value) {
			const permissions = filterPermissionsForTarget(rawPermissions, target, value);
			if(permissions.fails) {
				return permissions;
			}

			for(const char of permissions.value) {
				const permission = normalizePermission(char);
				state[target.kind].set(permission, operator);
			}
		}
	}

	return ok(buildClauses(state));
}

function expandTargets(rawTargets: string, source: string): Result<TargetDescriptor[], string> {
	const targets = rawTargets.length === 0 ? 'a' : rawTargets;
	const seen = new Set<ClauseKind>();
	const descriptors: TargetDescriptor[] = [];

	for(const char of targets) {
		const normalized = char.toLowerCase();
		if(normalized === 'a') {
			for(const kind of TARGET_ORDER) {
				if(seen.has(kind)) {
					continue;
				}

				descriptors.push({ kind, fromAll: true });
				seen.add(kind);
			}

			continue;
		}

		if(!CLAUSE_TARGETS.has(normalized)) {
			return err(normalizeError(source, 'symbolic'));
		}

		const kind = normalized as ClauseKind;
		if(seen.has(kind)) {
			continue;
		}

		descriptors.push({ kind, fromAll: false });
		seen.add(kind);
	}

	return ok(descriptors);
}

function filterPermissionsForTarget(perms: string, target: TargetDescriptor, source: string): Result<string, string> {
	let result = '';

	for(const char of perms) {
		const normalized = normalizePermission(char);
		if(!CLAUSE_PERMISSIONS.has(normalized)) {
			return err(normalizeError(source, 'symbolic'));
		}

		if(normalized === 's' && target.kind === 'o') {
			continue;
		}

		if(normalized === 't' && target.kind !== 'o') {
			continue;
		}

		result += normalized;
	}

	return ok(result);
}

function normalizePermission(char: string): string {
	if(char === 'X') {
		return 'X';
	}

	return char.toLowerCase();
}

function buildClauses(state: SymbolicState): SymbolicMode {
	const segments: string[] = [];

	for(const target of TARGET_ORDER) {
		const grouped: Record<ClauseOperator, string[]> = {
			'=': [],
			'+': [],
			'-': [],
		};

		for(const [permission, operator] of state[target]) {
			grouped[operator].push(permission);
		}

		for(const operator of OPERATOR_ORDER) {
			const permissions = grouped[operator];
			if(permissions.length === 0) {
				continue;
			}

			permissions.sort((a, b) => PERMISSION_ORDER.indexOf(a) - PERMISSION_ORDER.indexOf(b));
			segments.push(`${target}${operator}${permissions.join('')}`);
		}
	}

	return segments.join(',') as SymbolicMode;
}
