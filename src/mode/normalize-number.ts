import { err, ok, type Result } from '@zokugun/xtry';
import { isNumber } from './is-number.js';
import { type NumberMode } from './types.js';
import { normalizeError } from './utils/normalize-error.js';

export function normalizeNumber(value: unknown): Result<NumberMode, string> {
	if(typeof value !== 'number' || Number.isNaN(value) || value < 0) {
		return err(normalizeError(value, 'number'));
	}

	if(isNumber(value)) {
		return ok(value);
	}

	return ok(value & 0o17_7777);
}
