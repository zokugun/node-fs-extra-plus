import { type OpenDirOptions, type PathLike } from 'node:fs';
import fsa from 'node:fs/promises';
import { type Failure, ok, xtry } from '@zokugun/xtry/async';
import { type FsResult } from '../utils/types.js';
import { Dir } from './dir.js';

export async function openDir(path: PathLike, options?: OpenDirOptions): Promise<FsResult<Dir>> {
	const result = await xtry(async () => fsa.opendir(path, options));
	if(result.fails) {
		return result as Failure<NodeJS.ErrnoException>;
	}

	return ok(new Dir(result.value));
}

export const opendir = openDir;
