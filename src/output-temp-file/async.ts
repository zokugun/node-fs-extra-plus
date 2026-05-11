import { type WriteFileOptions } from 'node:fs';
import { writeFile } from '../fs/async.js';
import { makeTempFile } from '../make-temp-file/async.js';
import { type MakeTempFileOptions } from '../make-temp-file/options.js';

export async function outputTempFile(data: string | NodeJS.ArrayBufferView, options?: WriteFileOptions & MakeTempFileOptions): ReturnType<typeof makeTempFile> {
	const file = await makeTempFile(options);
	if(file.fails) {
		return file;
	}

	const path = options?.defer ? (file.value as { path: string }).path : (file.value as string);

	const result = await writeFile(path, data, options);
	if(result.fails) {
		return result;
	}

	return file;
}
