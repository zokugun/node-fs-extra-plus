import path from 'node:path';
import { writeFile } from '../fs/sync.js';
import { mkdirs } from '../make-dir/sync.js';
import { pathExists } from '../path-exists/sync.js';

type WriteFileArgsWithoutFile = Parameters<typeof writeFile> extends [any, ...infer Rest] ? Rest : never;

export function outputFile(file: string, ...args: WriteFileArgsWithoutFile): ReturnType<typeof writeFile> {
	const dir = path.dirname(file);

	if(!pathExists(dir).value) {
		const result = mkdirs(dir);
		if(result.fails) {
			return result;
		}
	}

	return writeFile(file, ...args);
}
