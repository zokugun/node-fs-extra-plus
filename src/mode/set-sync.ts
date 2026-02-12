import type fs from 'node:fs';
import { type Result } from '@zokugun/xtry';
import { chmod, stat } from '../fs/sync.js';
import { masterToNumber } from './convert/master-to-number.js';
import { numberToMaster } from './convert/number-to-master.js';
import { isNumber } from './is-number.js';
import { toMaster } from './to-master.js';
import { type Mode } from './types.js';
import { isMasterX } from './utils/is-master-x.js';
import { mergeMaster } from './utils/merge-master.js';

export function setSync(path: fs.PathLike, mode: Mode): Result<void, NodeJS.ErrnoException | string> {
	if(isNumber(mode)) {
		return chmod(path, mode);
	}

	const master = toMaster(mode);
	if(master.fails) {
		return master;
	}

	let target = master.value;

	if(target.updating || isMasterX(target)) {
		const stats = stat(path);
		if(stats.fails) {
			return stats;
		}

		const master = numberToMaster(stats.value.mode);
		if(master.fails) {
			return master;
		}

		const merged = mergeMaster(master.value, target);
		if(merged.fails) {
			return merged;
		}

		target = merged.value;
	}

	const num = masterToNumber(target);
	if(num.fails) {
		return num;
	}

	return chmod(path, num.value);
}
