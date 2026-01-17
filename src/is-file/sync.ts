import { type PathLike } from 'node:fs';
import { stat } from '../fs/sync.js';

export function isFile(path: PathLike): boolean {
	const result = stat(path);
	if(result.fails) {
		return false;
	}

	return result.value.isFile();
}
