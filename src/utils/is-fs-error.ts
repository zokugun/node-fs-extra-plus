import { FsError } from '../types/fs-error.js';

export function isFsError(err: any): err is FsError {
	return err instanceof FsError;
}
