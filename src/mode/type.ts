import { isString } from '@zokugun/is-it-type';
import { isNumber } from './is-number.js';
import { isObject } from './is-object.js';
import { isOctal } from './is-octal.js';
import { isStat } from './is-stat.js';
import { isSymbolic } from './is-symbolic.js';
import { type ModeType } from './types.js';

export function type(value: unknown): ModeType | null {
	if(isNumber(value)) {
		return 'number';
	}

	if(isString(value)) {
		const trimmed = value.trim();
		if(trimmed.length === 0) {
			return null;
		}

		if(isOctal(trimmed)) {
			return 'octal';
		}

		if(isStat(trimmed)) {
			return 'stat';
		}

		if(isSymbolic(trimmed)) {
			return 'symbolic';
		}

		return null;
	}

	if(isObject(value)) {
		return 'object';
	}

	return null;
}
