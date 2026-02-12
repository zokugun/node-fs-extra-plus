import { isEmptyRecord } from '@zokugun/is-it-type';
import { type MasterMode, type MasterPermission } from '../master-mode.js';

export function sanitizeMaster(mode: MasterMode): MasterMode {
	let positiveWrite = false;
	let negativeWrite = false;
	let positiveRead = false;
	let negativeRead = false;

	for(const property of ['user', 'group', 'others']) {
		const permission = mode[property] as MasterPermission;

		if(permission) {
			if(permission.execute) {
				if(mode.updating) {
					delete permission.execute;
				}
				else {
					permission.execute = { operator: '=', operand: '-' };
				}
			}

			if(permission.write) {
				if(permission.write.operand && permission.write.operator !== '-') {
					positiveWrite = true;
				}
				else {
					negativeWrite = true;
				}
			}

			if(permission.read) {
				if(permission.read.operand && permission.read.operator !== '-') {
					positiveRead = true;
				}
				else {
					negativeRead = true;
				}
			}
		}
	}

	const operator = mode.updating ? '+' : '=';

	if(positiveWrite) {
		for(const property of ['user', 'group', 'others']) {
			const permission = (mode[property] ?? {}) as MasterPermission;

			permission.read = { operator, operand: true };
			permission.write = { operator, operand: true };

			mode[property] = permission;
		}
	}
	else {
		if(positiveRead || !mode.updating) {
			for(const property of ['user', 'group', 'others']) {
				const permission = (mode[property] ?? {}) as MasterPermission;

				permission.read = { operator, operand: true };

				mode[property] = permission;
			}
		}

		if(mode.updating) {
			if(!positiveRead || (negativeRead && !positiveRead)) {
				delete mode.user?.read;
				delete mode.group?.read;
				delete mode.others?.read;
			}

			if(negativeWrite) {
				for(const property of ['user', 'group', 'others']) {
					const permission = (mode[property] ?? {}) as MasterPermission;

					permission.write = { operator: '-', operand: true };

					mode[property] = permission;
				}
			}

			for(const property of ['user', 'group', 'others']) {
				if(isEmptyRecord(mode[property])) {
					delete mode[property];
				}
			}
		}
	}

	return mode;
}
