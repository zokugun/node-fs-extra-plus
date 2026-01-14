import path from 'node:path';
import { exists, writeFile } from '../fs/async.js';
import { mkdirs } from '../make-dir/async.js';

type WriteFileArgsWithoutFile = Parameters<typeof writeFile> extends [any, ...infer Rest] ? Rest : never;

export async function outputFile(file: string, ...args: WriteFileArgsWithoutFile): ReturnType<typeof writeFile> {
	const dir = path.dirname(file);
	const doExists = await exists(dir);

	if(!doExists.value) {
		const result = await mkdirs(dir);
		if(result.fails) {
			return result;
		}
	}

	return writeFile(file, ...args);
}
