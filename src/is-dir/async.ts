import { type PathLike } from 'node:fs';
import { stat } from '../fs/async.js';

export async function isDir(path: PathLike): Promise<boolean> {
	const result = await stat(path);
	if(result.fails) {
		return false;
	}

	return result.value.isDirectory();
}
