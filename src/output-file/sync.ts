import path from 'node:path';
import { mkdirs } from '../ensure-dir/sync.js';
import { writeFile } from '../fs/sync.js';
import { isExisting } from '../is-existing/sync.js';

type WriteFileArgsWithoutFile = Parameters<typeof writeFile> extends [any, ...infer Rest] ? Rest : never;

export function outputFile(file: string, ...args: WriteFileArgsWithoutFile): ReturnType<typeof writeFile> {
	const dir = path.dirname(file);

	if(!isExisting(dir)) {
		const result = mkdirs(dir);
		if(result.fails) {
			return result;
		}
	}

	return writeFile(file, ...args);
}
