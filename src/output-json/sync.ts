import type fs from 'node:fs';
import { outputFile } from '../output-file/sync.js';
import { stringifyJson, type StringifyJsonOptions } from '../utils/stringify-json.js';

export function outputJson(file: string, value: any, options?: fs.WriteFileOptions & StringifyJsonOptions): ReturnType<typeof outputFile> {
	const str = stringifyJson(value, options);

	return outputFile(file, str, options);
}

export const outputJSON = outputJson;
