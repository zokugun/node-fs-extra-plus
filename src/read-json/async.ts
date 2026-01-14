import { type PathLike } from 'node:fs';
import { err, parseJson, type Result } from '@zokugun/xtry/async';
import { readFile } from '../fs/async.js';
import { stripBom } from '../utils/strip-bom.js';

export async function readJson(file: PathLike, options: Parameters<typeof readFile>[1] & { reviver?: Parameters<typeof JSON.parse>[1] } = {}): Promise<Result<unknown, NodeJS.ErrnoException | SyntaxError>> {
	const result = await readFile(file, options);
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
