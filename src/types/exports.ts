import { type FsResult } from './fs-result.js';
import { type FsVoidResult } from './fs-void-result.js';

export const typeExports = {
	FsResult: undefined as unknown as FsResult<unknown>,
	FsVoidResult: undefined as unknown as FsVoidResult,
};

/* eslint-disable unicorn/prefer-export-from */
export {
	type FsResult,
	type FsVoidResult,
};
/* eslint-enable unicorn/prefer-export-from */
