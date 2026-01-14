import { type Result } from '@zokugun/xtry';
import { type FsError } from './error.js';

export type FsResult<T> = Result<T, FsError | NodeJS.ErrnoException>;

export type FsVoidResult = Result<void, FsError | NodeJS.ErrnoException>;
