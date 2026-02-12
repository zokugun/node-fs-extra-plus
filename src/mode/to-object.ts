import { err, type Result } from '@zokugun/xtry';
import { masterToObject } from './convert/master-to-object.js';
import { isObject } from './is-object.js';
import { normalizeObject } from './normalize-object.js';
import { toMaster } from './to-master.js';
import { type ObjectMode } from './types.js';
import { convertError } from './utils/convert-error.js';

export function toObject(mode: unknown): Result<ObjectMode, string> {
	if(isObject(mode)) {
		const result = normalizeObject(mode);
		if(result.fails) {
			return err(convertError(mode, 'object'));
		}

		return result;
	}

	const master = toMaster(mode);
	if(master.fails) {
		return err(convertError(mode, 'object'));
	}

	const result = masterToObject(master.value);
	if(result.fails) {
		return err(convertError(mode, 'object'));
	}

	return result;
}
