import { err, ok, type Result } from '@zokugun/xtry';
import { type MasterMode, type MasterPermission } from './master-mode.js';
import { normalize } from './normalize.js';
import { toMaster } from './to-master.js';
import { type Mode } from './types.js';
import { isMasterSpecial } from './utils/is-master-special.js';
import { isMasterUpdating } from './utils/is-master-updating.js';
import { masterTo } from './utils/master-to.js';

export function max(...modes: unknown[]): Result<Mode, string> {
	if(modes.length === 0) {
		return ok(0);
	}

	if(modes.length === 1) {
		return normalize(modes[0]);
	}

	const mainMaster: MasterMode = {
		updating: false,
		special: false,
		typed: false,
	};

	for(const [index, mode] of modes.entries()) {
		const master = toMaster(mode);
		if(master.fails) {
			return master;
		}

		buildPermission(mainMaster, master.value, 'user', index);
		buildPermission(mainMaster, master.value, 'group', index);
		buildPermission(mainMaster, master.value, 'others', index);

		if(master.value.typed) {
			if(mainMaster.typed) {
				if(mainMaster.fileType !== master.value.fileType) {
					return err(`Mixed file types: ${mainMaster.fileType}, ${master.value.fileType}`);
				}
			}
			else {
				mainMaster.fileType = master.value.fileType;
				mainMaster.typed = true;
			}
		}
	}

	mainMaster.updating = isMasterUpdating(mainMaster);
	mainMaster.special = isMasterSpecial(mainMaster);

	return masterTo(mainMaster, modes[0] as Mode);
}

function buildPermission(mainMaster: MasterMode, master: MasterMode, target: 'user' | 'group' | 'others', index: Number): void {
	if(master[target]) {
		mainMaster[target] ??= {};

		buildPermissionRW(mainMaster, mainMaster[target], master[target], 'read', index);
		buildPermissionRW(mainMaster, mainMaster[target], master[target], 'write', index);
		buildPermissionX(mainMaster, mainMaster[target], master[target], index);
	}
	else {
		if(mainMaster[target]) {
			if(mainMaster[target].read?.operator === '-') {
				delete mainMaster[target].read;
			}

			if(mainMaster[target].write?.operator === '-') {
				delete mainMaster[target].write;
			}

			if(mainMaster[target].execute?.operator === '-') {
				delete mainMaster[target].execute;
			}
		}
	}
}

function buildPermissionRW(master: MasterMode, mainPermission: MasterPermission, permission: MasterPermission, operator: 'read' | 'write', index: Number): void {
	if(!permission[operator]) {
		if(mainPermission[operator]?.operator === '-') {
			delete mainPermission[operator];
		}

		return;
	}

	if(mainPermission[operator]) {
		if(permission[operator].operator === '+') {
			mainPermission[operator].operator = '+';
		}
		else if(permission[operator].operator === '=' && mainPermission[operator].operator !== '+') {
			mainPermission[operator].operator = '=';
		}

		if(permission[operator].operand) {
			mainPermission[operator].operand = true;
		}
	}
	else if(index === 0) {
		mainPermission[operator] = permission[operator];
	}
	else {
		if(permission[operator].operator !== '-') {
			mainPermission[operator] = permission[operator];
		}
	}
}

function buildPermissionX(master: MasterMode, mainPermission: MasterPermission, permission: MasterPermission, index: Number): void {
	if(!permission.execute) {
		if(mainPermission.execute?.operator === '-') {
			delete mainPermission.execute;
		}

		return;
	}

	if(mainPermission.execute) {
		if(permission.execute.operator === '+') {
			mainPermission.execute.operator = '+';
		}
		else if(permission.execute.operator === '=' && mainPermission.execute.operator !== '+') {
			mainPermission.execute.operator = '=';
		}

		if(permission.execute.operand === 's' || permission.execute.operand === 'X') {
			mainPermission.execute.operand = permission.execute.operand;
		}
		else if(permission.execute.operand === 'x' && mainPermission.execute.operand === '-') {
			mainPermission.execute.operand = 'x';
		}
	}
	else if(index === 0) {
		mainPermission.execute = permission.execute;
	}
	else {
		if(permission.execute.operator !== '-') {
			mainPermission.execute = permission.execute;
		}
	}
}
