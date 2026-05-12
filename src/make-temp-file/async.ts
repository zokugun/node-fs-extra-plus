import path from 'node:path';
import { isString } from '@zokugun/is-it-type';
import { err, ok, xdefer, type XDeferAsync } from '@zokugun/xtry/async';
import { mkdirs } from '../ensure-dir/async.js';
import { rm } from '../fs/async.js';
import { isSafeSegment } from '../is-safe-segment/index.js';
import { FsError } from '../types/fs-error.js';
import { type FsResult } from '../types/fs-result.js';
import { generateTempName } from '../utils/generate-temp-name.js';
import { getTempDirAsync } from '../utils/get-temp-dir.js';
import { type MakeTempFileOptions } from './options.js';

export async function makeTempFile(options: MakeTempFileOptions & { defer: true }): Promise<FsResult<{ path: string; remove: XDeferAsync<FsError | NodeJS.ErrnoException> }>>;
export async function makeTempFile(options?: MakeTempFileOptions & { defer?: false }): Promise<FsResult<string>>;
export async function makeTempFile(options?: MakeTempFileOptions): Promise<FsResult<string | { path: string; remove: XDeferAsync<FsError | NodeJS.ErrnoException> }>>;
export async function makeTempFile({ defer = false, extension, name, parent = '', root }: MakeTempFileOptions = {}): Promise<FsResult<string | { path: string; remove: XDeferAsync<FsError | NodeJS.ErrnoException> }>> {
	if(parent.length > 0 && !isSafeSegment(parent)) {
		return err(new FsError(`Unsafe parent: ${parent}`));
	}

	if(isString(root) && !path.isAbsolute(root)) {
		return err(new FsError(`Unsafe root: ${root}`));
	}

	const dir = path.join(root ?? await getTempDirAsync(), parent);

	if(isString(name)) {
		if(isString(extension)) {
			return err(new FsError('Cannot use \'extension\' and \'name\' options at the same time'));
		}

		if(isSafeSegment(name)) {
			return err(new FsError(`Unsafe name: ${name}`));
		}
	}
	else {
		if(isString(extension)) {
			if(isSafeSegment(extension)) {
				return err(new FsError(`Unsafe extension: ${extension}`));
			}

			const tempName = generateTempName();

			name = `${tempName}.${extension.replace(/^\./, '')}`;
		}
		else {
			name = generateTempName();
		}
	}

	const result = await mkdirs(dir);
	if(result.fails) {
		return result;
	}

	const file = path.join(dir, name);

	if(defer) {
		return ok({
			path: file,
			remove: xdefer(remove, null, file),
		});
	}
	else {
		return ok(file);
	}
}

async function remove(file: string): ReturnType<typeof rm> {
	return rm(file, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
}
