import type { PlatformPath } from '@zokugun/fs-path';
import type { FsResult } from './fs-result.js';
import type { FsVoidResult } from './fs-void-result.js';
import type { ReadStreamOptions, WriteStreamOptions } from './stream.js';
import type { StringifyJsonOptions } from './stringify-json.js';
import type { Globber, WalkItem, WalkOptions } from './walk.js';

export const typeExports = {
	FsResult: undefined as unknown as FsResult<unknown>,
	FsVoidResult: undefined as unknown as FsVoidResult,
	Globber: undefined as unknown as Globber,
	PlatformPath: undefined as unknown as PlatformPath,
	ReadStreamOptions: undefined as unknown as ReadStreamOptions,
	StringifyJsonOptions: undefined as unknown as StringifyJsonOptions,
	WriteStreamOptions: undefined as unknown as WriteStreamOptions,
	WalkItem: undefined as unknown as WalkItem,
	WalkOptions: undefined as unknown as WalkOptions,
};

/* eslint-disable unicorn/prefer-export-from */
export {
	type FsResult,
	type FsVoidResult,
	type Globber,
	type ReadStreamOptions,
	type StringifyJsonOptions,
	type WriteStreamOptions,
	type WalkItem,
	type WalkOptions,
};
/* eslint-enable unicorn/prefer-export-from */
