import { inspect } from 'node:util';
import { isNumber, isString } from '@zokugun/is-it-type';

export function testname(value: unknown): string {
	if(isNumber(value)) {
		return value.toString(8);
	}

	if(isString(value)) {
		return JSON.stringify(value);
	}

	return inspect(value, { depth: null, compact: true, breakLength: Infinity });
}
