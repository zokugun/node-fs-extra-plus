import { err, ok, type Result } from '@zokugun/xtry';
import { type MasterMode } from '../master-mode.js';
import { type StatMode } from '../types.js';
import { convertError } from '../utils/convert-error.js';

type PermissionRecord = MasterMode extends { user?: infer R } ? R : never;

export function masterToStat(value: MasterMode): Result<StatMode, string> {
	if(value.updating) {
		return err(convertError(value, 'stat'));
	}

	let result = '';

	if(value.fileType) {
		result += value.fileType === 'r' ? '-' : value.fileType;
	}

	for(const target of ['user', 'group', 'others']) {
		const rights = value[target] as PermissionRecord;

		if(rights) {
			if(rights.read) {
				result += rights.read.operand ? 'r' : '-';
			}
			else {
				result += '-';
			}

			if(rights.write) {
				result += rights.write.operand ? 'w' : '-';
			}
			else {
				result += '-';
			}

			if(rights.execute) {
				switch(rights.execute.operand) {
					case '-': {
						result += '-';
						break;
					}

					case 's': {
						result += target === 'others' ? 't' : 's';
						break;
					}

					case 'x': {
						result += 'x';
						break;
					}

					case 'X': {
						result += 'X';
					}
				}
			}
			else {
				result += '-';
			}
		}
		else {
			result += '---';
		}
	}

	return ok(result as StatMode);
}
