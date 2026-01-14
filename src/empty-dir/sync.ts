import path from 'node:path';
import { OK_UNDEFINED } from '@zokugun/xtry';
import { readdir } from '../fs/sync.js';
import { mkdirs } from '../make-dir/sync.js';
import { remove } from '../remove/sync.js';

export function emptyDir(dir: string): ReturnType<typeof mkdirs> {
	const items = readdir(dir);

	if(items.fails) {
		return mkdirs(dir);
	}

	for(const item of items.value) {
		const itemPath = path.join(dir, item);

		const result = remove(itemPath);
		if(result.fails) {
			return result;
		}
	}

	return OK_UNDEFINED;
}

export const emptydir = emptyDir;
