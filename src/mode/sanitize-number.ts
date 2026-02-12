import process from 'node:process';
import { ALL_RO, ALL_RW } from './constants.js';
import { type NumberMode } from './types.js';
import { clamp } from './utils/clamp.js';

export function sanitizeNumber(mode: NumberMode): NumberMode {
	mode = clamp(mode);

	if(process.platform === 'win32') {
		mode &= ~0o111;

		if((mode & 0o200) || (mode & 0o020) || (mode & 0o002)) {
			mode = ALL_RW;
		}
		else {
			mode = ALL_RO;
		}
	}

	return mode;
}
