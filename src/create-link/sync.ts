import path from 'node:path';
import { OK } from '@zokugun/xtry';
import { lstat, exists, link } from '../fs/sync.js';
import { mkdirs } from '../make-dir/sync.js';
import { type FsVoidResult } from '../types/fs-void-result.js';
import { areIdentical } from '../utils/are-identical.js';

export function createLink(source: string, target: string): FsVoidResult {
	const sourceStats = lstat(source);
	if(sourceStats.fails) {
		sourceStats.error.message = sourceStats.error.message.replace('lstat', 'ensureLink');

		return sourceStats;
	}

	const targetStats = lstat(target);

	if(!targetStats.fails && areIdentical(sourceStats.value, targetStats.value)) {
		return OK;
	}

	const dir = path.dirname(target);
	const dirExists = exists(dir);

	if(dirExists.value) {
		return link(source, target);
	}

	const result = mkdirs(dir);
	if(result.fails) {
		return result;
	}

	return link(source, target);
}

export const ensureLink = createLink;
