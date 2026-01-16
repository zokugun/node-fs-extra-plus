import { type OpenDirOptions, type PathLike } from 'node:fs';
import fsa from 'node:fs/promises';
import { type Failure, ok, xtry } from '@zokugun/xtry/async';
import { Dir } from '../types/dir.js';
import { type FsResult } from '../types/fs-result.js';

export async function openDir(path: PathLike, options?: OpenDirOptions): Promise<FsResult<Dir>> {
	const result = await xtry(async () => fsa.opendir(path, options));
	if(result.fails) {
		return result as Failure<NodeJS.ErrnoException>;
	}

	return ok(new Dir(result.value));
}

export const opendir = openDir;
