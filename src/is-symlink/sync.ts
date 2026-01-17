import { type PathLike } from 'node:fs';
import { lstat } from '../fs/sync.js';

export function isSymlink(path: PathLike): boolean {
	const result = lstat(path);
	if(result.fails) {
		return false;
	}

	return result.value.isSymbolicLink();
}
