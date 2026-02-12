import { inspect } from 'node:util';
import { isPositiveNumberOrZero, isString } from '@zokugun/is-it-type';
import { type ModeType } from '../types.js';

export function convertError(value: unknown, type: ModeType | string): string {
	const rendered
		= isPositiveNumberOrZero(value) ? `0o${(value as number).toString(8)}`
			: (isString(value) ? JSON.stringify(value)
				: inspect(value, { depth: null, compact: true, breakLength: Infinity }));

	return `Cannot convert ${rendered} to ${type}`;
}
