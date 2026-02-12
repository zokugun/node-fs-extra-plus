import { err, type Result } from '@zokugun/xtry';
import { masterToOctal } from './convert/master-to-octal.js';
import { isOctal } from './is-octal.js';
import { normalizeOctal } from './normalize-octal.js';
import { toMaster } from './to-master.js';
import { type OctalMode } from './types.js';
import { convertError } from './utils/convert-error.js';

export function toOctal(mode: unknown): Result<OctalMode, string> {
	if(isOctal(mode)) {
		const result = normalizeOctal(mode);
		if(result.fails) {
			return err(convertError(mode, 'octal'));
		}

		return result;
	}

	const master = toMaster(mode);
	if(master.fails) {
		return err(convertError(mode, 'octal'));
	}

	const result = masterToOctal(master.value);
	if(result.fails) {
		return err(convertError(mode, 'octal'));
	}

	return result;
}
