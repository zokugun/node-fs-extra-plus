import type { BigIntStats, Mode } from 'node:fs';
import type { FsResult, FsVoidResult } from './types.js';

export const typeExports = {
	BigIntStats: undefined as unknown as BigIntStats,
	FsResult: undefined as unknown as FsResult<unknown>,
	FsVoidResult: undefined as unknown as FsVoidResult,
	Mode: undefined as unknown as Mode,
};

/* eslint-disable unicorn/prefer-export-from */
export {
	type BigIntStats,
	type FsResult,
	type FsVoidResult,
	type Mode,
};
/* eslint-enable unicorn/prefer-export-from */
