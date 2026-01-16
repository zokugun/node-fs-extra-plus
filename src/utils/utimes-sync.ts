import { close, futimes, open } from '../fs/sync.js';
import { type FsVoidResult } from '../types/fs-void-result.js';

export function utimesMillisSync(path: string, atime: Date, mtime: Date): FsVoidResult {
	const openResult = open(path, 'r+');
	if(openResult.fails) {
		return openResult;
	}

	const fd = openResult.value;

	const futResult = futimes(fd, atime, mtime);

	const result = close(fd);
	if(result.fails) {
		return result;
	}

	return futResult;
}
