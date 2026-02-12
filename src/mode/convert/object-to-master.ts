import { isBoolean } from '@zokugun/is-it-type';
import { ok, type Result } from '@zokugun/xtry';
import { type MasterPermissionRWEntry, type MasterPermissionXEntry, type MasterMode } from '../master-mode.js';
import { normalizeObject } from '../normalize-object.js';
import { type ObjectMode, type PermissionRecord } from '../types.js';

export function objectToMaster(value: ObjectMode): Result<MasterMode, string> {
	const normalized = normalizeObject(value).value!;
	const result: MasterMode = {
		updating: false,
		special: false,
		typed: false,
	};

	for(const target of ['user', 'group', 'others']) {
		const rights = normalized[target] as PermissionRecord;

		if(rights) {
			for(const operator of ['read', 'write', 'execute']) {
				if(isBoolean(rights[operator])) {
					result[target] ??= {};

					if(operator === 'execute') {
						result[target][operator] ??= { operator: '=', operand: rights[operator] ? 'x' : '-' };
					}
					else {
						result[target][operator] ??= { operator: '=', operand: rights[operator] };
					}
				}
				else {
					result.updating = true;
				}
			}
		}
		else {
			result.updating = true;
		}
	}

	if(result.updating) {
		for(const target of ['user', 'group', 'others']) {
			for(const operator of ['read', 'write']) {
				const permission = result[target]?.[operator] as MasterPermissionRWEntry | undefined;

				if(permission) {
					if(permission.operand) {
						permission.operator = '+';
					}
					else {
						permission.operator = '-';
						permission.operand = true;
					}
				}
			}

			const permission = result[target]?.execute as MasterPermissionXEntry | undefined;

			if(permission) {
				if(permission.operand === '-') {
					permission.operator = '-';
					permission.operand = '-';
				}
				else {
					permission.operator = '+';
				}
			}
		}
	}

	if(normalized.special) {
		result.special = true;

		if(isBoolean(normalized.special.setuid)) {
			if(result.updating) {
				result.user ??= {};
				result.user.execute = { operator: normalized.special.setuid ? '+' : '-', operand: 's' };
			}
			else if(normalized.special.setuid) {
				result.user ??= {};
				result.user.execute = { operator: '=', operand: 's' };
			}
		}

		if(isBoolean(normalized.special.setgid)) {
			if(result.updating) {
				result.group ??= {};
				result.group.execute = { operator: normalized.special.setgid ? '+' : '-', operand: 's' };
			}
			else if(normalized.special.setgid) {
				result.group ??= {};
				result.group.execute = { operator: '=', operand: 's' };
			}
		}

		if(isBoolean(normalized.special.sticky)) {
			if(result.updating) {
				result.others ??= {};
				result.others.execute = { operator: normalized.special.sticky ? '+' : '-', operand: 's' };
			}
			else if(normalized.special.sticky) {
				result.others ??= {};
				result.others.execute = { operator: '=', operand: 's' };
			}
		}
	}

	return ok(result);
}
