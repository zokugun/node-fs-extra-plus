import fs, { type OpenDirOptions, type PathLike } from 'node:fs';
import { type Failure, ok, xtry } from '@zokugun/xtry/sync';
import { type FsResult } from '../utils/types.js';
import { Dir } from './dir.js';

export function openDir(path: PathLike, options?: OpenDirOptions): FsResult<Dir> {
	const result = xtry(() => fs.opendirSync(path, options));
	if(result.fails) {
		return result as Failure<NodeJS.ErrnoException>;
	}

	return ok(new Dir(result.value));
}

export const opendir = openDir;
