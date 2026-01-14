import { type PathLike } from 'node:fs';
import { err, parseJson, type Result } from '@zokugun/xtry/sync';
import { readFile } from '../fs/sync.js';
import { stripBom } from '../utils/strip-bom.js';

export function readJson(file: PathLike, options: Parameters<typeof readFile>[1] & { reviver?: Parameters<typeof JSON.parse>[1] } = {}): Result<unknown, NodeJS.ErrnoException | SyntaxError> {
	const result = readFile(file, options);
	if(result.fails) {
		return result;
	}

	const content = stripBom(result.value);

	const data = parseJson(content, options.reviver);
	if(data.fails) {
		const error = data.error;

		error.message = `${String(file)}: ${error.message}`;

		return err(error);
	}

	return data;
}

export const readJSON = readJson;
