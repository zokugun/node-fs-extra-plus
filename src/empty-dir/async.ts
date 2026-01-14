import path from 'node:path';
import { OK_UNDEFINED } from '@zokugun/xtry';
import { readdir } from '../fs/async.js';
import { mkdirs } from '../make-dir/async.js';
import { remove } from '../remove/async.js';

export async function emptyDir(dir: string): ReturnType<typeof mkdirs> {
	const items = await readdir(dir);

	if(items.fails) {
		return mkdirs(dir);
	}

	for(const item of items.value) {
		const itemPath = path.join(dir, item);

		const result = await remove(itemPath);
		if(result.fails) {
			return result;
		}
	}

	return OK_UNDEFINED;
}

export const emptydir = emptyDir;
