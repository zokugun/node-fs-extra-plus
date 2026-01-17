import path from 'node:path';
import { OK } from '@zokugun/xtry/sync';
import { utimes, open, close } from '../fs/sync.js';
import { mkdirs } from '../make-dir/sync.js';
import { type FsVoidResult } from '../types/fs-void-result.js';

export function touch(file: string): FsVoidResult {
	const time = new Date();

	const mkResult = mkdirs(path.dirname(file));
	if(mkResult.fails) {
		return mkResult;
	}

	const utResult = utimes(file, time, time);
	if(!utResult.fails) {
		return OK;
	}

	const openResult = open(file, 'w');
	if(openResult.fails) {
		return openResult;
	}

	return close(openResult.value);
}
