import { err, ok, type Result } from '@zokugun/xtry';
import { type MasterMode } from '../master-mode.js';
import { type ObjectMode } from '../types.js';
import { convertError } from '../utils/convert-error.js';

type PermissionRecord = MasterMode extends { user?: infer R } ? R : never;

export function masterToObject(value: MasterMode): Result<ObjectMode, string> {
	if(value.typed) {
		return err(convertError(value, 'object'));
	}

	const result: ObjectMode = {};

	for(const target of ['user', 'group', 'others']) {
		const rights = value[target] as PermissionRecord;

		if(rights) {
			if(rights.read) {
				result[target] ??= {};
				result[target].read = rights.read.operator === '-' ? !rights.read.operand : rights.read.operand;
			}

			if(rights.write) {
				result[target] ??= {};
				result[target].write = rights.write.operator === '-' ? !rights.write.operand : rights.write.operand;
			}

			if(rights.execute) {
				result[target] ??= {};

				switch(rights.execute.operand) {
					case '-': {
						result[target].execute = false;
						break;
					}

					case 's': {
						result.special ??= {};

						result[target].execute = rights.execute.operator !== '-';

						if(target === 'user') {
							result.special.setuid = true;
						}
						else if(target === 'group') {
							result.special.setgid = true;
						}
						else if(target === 'others') {
							result.special.sticky = true;
						}

						break;
					}

					case 'x': {
						result[target].execute = rights.execute.operator !== '-';
						break;
					}

					case 'X': {
						return err(convertError(value, 'object'));
					}
				}
			}
		}
	}

	return ok(result);
}
