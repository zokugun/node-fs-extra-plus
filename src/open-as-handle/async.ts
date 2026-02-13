import { type Mode, type PathLike } from 'node:fs';
import fsa from 'node:fs/promises';
import { type Failure, ok, xtry } from '@zokugun/xtry/async';
import { type FsResult } from '../async.js';
import { FileHandle } from '../types/file-handle.js';

export async function openAsHandle(path: PathLike, flags?: string | number, mode?: Mode): Promise<FsResult<FileHandle>> {
	const result = await xtry(async () => fsa.open(path, flags, mode));
	if(result.fails) {
		return result as Failure<NodeJS.ErrnoException>;
	}

	return ok(new FileHandle(result.value));
}
