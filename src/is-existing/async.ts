import { type PathLike } from 'node:fs';
import { access } from '../fs/async.js';

export async function isExisting(path: PathLike): Promise<boolean> {
	const result = await access(path);

	return !result.fails;
}
