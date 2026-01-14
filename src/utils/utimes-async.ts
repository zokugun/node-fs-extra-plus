import { close, futimes, open } from '../fs/async.js';
import { type FsVoidResult } from './types.js';

export async function utimesMillisAsync(path: string, atime: Date, mtime: Date): Promise<FsVoidResult> {
	const openResult = await open(path, 'r+');
	if(openResult.fails) {
		return openResult;
	}

	const { fd } = openResult.value;

	const futResult = await futimes(fd, atime, mtime);

	const result = await close(fd);
	if(result.fails) {
		return result;
	}

	return futResult;
}
