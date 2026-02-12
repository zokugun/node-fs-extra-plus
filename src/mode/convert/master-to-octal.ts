import { err, ok, type Result } from '@zokugun/xtry';
import { type MasterMode } from '../master-mode.js';
import { type OctalMode } from '../types.js';
import { convertError } from '../utils/convert-error.js';

type PermissionRecord = MasterMode extends { user?: infer R } ? R : never;

export function masterToOctal(value: MasterMode): Result<OctalMode, string> {
	if(value.typed) {
		return err(convertError(value, 'octal'));
	}

	const result: number[] = [];
	let operator = '';
	let special = 0;

	for(const target of ['user', 'group', 'others']) {
		const rights = value[target] as PermissionRecord;
		let permissions = 0;

		if(rights) {
			if(rights.read) {
				if(operator) {
					if(operator !== rights.read.operator) {
						return err(convertError(value, 'octal'));
					}
				}
				else {
					operator = rights.read.operator;
				}

				if(rights.read.operand) {
					permissions += 4;
				}
			}

			if(rights.write) {
				if(operator) {
					if(operator !== rights.write.operator) {
						return err(convertError(value, 'octal'));
					}
				}
				else {
					operator = rights.write.operator;
				}

				if(rights.write.operand) {
					permissions += 2;
				}
			}

			if(rights.execute) {
				if(operator) {
					if(rights.execute.operator === '-' && rights.execute.operand === 's') {
						if(operator === '+') {
							return err(convertError(value, 'octal'));
						}
					}
					else if(operator !== rights.execute.operator) {
						return err(convertError(value, 'octal'));
					}
				}
				else {
					operator = rights.execute.operator;
				}

				switch(rights.execute.operand) {
					case '-': {
						break;
					}

					case 's': {
						if(rights.execute.operator === '-') {
							permissions &= 6;
						}
						else {
							permissions += 1;
						}

						if(target === 'user') {
							special += 4;
						}
						else if(target === 'group') {
							special += 2;
						}
						else if(target === 'others') {
							special += 1;
						}

						break;
					}

					case 'x': {
						permissions += 1;
						break;
					}

					case 'X': {
						return err(convertError(value, 'octal'));
					}
				}
			}
		}

		result.push(permissions);
	}

	if(value.updating && operator.length === 0) {
		operator = '+';
	}

	return ok(`${operator}0o${special}${result.join('')}` as OctalMode);
}
