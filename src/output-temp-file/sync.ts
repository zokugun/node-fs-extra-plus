import { type WriteFileOptions } from 'node:fs';
import { writeFile } from '../fs/sync.js';
import { type MakeTempFileOptions } from '../make-temp-file/options.js';
import { makeTempFile } from '../make-temp-file/sync.js';

export function outputTempFile(data: string | NodeJS.ArrayBufferView, options?: WriteFileOptions & MakeTempFileOptions): ReturnType<typeof makeTempFile> {
	const file = makeTempFile(options);
	if(file.fails) {
		return file;
	}

	const path = options?.defer ? (file.value as { path: string }).path : (file.value as string);

	const result = writeFile(path, data, options);
	if(result.fails) {
		return result;
	}

	return file;
}
