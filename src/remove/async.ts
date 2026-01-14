import { type PathLike } from 'node:fs';
import { rm } from '../fs/async.js';

export async function remove(path: PathLike): ReturnType<typeof rm> {
	return rm(path, { recursive: true, force: true });
}
