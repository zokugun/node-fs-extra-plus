import { type PathLike } from 'node:fs';
import { openDir } from '../open-dir/async.js';

export async function isEmptyDir(path: PathLike): Promise<boolean> {
	const dir = await openDir(path);
	if(dir.fails) {
		return false;
	}

	const read = await dir.value.read();
	if(read.fails) {
		return false;
	}

	return read.value === null;
}
