import path from 'node:path';
import { mkdirs } from '../ensure-dir/async.js';
import { writeFile } from '../fs/async.js';
import { isExisting } from '../is-existing/async.js';

type WriteFileArgsWithoutFile = Parameters<typeof writeFile> extends [any, ...infer Rest] ? Rest : never;

export async function outputFile(file: string, ...args: WriteFileArgsWithoutFile): ReturnType<typeof writeFile> {
	const dir = path.dirname(file);

	if(!await isExisting(dir)) {
		const result = await mkdirs(dir);
		if(result.fails) {
			return result;
		}
	}

	return writeFile(file, ...args);
}
