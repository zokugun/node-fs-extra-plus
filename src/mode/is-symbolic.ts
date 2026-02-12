import { isString } from '@zokugun/is-it-type';
import { type SymbolicMode } from './types.js';
import { CLAUSE_PERMISSIONS, CLAUSE_REGEX, CLAUSE_TARGETS } from './utils/symbolic.js';

export function isSymbolic(value: unknown): value is SymbolicMode {
	if(!isString(value)) {
		return false;
	}

	const trimmed = value.trim();

	if(trimmed.length === 0) {
		return false;
	}

	const clauses = trimmed.split(',').map((clause) => clause.trim());

	if(clauses.some((clause) => clause.length === 0)) {
		return false;
	}

	for(const clause of clauses) {
		const match = CLAUSE_REGEX.exec(clause);

		if(!match) {
			return false;
		}

		const [, rawTargets, , rawPermissions] = match;
		const targets = rawTargets.length === 0 ? 'a' : rawTargets;

		for(const char of targets) {
			if(!CLAUSE_TARGETS.has(char.toLowerCase())) {
				return false;
			}
		}

		const seen = new Set<string>();
		for(const char of rawPermissions) {
			const normalized = char === 'X' ? 'X' : char.toLowerCase();

			if(!CLAUSE_PERMISSIONS.has(normalized)) {
				return false;
			}

			if(seen.has(normalized)) {
				return false;
			}

			seen.add(normalized);
		}
	}

	return true;
}
