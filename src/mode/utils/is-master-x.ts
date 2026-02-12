import { type MasterMode, type MasterPermission } from '../master-mode.js';

export function isMasterX(mode: MasterMode): boolean {
	return isXPermission(mode.user) || isXPermission(mode.group) || isXPermission(mode.others);
}

function isXPermission(permission: MasterPermission | undefined): boolean {
	return permission?.execute?.operand === 'X';
}
