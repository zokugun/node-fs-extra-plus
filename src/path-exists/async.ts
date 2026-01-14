import { type PathLike } from 'node:fs';
import { OK_FALSE, OK_TRUE, type Success } from '@zokugun/xtry';
import { access } from '../fs/async.js';

export async function pathExists(path: PathLike): Promise<Success<boolean>> {
	const result = await access(path);

	return result.fails ? OK_FALSE : OK_TRUE;
}
