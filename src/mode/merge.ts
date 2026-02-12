import { ok, type Result } from '@zokugun/xtry';
import { type MasterMode } from './master-mode.js';
import { normalize } from './normalize.js';
import { toMaster } from './to-master.js';
import { type Mode } from './types.js';
import { masterTo } from './utils/master-to.js';
import { mergeMaster } from './utils/merge-master.js';

export function merge(...modes: unknown[]): Result<Mode, string> {
	if(modes.length === 0) {
		return ok(0);
	}

	if(modes.length === 1) {
		return normalize(modes[0]);
	}

	const masters: MasterMode[] = [];

	for(const mode of modes) {
		const master = toMaster(mode);
		if(master.fails) {
			return master;
		}

		masters.push(master.value);
	}

	const result = mergeMaster(...masters);
	if(result.fails) {
		return result;
	}

	return masterTo(result.value, modes[0] as Mode);
}
