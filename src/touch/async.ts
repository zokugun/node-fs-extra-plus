import path from 'node:path';
import { OK } from '@zokugun/xtry/async';
import { close, open, utimes } from '../fs/async.js';
import { mkdirs } from '../make-dir/async.js';
import { type FsVoidResult } from '../types/fs-void-result.js';

export async function touch(file: string): Promise<FsVoidResult> {
	const time = new Date();

	const mkResult = await mkdirs(path.dirname(file));
	if(mkResult.fails) {
		return mkResult;
	}

	const utResult = await utimes(file, time, time);
	if(!utResult.fails) {
		return OK;
	}

	const openResult = await open(file, 'w');
	if(openResult.fails) {
		return openResult;
	}

	return close(openResult.value);
}
