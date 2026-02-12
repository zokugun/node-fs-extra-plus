import { err, type Result } from '@zokugun/xtry';
import { masterToSymbolic } from './convert/master-to-symbolic.js';
import { isSymbolic } from './is-symbolic.js';
import { normalizeSymbolic } from './normalize-symbolic.js';
import { toMaster } from './to-master.js';
import { type SymbolicMode } from './types.js';
import { convertError } from './utils/convert-error.js';

export function toSymbolic(mode: unknown): Result<SymbolicMode, string> {
	if(isSymbolic(mode)) {
		const result = normalizeSymbolic(mode);
		if(result.fails) {
			return err(convertError(mode, 'symbolic'));
		}

		return result;
	}

	const master = toMaster(mode);
	if(master.fails) {
		return err(convertError(mode, 'symbolic'));
	}

	const result = masterToSymbolic(master.value);
	if(result.fails) {
		return err(convertError(mode, 'symbolic'));
	}

	return result;
}
