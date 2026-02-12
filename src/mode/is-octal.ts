import { isString } from '@zokugun/is-it-type';
import { type OctalMode } from './types.js';

const OCTAL_BODY_REGEX = /^[0-7]{1,4}$/;
const OPERATOR_CHARS = new Set(['+', '-', '=']);

export function isOctal(value: unknown): value is OctalMode {
	if(!isString(value)) {
		return false;
	}

	const trimmed = value.trim();
	if(trimmed === '') {
		return false;
	}

	let cursor = trimmed;
	const firstChar = cursor[0];
	if(firstChar && OPERATOR_CHARS.has(firstChar)) {
		cursor = cursor.slice(1);
	}

	if(cursor.startsWith('\\')) {
		cursor = cursor.slice(1);
	}

	if(cursor.startsWith('0o') || cursor.startsWith('0O')) {
		cursor = cursor.slice(2);
	}

	if(cursor === '') {
		return false;
	}

	return OCTAL_BODY_REGEX.test(cursor);
}
