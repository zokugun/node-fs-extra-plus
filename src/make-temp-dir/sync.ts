import path from 'node:path';
import { isString } from '@zokugun/is-it-type';
import { err, ok, xdefer, type XDeferSync } from '@zokugun/xtry/sync';
import { mkdirs } from '../ensure-dir/sync.js';
import { mkdtemp, rm } from '../fs/sync.js';
import { isSafeSegment } from '../is-safe-segment/index.js';
import { FsError } from '../types/fs-error.js';
import { type FsResult } from '../types/fs-result.js';
import { getTempDirSync } from '../utils/get-temp-dir.js';
import { type MakeTempDirOptions } from './options.js';

export function makeTempDir(options: MakeTempDirOptions & { defer: true }): FsResult<{ path: string; remove: XDeferSync<FsError | NodeJS.ErrnoException> }>;
export function makeTempDir(options?: MakeTempDirOptions & { defer?: false }): FsResult<string>;
export function makeTempDir(options?: MakeTempDirOptions): FsResult<string | { path: string; remove: XDeferSync<FsError | NodeJS.ErrnoException> }>;
export function makeTempDir({ defer = false, parent = '', prefix = '', root }: MakeTempDirOptions = {}): FsResult<string | { path: string; remove: XDeferSync<FsError | NodeJS.ErrnoException> }> {
	if(parent.length > 0 && !isSafeSegment(parent)) {
		return err(new FsError(`Unsafe parent: ${parent}`));
	}

	if(prefix.length > 0 && !isSafeSegment(prefix)) {
		return err(new FsError(`Unsafe prefix: ${prefix}`));
	}

	if(isString(root) && !path.isAbsolute(root)) {
		return err(new FsError(`Unsafe root: ${root}`));
	}

	const parentPath = path.join(root ?? getTempDirSync(), parent);

	const mkdResult = mkdirs(parentPath);
	if(mkdResult.fails) {
		return mkdResult;
	}

	const dir = mkdtemp(path.join(parentPath, prefix));
	if(dir.fails) {
		return dir;
	}

	if(defer) {
		return ok({
			path: dir.value,
			remove: xdefer(remove, null, dir.value),
		});
	}
	else {
		return ok(dir.value);
	}
}

function remove(dir: string): ReturnType<typeof rm> {
	return rm(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
}

