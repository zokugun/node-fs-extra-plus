import type * as fs from 'node:fs';
import path from 'node:path';
import { isNodeError } from '@zokugun/is-it-type';
import type { SyncResult } from '@zokugun/xtry/sync';
import { expect, expectTypeOf, it } from 'vitest';
import fse from '../../src/sync.js';

type FsResult<Fn extends (...args: any[]) => unknown> = SyncResult<Fn, NodeJS.ErrnoException>;
type Wrapped<Fn extends (...args: any[]) => unknown> = (...args: Parameters<Fn>) => FsResult<Fn>;
type ReaddirStrings = (path: fs.PathLike, options?: {
	encoding: BufferEncoding | null;
	withFileTypes?: false | undefined;
	recursive?: boolean | undefined;
} | BufferEncoding | null) => string[];

type ReaddirBuffers = (path: fs.PathLike, options: {
	encoding: 'buffer';
	withFileTypes?: false | undefined;
	recursive?: boolean | undefined;
} | 'buffer') => NonSharedBuffer[];

type ReaddirMixed = (path: fs.PathLike, options?: (fs.ObjectEncodingOptions & {
	withFileTypes?: false | undefined;
	recursive?: boolean | undefined;
}) | BufferEncoding | null) => string[] | NonSharedBuffer[];

type ReaddirDirents = (path: fs.PathLike, options: fs.ObjectEncodingOptions & {
	withFileTypes: true;
	recursive?: boolean | undefined;
}) => fs.Dirent[];

type ReaddirDirentBuffers = (path: fs.PathLike, options: {
	encoding: 'buffer';
	withFileTypes: true;
	recursive?: boolean | undefined;
}) => Array<fs.Dirent<NonSharedBuffer>>;

type ExpectedReaddir =
	& Wrapped<ReaddirStrings>
	& Wrapped<ReaddirBuffers>
	& Wrapped<ReaddirMixed>
	& Wrapped<ReaddirDirents>
	& Wrapped<ReaddirDirentBuffers>;

it('stat', () => { // {{{
	const result = fse.stat(__filename);

	expect(result.fails).to.be.false;
	expect(result.value).toBeTypeOf('object');
	expect(result.value!.size).toBeTypeOf('number');
}); // }}}

it('glob', () => { // {{{
	if(fse.glob) {
		const root = path.join(__dirname, '..');
		const iterable = fse.glob(path.join(__filename, '**'));

		for(const result of iterable) {
			expect(result.fails).to.be.false;
			expect(result.value).toBeTypeOf('string');
			expect(path.relative(root, result.value!)).to.be.equals(path.join('fs', 'sync.test.ts'));
		}
	}
}); // }}}

it('exits - true', () => { // {{{
	const result = fse.exists(__filename);

	expect(result.fails).to.be.false;
	expect(result.value).toBeTypeOf('boolean');
	expect(result.value).to.be.true;
}); // }}}

it('exits - false', () => { // {{{
	const result = fse.exists(`${__filename}.ts`);

	expect(result.fails).to.be.false;
	expect(result.value).toBeTypeOf('boolean');
	expect(result.value).to.be.false;
}); // }}}

it('readdir', () => { // {{{
	expectTypeOf(fse.readdir).toEqualTypeOf<ExpectedReaddir>();
}); // }}}

it('readFile - success', () => { // {{{
	const result = fse.readFile(__filename, 'utf8');

	expect(result.fails).to.be.false;
	expect(result.value).toBeTypeOf('string');
	expect(result.value?.startsWith('import type *')).to.be.true;
}); // }}}

it('readFile - fails', () => { // {{{
	const result = fse.readFile(`${__filename}.ts`, 'utf8');

	expect(result.fails).to.be.true;
	expect(result.error).toBeTypeOf('object');
	expect(isNodeError(result.error)).to.be.true;
	expect(result.error!.code).to.be.equals('ENOENT');

	expectTypeOf(result.error!).toEqualTypeOf<NodeJS.ErrnoException>();
}); // }}}
