import { type PathLike } from 'node:fs';
import { openDir } from '../open-dir/sync.js';

export function isNonEmptyDir(path: PathLike): boolean {
	const dir = openDir(path);
	if(dir.fails) {
		return false;
	}

	const read = dir.value.readSync();
	if(read.fails) {
		return false;
	}

	return read.value !== null;
}
