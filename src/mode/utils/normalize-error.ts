import { inspect } from 'node:util';
import { isString } from '@zokugun/is-it-type';
import { type ModeType } from '../types.js';

export function normalizeError(value: unknown, type?: ModeType): string {
	const rendered = isString(value) ? JSON.stringify(value) : inspect(value, { depth: null, compact: true, breakLength: Infinity });

	if(type) {
		return `Cannot normalize ${type}: ${rendered}`;
	}
	else {
		return `Cannot normalize: ${rendered}`;
	}
}
