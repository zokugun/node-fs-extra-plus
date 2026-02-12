import { err, ok, type Result } from '@zokugun/xtry';
import { type MasterMode, type MasterPermission } from './master-mode.js';
import { normalize } from './normalize.js';
import { toMaster } from './to-master.js';
import { type Mode } from './types.js';
import { isMasterSpecial } from './utils/is-master-special.js';
import { isMasterUpdating } from './utils/is-master-updating.js';
import { masterTo } from './utils/master-to.js';

export function min(...modes: unknown[]): Result<Mode, string> {
	if(modes.length === 0) {
		return ok(0);
	}

	if(modes.length === 1) {
		return normalize(modes[0]);
	}

	const master = toMaster(modes[0]);
	if(master.fails) {
		return master;
	}

	const mainMaster = master.value;

	for(const mode of modes.slice(1)) {
		const master = toMaster(mode);
		if(master.fails) {
			return master;
		}

		buildPermission(mainMaster, master.value, 'user');
		buildPermission(mainMaster, master.value, 'group');
		buildPermission(mainMaster, master.value, 'others');

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

function buildPermission(mainMaster: MasterMode, master: MasterMode, target: 'user' | 'group' | 'others'): void {
	if(master[target]) {
		buildPermissionRW(mainMaster, target, master[target], 'read');
		buildPermissionRW(mainMaster, target, master[target], 'write');
		buildPermissionX(mainMaster, target, master[target]);
	}
	else {
		if(mainMaster[target]) {
			if(mainMaster[target].read?.operator !== '-') {
				delete mainMaster[target].read;
			}

			if(mainMaster[target].write?.operator !== '-') {
				delete mainMaster[target].write;
			}

			if(mainMaster[target].execute?.operator !== '-') {
				delete mainMaster[target].execute;
			}
		}
	}
}

function buildPermissionRW(master: MasterMode, target: 'user' | 'group' | 'others', permission: MasterPermission, operator: 'read' | 'write'): void {
	if(!permission[operator]) {
		if(master[target]?.[operator]?.operator === '-') {
			// skip
		}
		else {
			delete master[target]?.[operator];
		}

		return;
	}

	if(permission[operator].operand) {
		if(permission[operator].operator === '-') {
			master[target] ??= {};
			master[target][operator] = permission[operator];
		}
	}
	else {
		if(master[target]?.[operator]?.operand) {
			master[target][operator].operand = false;
		}
	}
}

function buildPermissionX(master: MasterMode, target: 'user' | 'group' | 'others', permission: MasterPermission): void {
	if(!permission.execute) {
		if(master[target]?.execute?.operator !== '-') {
			delete master[target]?.execute;
		}

		return;
	}

	if(permission.execute.operator === '-' || permission.execute.operand === '-') {
		if(master[target]?.execute?.operator === '-') {
			// skip
		}
		else {
			master[target] ??= {};
			master[target].execute = permission.execute;
		}
	}
	else {
		if(permission.execute.operand === 'x' && master[target]?.execute?.operand && master[target].execute.operand !== '-') {
			master[target].execute.operand = 'x';
		}

		if(permission.execute.operator === '=' && master[target]?.execute?.operator && master[target].execute.operator !== '-') {
			master[target].execute.operator = '=';
		}
	}
}
