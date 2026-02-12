import { type FsResult } from './fs-result.js';
import { type FsVoidResult } from './fs-void-result.js';
import type { WalkItem, WalkOptions } from './walk.js';

export const typeExports = {
	FsResult: undefined as unknown as FsResult<unknown>,
	FsVoidResult: undefined as unknown as FsVoidResult,
	WalkItem: undefined as unknown as WalkItem,
	WalkOptions: undefined as unknown as WalkOptions,
};

/* eslint-disable unicorn/prefer-export-from */
export {
	type FsResult,
	type FsVoidResult,
	type WalkItem,
	type WalkOptions,
};
/* eslint-enable unicorn/prefer-export-from */
