import { isNumber, isRecord, isString } from '@zokugun/is-it-type';
import { err, type Result } from '@zokugun/xtry';
import { isOctal } from './is-octal.js';
import { isStat } from './is-stat.js';
import { isSymbolic } from './is-symbolic.js';
import { normalizeNumber } from './normalize-number.js';
import { normalizeObject } from './normalize-object.js';
import { normalizeOctal } from './normalize-octal.js';
import { normalizeStat } from './normalize-stat.js';
import { normalizeSymbolic } from './normalize-symbolic.js';
import { type Mode, type NumberMode, type ObjectMode, type OctalMode, type StatMode, type SymbolicMode } from './types.js';
import { normalizeError } from './utils/normalize-error.js';

function normalize(value: NumberMode): Result<NumberMode, string>;
function normalize(value: ObjectMode): Result<ObjectMode, string>;
function normalize(value: OctalMode): Result<OctalMode, string>;
function normalize(value: StatMode): Result<StatMode, string>;
function normalize(value: SymbolicMode): Result<SymbolicMode, string>;
function normalize(value: unknown): Result<Mode, string>;
function normalize(value: unknown): Result<Mode, string> {
	if(isNumber(value)) {
		return normalizeNumber(value);
	}

	if(isString(value)) {
		const trimmed = value.trim();
		if(trimmed.length === 0) {
			return err(normalizeError(value));
		}

		if(isOctal(trimmed)) {
			return normalizeOctal(trimmed);
		}

		if(isStat(trimmed)) {
			return normalizeStat(trimmed);
		}

		if(isSymbolic(trimmed)) {
			return normalizeSymbolic(trimmed);
		}

		return err(normalizeError(value));
	}

	if(isRecord(value)) {
		return normalizeObject(value);
	}

	return err(normalizeError(value));
}

export { normalize };
