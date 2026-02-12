import { err, ok, type Result } from '@zokugun/xtry';
import { type MasterMode, type MasterPermission } from '../master-mode.js';
import { isMasterSpecial } from './is-master-special.js';
import { isMasterUpdating } from './is-master-updating.js';

export function mergeMaster(...modes: MasterMode[]): Result<MasterMode, string> {
	const result: MasterMode = {
		updating: false,
		special: false,
		typed: false,
	};

	for(const [index, mode] of modes.entries()) {
		mergePermission(result, mode, 'user', index);
		mergePermission(result, mode, 'group', index);
		mergePermission(result, mode, 'others', index);

		if(mode.typed) {
			if(result.typed) {
				if(result.fileType !== mode.fileType) {
					return err(`Mixed file types: ${result.fileType}, ${mode.fileType}`);
				}
			}
			else {
				result.fileType = mode.fileType;
				result.typed = true;
			}
		}
	}

	result.updating = isMasterUpdating(result);
	result.special = isMasterSpecial(result);

	return ok(result);
}

function mergePermission(result: MasterMode, master: MasterMode, target: 'user' | 'group' | 'others', index: Number): void {
	if(master[target]) {
		result[target] ??= {};

		mergePermissionRW(result[target], master[target], 'read', index);
		mergePermissionRW(result[target], master[target], 'write', index);
		mergePermissionX(result, result[target], master[target], index);
	}
}

function mergePermissionRW(mainPermission: MasterPermission, permission: MasterPermission, operator: 'read' | 'write', index: Number): void {
	if(!permission[operator] || (!permission[operator].operand && permission[operator].operator !== '=')) {
		return;
	}

	if(mainPermission[operator]?.operator === '=' && permission[operator].operator !== '=') {
		if(permission[operator].operator === '-') {
			mainPermission[operator].operand = false;
		}
		else {
			mainPermission[operator].operand ||= permission[operator].operand;
		}
	}
	else {
		mainPermission[operator] = permission[operator];
	}
}

function mergePermissionX(mode: MasterMode, mainPermission: MasterPermission, permission: MasterPermission, index: Number): void {
	if(!permission.execute || (permission.execute.operand === '-' && permission.execute.operator !== '=')) {
		return;
	}

	if(mainPermission.execute?.operator === '=' && permission.execute.operator !== '=') {
		if(permission.execute.operator === '-') {
			if(permission.execute.operand === 'x') {
				mainPermission.execute.operand = '-';
			}
			else if(mainPermission.execute.operand !== '-') {
				mainPermission.execute.operand = 'x';
			}
		}
		else {
			if(permission.execute.operand !== 'x' && permission.execute.operand !== '-') {
				mainPermission.execute.operand = permission.execute.operand;
			}
			else if(mainPermission.execute.operand === '-') {
				mainPermission.execute.operand = permission.execute.operand;
			}
		}
	}
	else {
		mainPermission.execute = { ...permission.execute };

		if(mainPermission.execute.operand === 'X' && mode.typed) {
			if(mode.fileType === 'd') {
				mainPermission.execute.operand = 'x';
			}
			else {
				mainPermission.execute.operator = '=';
				mainPermission.execute.operand = '-';
			}
		}
	}
}

