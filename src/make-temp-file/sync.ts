import path from 'node:path';
import { isSafeSegment } from '@zokugun/fs-path';
import { isString } from '@zokugun/is-it-type';
import { err, ok, xdefer, type XDeferSync } from '@zokugun/xtry/sync';
import { mkdirs } from '../ensure-dir/sync.js';
import { rm } from '../fs/sync.js';
import { FsError } from '../types/fs-error.js';
import { type FsResult } from '../types/fs-result.js';
import { generateTempName } from '../utils/generate-temp-name.js';
import { getTempDirSync } from '../utils/get-temp-dir.js';
import { type MakeTempFileOptions } from './options.js';

export function makeTempFile(options: MakeTempFileOptions & { defer: true }): FsResult<{ path: string; remove: XDeferSync<FsError | NodeJS.ErrnoException> }>;
export function makeTempFile(options?: MakeTempFileOptions & { defer?: false }): FsResult<string>;
export function makeTempFile(options?: MakeTempFileOptions): FsResult<string | { path: string; remove: XDeferSync<FsError | NodeJS.ErrnoException> }>;
export function makeTempFile({ defer = false, extension, name, parent = '', root }: MakeTempFileOptions = {}): FsResult<string | { path: string; remove: XDeferSync<FsError | NodeJS.ErrnoException> }> {
	if(parent.length > 0 && !isSafeSegment(parent)) {
		return err(new FsError(`Unsafe parent: ${parent}`));
	}

	if(isString(root) && !path.isAbsolute(root)) {
		return err(new FsError(`Unsafe root: ${root}`));
	}

	const dir = path.join(root ?? getTempDirSync(), parent);

	if(isString(name)) {
		if(isString(extension)) {
			return err(new FsError('Cannot use \'extension\' and \'name\' options at the same time'));
		}

		if(!isSafeSegment(name)) {
			return err(new FsError(`Unsafe name: ${name}`));
		}
	}
	else {
		if(isString(extension)) {
			if(!isSafeSegment(extension)) {
				return err(new FsError(`Unsafe extension: ${extension}`));
			}

			const tempName = generateTempName();

			name = `${tempName}.${extension.replace(/^\./, '')}`;
		}
		else {
			name = generateTempName();
		}
	}

	const result = mkdirs(dir);
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

function remove(file: string): ReturnType<typeof rm> {
	return rm(file, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
}
