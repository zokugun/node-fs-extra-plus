import { type MasterMode, type MasterPermission, type MasterPermissionEntry } from './master-mode.js';
import { toMaster } from './to-master.js';
import { type Mode } from './types.js';

export function equals(mainMode: Mode, ...modes: Mode[]): boolean {
	if(modes.length === 0) {
		return false;
	}

	const mainMaster = toMaster(mainMode);
	if(mainMaster.fails) {
		return false;
	}

	for(const mode of modes) {
		const master = toMaster(mode);
		if(master.fails) {
			return false;
		}

		if(!areMasterModesEqual(mainMaster.value, master.value)) {
			return false;
		}
	}

	return true;
}

function arePermissionEntriesEqual(a?: MasterPermissionEntry, b?: MasterPermissionEntry): boolean {
	if(!a && !b) {
		return true;
	}

	if(!a || !b) {
		return false;
	}

	return a.operator === b.operator && a.operand === b.operand;
}

function arePermissionsEqual(a?: MasterPermission, b?: MasterPermission): boolean {
	if(!a && !b) {
		return true;
	}

	if(!a || !b) {
		return false;
	}

	return (
		arePermissionEntriesEqual(a.read, b.read)
		&& arePermissionEntriesEqual(a.write, b.write)
		&& arePermissionEntriesEqual(a.execute, b.execute)
	);
}

function areMasterModesEqual(a: MasterMode, b: MasterMode): boolean {
	return (
		a.updating === b.updating
		&& a.special === b.special
		&& a.typed === b.typed
		&& a.fileType === b.fileType
		&& arePermissionsEqual(a.user, b.user)
		&& arePermissionsEqual(a.group, b.group)
		&& arePermissionsEqual(a.others, b.others)
	);
}
