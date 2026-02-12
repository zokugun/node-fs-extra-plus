import process from 'node:process';
import { inspect } from 'node:util';
import { isNumber, isRecord, isString } from '@zokugun/is-it-type';
import { err, ok, type Result } from '@zokugun/xtry';
import { masterToObject } from './convert/master-to-object.js';
import { masterToOctal } from './convert/master-to-octal.js';
import { masterToStat } from './convert/master-to-stat.js';
import { masterToSymbolic } from './convert/master-to-symbolic.js';
import { isOctal } from './is-octal.js';
import { isStat } from './is-stat.js';
import { isSymbolic } from './is-symbolic.js';
import { normalizeNumber } from './normalize-number.js';
import { normalizeObject } from './normalize-object.js';
import { normalizeOctal } from './normalize-octal.js';
import { normalizeStat } from './normalize-stat.js';
import { normalizeSymbolic } from './normalize-symbolic.js';
import { sanitizeNumber } from './sanitize-number.js';
import { toMaster } from './to-master.js';
import { type Mode, type NumberMode, type ObjectMode, type OctalMode, type StatMode, type SymbolicMode } from './types.js';
import { sanitizeMaster } from './utils/sanitize-master.js';

function sanitize(value: NumberMode): Result<NumberMode, string>;
function sanitize(value: ObjectMode): Result<ObjectMode, string>;
function sanitize(value: OctalMode): Result<OctalMode, string>;
function sanitize(value: StatMode): Result<StatMode, string>;
function sanitize(value: SymbolicMode): Result<SymbolicMode, string>;
function sanitize(value: unknown): Result<Mode, string>;
function sanitize(value: unknown): Result<Mode, string> {
	if(isNumber(value)) {
		const result = normalizeNumber(value);
		if(result.fails) {
			return err(sanitizeError(value));
		}

		return ok(sanitizeNumber(result.value));
	}

	let result: Result<Mode, string>;

	if(process.platform === 'win32') {
		const master = toMaster(value);
		if(master.fails) {
			return err(sanitizeError(value));
		}

		const sanitized = sanitizeMaster(master.value);

		if(isString(value)) {
			if(isOctal(value)) {
				result = masterToOctal(sanitized);
			}
			else if(isStat(value)) {
				result = masterToStat(sanitized);
			}
			else {
				result = masterToSymbolic(sanitized);
			}
		}
		else {
			result = masterToObject(sanitized);
		}
	}
	else {
		if(isString(value)) {
			const trimmed = value.trim();
			if(trimmed.length === 0) {
				return err(sanitizeError(value));
			}

			if(isOctal(trimmed)) {
				result = normalizeOctal(trimmed);
			}
			else if(isStat(trimmed)) {
				result = normalizeStat(trimmed);
			}
			else if(isSymbolic(trimmed)) {
				result = normalizeSymbolic(trimmed);
			}
			else {
				return err(sanitizeError(value));
			}
		}
		else if(isRecord(value)) {
			result = normalizeObject(value);
		}
		else {
			return err(sanitizeError(value));
		}
	}

	if(result.fails) {
		return err(sanitizeError(value));
	}

	return result;
}

function sanitizeError(value: unknown): string {
	const rendered = isString(value) ? JSON.stringify(value) : inspect(value, { depth: null, compact: true, breakLength: Infinity });

	return `Cannot sanitize: ${rendered}`;
}

export { sanitize };
