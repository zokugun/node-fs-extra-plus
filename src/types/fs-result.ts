import { type Result } from '@zokugun/xtry';
import { type FsError } from './fs-error.js';

export type FsResult<T> = Result<T, FsError | NodeJS.ErrnoException>;
