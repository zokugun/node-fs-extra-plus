import { err, type Result } from '@zokugun/xtry';
import { masterToStat } from './convert/master-to-stat.js';
import { isStat } from './is-stat.js';
import { normalizeStat } from './normalize-stat.js';
import { toMaster } from './to-master.js';
import { type StatMode } from './types.js';
import { convertError } from './utils/convert-error.js';

export function toStat(mode: unknown): Result<StatMode, string> {
	if(isStat(mode)) {
		const result = normalizeStat(mode);
		if(result.fails) {
			return err(convertError(mode, 'stat'));
		}

		return result;
	}

	const master = toMaster(mode);
	if(master.fails) {
		return err(convertError(mode, 'stat'));
	}

	const result = masterToStat(master.value);
	if(result.fails) {
		return err(convertError(mode, 'stat'));
	}

	return result;
}
