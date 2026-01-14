import { type PathLike } from 'node:fs';
import { OK_FALSE, OK_TRUE, type Success } from '@zokugun/xtry';
import { access } from '../fs/sync.js';

export function pathExists(path: PathLike): Success<boolean> {
	const result = access(path);

	return result.fails ? OK_FALSE : OK_TRUE;
}
