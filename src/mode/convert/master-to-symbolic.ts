import { err, ok, type Result } from '@zokugun/xtry';
import { type MasterMode } from '../master-mode.js';
import { type SymbolicMode } from '../types.js';
import { convertError } from '../utils/convert-error.js';

type PermissionRecord = MasterMode extends { user?: infer R } ? R : never;

export function masterToSymbolic(value: MasterMode): Result<SymbolicMode, string> {
	if(value.typed) {
		return err(convertError(value, 'symbolic'));
	}

	const result: string[] = [];

	for(const target of ['user', 'group', 'others']) {
		const rights = value[target] as PermissionRecord;

		if(rights) {
			const plus: string[] = [];
			const minus: string[] = [];
			const equals: string[] = [];

			if(rights.read?.operand) {
				const recipient = rights.read.operator === '+' ? plus : (rights.read.operator === '-' ? minus : equals);

				recipient.push('r');
			}

			if(rights.write?.operand) {
				const recipient = rights.write.operator === '+' ? plus : (rights.write.operator === '-' ? minus : equals);

				recipient.push('w');
			}

			if(rights.execute) {
				const recipient = rights.execute.operator === '+' ? plus : (rights.execute.operator === '-' ? minus : equals);

				switch(rights.execute.operand) {
					case '-': {
						break;
					}

					case 's': {
						if(target === 'others') {
							recipient.push('t');
						}
						else {
							recipient.push('s');
						}

						break;
					}

					case 'x': {
						recipient.push('x');
						break;
					}

					case 'X': {
						recipient.push('X');
					}
				}
			}

			if(plus.length > 0) {
				result.push(`${target[0]}+${plus.join('')}`);
			}

			if(minus.length > 0) {
				result.push(`${target[0]}-${minus.join('')}`);
			}

			if(equals.length > 0) {
				result.push(`${target[0]}=${equals.join('')}`);
			}
		}
	}

	return ok(result.join(',') as SymbolicMode);
}
