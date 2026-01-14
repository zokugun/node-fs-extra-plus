import path from 'node:path';
import { OK } from '@zokugun/xtry';
import { stat, writeFile } from '../fs/async.js';
import { mkdirs } from '../make-dir/async.js';
import { type FsVoidResult } from '../utils/types.js';

export async function createFile(file: string): Promise<FsVoidResult> {
	const fileStats = await stat(file);
	if(!fileStats.fails && fileStats.value.isFile()) {
		return OK;
	}

	const dir = path.dirname(file);
	const dirStats = await stat(dir);

	if(dirStats.fails) {
		if(dirStats.error.code === 'ENOENT') {
			const result = await mkdirs(dir);
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
