import { type PathLike } from 'node:fs';
import { access } from '../fs/sync.js';

export function isExisting(path: PathLike): boolean {
	const result = access(path);

	return !result.fails;
}
