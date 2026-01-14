import path from 'node:path';
import { OK } from '@zokugun/xtry';
import { lstat, exists, link } from '../fs/async.js';
import { mkdirs } from '../make-dir/async.js';
import { areIdentical } from '../utils/are-identical.js';
import { type FsVoidResult } from '../utils/types.js';

export async function createLink(source: string, target: string): Promise<FsVoidResult> {
	const sourceStats = await lstat(source);
	if(sourceStats.fails) {
		sourceStats.error.message = sourceStats.error.message.replace('lstat', 'ensureLink');

		return sourceStats;
	}

	const targetStats = await lstat(target);

	if(!targetStats.fails && areIdentical(sourceStats.value, targetStats.value)) {
		return OK;
	}

	const dir = path.dirname(target);
	const dirExists = await exists(dir);

	if(dirExists.value) {
		return link(source, target);
	}

	const result = await mkdirs(dir);
	if(result.fails) {
		return result;
	}

	return link(source, target);
}

export const ensureLink = createLink;
