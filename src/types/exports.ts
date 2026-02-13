import { type FsResult } from './fs-result.js';
import { type FsVoidResult } from './fs-void-result.js';
import { type ReadStreamOptions, type WriteStreamOptions } from './stream.js';
import type { WalkItem, WalkOptions } from './walk.js';

export const typeExports = {
	FsResult: undefined as unknown as FsResult<unknown>,
	FsVoidResult: undefined as unknown as FsVoidResult,
	ReadStreamOptions: undefined as unknown as ReadStreamOptions,
	WriteStreamOptions: undefined as unknown as WriteStreamOptions,
	WalkItem: undefined as unknown as WalkItem,
	WalkOptions: undefined as unknown as WalkOptions,
};

/* eslint-disable unicorn/prefer-export-from */
export {
	type FsResult,
	type FsVoidResult,
	type ReadStreamOptions,
	type WriteStreamOptions,
	type WalkItem,
	type WalkOptions,
};
/* eslint-enable unicorn/prefer-export-from */
