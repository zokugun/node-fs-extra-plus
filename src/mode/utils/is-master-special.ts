import { type MasterMode, type MasterPermission } from '../master-mode.js';

export function isMasterSpecial(mode: MasterMode): boolean {
	return isSpecialPermission(mode.user) || isSpecialPermission(mode.group) || isSpecialPermission(mode.others);
}

function isSpecialPermission(permission: MasterPermission | undefined): boolean {
	if(permission?.execute && permission.execute.operand !== '-' && permission.execute.operand !== 'x') {
		return true;
	}

	return false;
}
