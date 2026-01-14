import { type MakeDirectoryOptions, type Mode, type PathLike } from 'node:fs';
import { isNullable, isNumber, isPrimitive } from '@zokugun/is-it-type';
import { mkdir } from '../fs/sync.js';

function makeDir(dir: PathLike, options?: Mode | MakeDirectoryOptions | null): ReturnType<typeof mkdir> {
	let mode: number;

	if(isNullable(options)) {
		mode = 0o777;
	}
	else if(isPrimitive(options)) {
		mode = Number(options);
	}
	else if(isNumber(options.mode)) {
		mode = Number(options.mode);
	}
	else {
		mode = 0o777;
	}

	return mkdir(dir, {
		mode,
		recursive: true,
	});
}

export const mkdirs = makeDir;
export const mkdirp = makeDir;
export const ensureDir = makeDir;
