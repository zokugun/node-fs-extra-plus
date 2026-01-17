import { type PathLike } from 'node:fs';
import { lstat } from '../fs/async.js';

export async function isSymlink(path: PathLike): Promise<boolean> {
	const result = await lstat(path);
	if(result.fails) {
		return false;
	}

	return result.value.isSymbolicLink();
}
