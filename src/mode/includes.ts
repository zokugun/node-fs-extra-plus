import { type MasterMode, type MasterPermission, type MasterPermissionEntry } from './master-mode.js';
import { toMaster } from './to-master.js';
import { type Mode } from './types.js';

export function includes(mainMode: Mode, ...modes: Mode[]): boolean {
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

		if(!areMasterModesIncluded(mainMaster.value, master.value)) {
			return false;
		}
	}

	return true;
}

function areMasterModesIncluded(a: MasterMode, b: MasterMode): boolean {
	if(b.special && !a.special) {
		return false;
	}

	if(b.typed && a.fileType !== b.fileType) {
		return false;
	}

	return (
		arePermissionsIncluded(a, a.user, b.user)
		&& arePermissionsIncluded(a, a.group, b.group)
		&& arePermissionsIncluded(a, a.others, b.others)
	);
}

function arePermissionsIncluded(mode: MasterMode, a?: MasterPermission, b?: MasterPermission): boolean {
	if(!b) {
		return true;
	}

	if(!a) {
		return false;
	}

	return (
		arePermissionEntriesIncluded(mode, a.read, b.read)
		&& arePermissionEntriesIncluded(mode, a.write, b.write)
		&& arePermissionEntriesIncluded(mode, a.execute, b.execute)
	);
}

function arePermissionEntriesIncluded(mode: MasterMode, a?: MasterPermissionEntry, b?: MasterPermissionEntry): boolean {
	if(!b) {
		return true;
	}

	if(!a) {
		return false;
	}

	if(b.operand === '-' || !b.operand) {
		return true;
	}

	if(b.operator === '-') {
		if(a.operator !== '-') {
			return false;
		}
	}
	else {
		if(a.operator === '-') {
			return false;
		}
	}

	if(b.operand === true) {
		return a.operand === true;
	}

	if(b.operand === 'x') {
		return a.operand !== '-';
	}

	if(b.operand === 'X') {
		if(a.operand === 'X') {
			return true;
		}

		if(!mode.typed) {
			return false;
		}

		if(mode.fileType === 'd') {
			return a.operand !== '-';
		}
		else {
			return a.operand === '-';
		}
	}

	if(b.operand === 's') {
		return a.operand === 's';
	}

	return true;
}
