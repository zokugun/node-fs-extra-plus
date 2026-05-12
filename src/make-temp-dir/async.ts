import path from 'node:path';
import { isString } from '@zokugun/is-it-type';
import { err, ok, xdefer, type XDeferAsync } from '@zokugun/xtry/async';
import { mkdirs } from '../ensure-dir/async.js';
import { mkdtemp, rm } from '../fs/async.js';
import { isSafeSegment } from '../is-safe-segment/index.js';
import { FsError } from '../types/fs-error.js';
import { type FsResult } from '../types/fs-result.js';
import { getTempDirAsync } from '../utils/get-temp-dir.js';
import { type MakeTempDirOptions } from './options.js';

export async function makeTempDir(options: MakeTempDirOptions & { defer: true }): Promise<FsResult<{ path: string; remove: XDeferAsync<FsError | NodeJS.ErrnoException> }>>;
export async function makeTempDir(options?: MakeTempDirOptions & { defer?: false }): Promise<FsResult<string>>;
export async function makeTempDir(options?: MakeTempDirOptions): Promise<FsResult<string | { path: string; remove: XDeferAsync<FsError | NodeJS.ErrnoException> }>>;
export async function makeTempDir({ defer = false, parent = '', prefix = '', root }: MakeTempDirOptions = {}): Promise<FsResult<string | { path: string; remove: XDeferAsync<FsError | NodeJS.ErrnoException> }>> {
	if(parent.length > 0 && !isSafeSegment(parent)) {
		return err(new FsError(`Unsafe parent: ${parent}`));
	}

	if(prefix.length > 0 && !isSafeSegment(prefix)) {
		return err(new FsError(`Unsafe prefix: ${prefix}`));
	}

	if(isString(root) && !path.isAbsolute(root)) {
		return err(new FsError(`Unsafe root: ${root}`));
	}

	const parentPath = path.join(root ?? await getTempDirAsync(), parent);

	const mkdResult = await mkdirs(parentPath);
	if(mkdResult.fails) {
		return mkdResult;
	}

	const dir = await mkdtemp(path.join(parentPath, prefix));
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

async function remove(dir: string): ReturnType<typeof rm> {
	return rm(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
}
