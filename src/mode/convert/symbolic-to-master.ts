import { ok, type Result } from '@zokugun/xtry';
import { type MasterMode } from '../master-mode.js';
import { normalizeSymbolic } from '../normalize-symbolic.js';
import { type SymbolicMode } from '../types.js';

type Operator = '+' | '-' | '=';
type SymPerm = 'r' | 'w' | 'x' | 's' | 't';
type PermissionRecord = MasterMode extends { user?: infer U; others?: infer O } ? U | O : never;

export function symbolicToMaster(value: SymbolicMode): Result<MasterMode, string> {
	const normalization = normalizeSymbolic(value);
	if(normalization.fails) {
		return normalization;
	}

	const clauses = normalization.value.split(',');
	const result: MasterMode = {
		updating: true,
		special: false,
		typed: false,
	};

	let count = 0;
	let updating = false;

	for(const value of clauses) {
		const [target, operator, ...permissions] = value.split('');

		if(operator === '=') {
			count += 1;
		}
		else {
			updating = true;
		}

		if(target === 'u') {
			result.user ??= {};

			buildClause(result.user, operator as Operator, permissions as SymPerm[]);
		}
		else if(target === 'g') {
			result.group ??= {};

			buildClause(result.group, operator as Operator, permissions as SymPerm[]);
		}
		else if(target === 'o') {
			result.others ??= {};

			buildClause(result.others, operator as Operator, permissions as SymPerm[]);
		}
	}

	if(count > 0 && !updating) {
		result.updating = false;

		result.user ??= {};
		result.group ??= {};
		result.others ??= {};

		closeClause(result.user);
		closeClause(result.group);
		closeClause(result.others);
	}

	return ok(result);
}

function buildClause(target: PermissionRecord, operator: Operator, permissions: SymPerm[]): void {
	for(const perm of permissions) {
		if(perm === 'r') {
			target.read = { operator, operand: true };
		}
		else if(perm === 'w') {
			target.write = { operator, operand: true };
		}
		else {
			target.execute = { operator, operand: perm === 't' ? 's' : perm };
		}
	}
}

function closeClause(target: PermissionRecord): void {
	target.read ||= { operator: '=', operand: false };
	target.write ||= { operator: '=', operand: false };
	target.execute ||= { operator: '=', operand: '-' };
}
