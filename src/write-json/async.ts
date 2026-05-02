import { type PathLike, type WriteFileOptions } from 'node:fs';
import { writeFile } from '../fs/async.js';
import { stringifyJson } from '../stringify-json/index.js';
import { type StringifyJsonOptions } from '../types/stringify-json.js';

export async function writeJson(file: PathLike, value: any, options?: WriteFileOptions & StringifyJsonOptions): ReturnType<typeof writeFile> {
	const str = stringifyJson(value, options);

	return writeFile(file, str, options);
}

export const writeJSON = writeJson;
