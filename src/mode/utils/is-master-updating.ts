import { type MasterMode, type MasterPermission } from '../master-mode.js';

export function isMasterUpdating(mode: MasterMode): boolean {
	return isUpdatingPermission(mode.user) || isUpdatingPermission(mode.group) || isUpdatingPermission(mode.others);
}

function isUpdatingPermission(permission: MasterPermission | undefined): boolean {
	if(!permission) {
		return false;
	}

	if(permission.read && permission.read.operator !== '=') {
		return true;
	}

	if(permission.write && permission.write.operator !== '=') {
		return true;
	}

	if(permission.execute) {
		if(permission.execute.operator === '-' && permission.execute.operand === 's') {
			return false;
		}

		if(permission.execute.operator !== '=') {
			return true;
		}
	}

	return false;
}
