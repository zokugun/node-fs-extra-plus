import { err, ok, type Result } from '@zokugun/xtry';
import { type OctalMode } from './types.js';
import { normalizeError } from './utils/normalize-error.js';

const OPERATOR_CHARS = new Set(['+', '-', '=']);
const OCTAL_BODY_REGEX = /^[0-7]{1,4}$/;

type Operator = '+' | '-' | '=';

export function normalizeOctal(value: unknown): Result<OctalMode, string> {
	if(typeof value !== 'string') {
		return err(normalizeError(value, 'octal'));
	}

	let cursor = value.trim();
	if(cursor.length === 0) {
		return err(normalizeError(value, 'octal'));
	}

	let operator: Operator = '=';
	const firstChar = cursor[0];
	if(firstChar && OPERATOR_CHARS.has(firstChar)) {
		operator = firstChar as Operator;
		cursor = cursor.slice(1).trimStart();
	}

	if(cursor.startsWith('\\')) {
		cursor = cursor.slice(1);
	}

	if(cursor.startsWith('0o') || cursor.startsWith('0O')) {
		cursor = cursor.slice(2);
	}

	cursor = cursor.replace(/^0+/, '');
	if(cursor.length === 0) {
		cursor = '0';
	}

	if(!OCTAL_BODY_REGEX.test(cursor)) {
		return err(normalizeError(value, 'octal'));
	}

	const parsed = Number.parseInt(cursor, 8);
	if(Number.isNaN(parsed)) {
		return err(normalizeError(value, 'octal'));
	}

	const clamped = parsed & 0o7777;
	const digits = clamped.toString(8).padStart(4, '0');

	return ok(`${operator}0o${digits}` as OctalMode);
}
