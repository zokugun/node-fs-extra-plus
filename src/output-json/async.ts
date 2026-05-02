import type fs from 'node:fs';
import { outputFile } from '../output-file/async.js';
import { stringifyJson } from '../stringify-json/index.js';
import { type StringifyJsonOptions } from '../types/stringify-json.js';

export async function outputJson(file: string, value: any, options?: fs.WriteFileOptions & StringifyJsonOptions): ReturnType<typeof outputFile> {
	const str = stringifyJson(value, options);

	return outputFile(file, str, options);
}

export const outputJSON = outputJson;
