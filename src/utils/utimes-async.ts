import { futimes } from '../fs/async.js';
import { open } from '../open/async.js';
import { type FsVoidResult } from '../types/fs-void-result.js';

export async function utimesMillisAsync(path: string, atime: Date, mtime: Date): Promise<FsVoidResult> {
	const openResult = await open(path, 'r+');
	if(openResult.fails) {
		return openResult;
	}

	const file = openResult.value;

	const futResult = await futimes(file.fd, atime, mtime);

	const result = await file.close();
	if(result.fails) {
		return result;
	}

	return futResult;
}
