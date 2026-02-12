import { err, ok, type Result } from '@zokugun/xtry';
import { masterToNumber } from './convert/master-to-number.js';
import { isNumber } from './is-number.js';
import { normalizeNumber } from './normalize-number.js';
import { toMaster } from './to-master.js';
import { type NumberMode } from './types.js';
import { convertError } from './utils/convert-error.js';

export function toNumber(mode: unknown): Result<NumberMode, string> {
	if(isNumber(mode)) {
		return ok(mode);
	}

	if(typeof mode === 'number') {
		const result = normalizeNumber(mode);
		if(result.fails) {
			return err(convertError(mode, 'number'));
		}

		return result;
	}

	const master = toMaster(mode);
	if(master.fails) {
		return err(convertError(mode, 'number'));
	}

	const result = masterToNumber(master.value);
	if(result.fails) {
		return err(convertError(mode, 'number'));
	}

	return result;
}
