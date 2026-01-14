import path from 'node:path';
import { OK } from '@zokugun/xtry';
import { stat, writeFile } from '../fs/sync.js';
import { mkdirs } from '../make-dir/sync.js';
import { type FsVoidResult } from '../utils/types.js';

export function createFile(file: string): FsVoidResult {
	const fileStats = stat(file);
	if(!fileStats.fails && fileStats.value.isFile()) {
		return OK;
	}

	const dir = path.dirname(file);
	const dirStats = stat(dir);

	if(dirStats.fails) {
		if(dirStats.error.code === 'ENOENT') {
			const result = mkdirs(dir);
			if(result.fails) {
				return result;
			}
		}
		else {
			return dirStats;
		}
	}

	return writeFile(file, '');
}

export const ensureFile = createFile;
