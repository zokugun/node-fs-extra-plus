import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from 'vitest';
import fse from '../../src/index.js';

const CWD = process.cwd();
const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'create-link-sync');

beforeAll(async () => {
	await fse.emptyDirAsync(TEST_DIR);

	process.chdir(TEST_DIR);
});

beforeEach(async () => {
	fs.writeFileSync('./foo.txt', 'foo\n');
	fse.mkdirsSync('empty-dir');
	fse.mkdirsSync('dir-foo');
	fs.writeFileSync('dir-foo/foo.txt', 'dir-foo\n');
	fse.mkdirsSync('dir-bar');
	fs.writeFileSync('dir-bar/bar.txt', 'dir-bar\n');
	fse.mkdirsSync('real-alpha/real-beta/real-gamma');
	fs.linkSync('foo.txt', 'link-foo.txt');
});

afterEach(async () => {
	await fse.emptyDirAsync(TEST_DIR);
});

afterAll(async () => {
	process.chdir(CWD);

	await fse.removeAsync(TEST_DIR);
});

const tests: Array<[[string, string], string, string]> = [
	// [[srcpath, dstpath], fs.link expect, ensureLink expect]
	[['./foo.txt', './link.txt'], 'file-success', 'file-success'],
	[['./foo.txt', './dir-foo/link.txt'], 'file-success', 'file-success'],
	[['./foo.txt', './empty-dir/link.txt'], 'file-success', 'file-success'],
	[['./foo.txt', './real-alpha/link.txt'], 'file-success', 'file-success'],
	[['./foo.txt', './real-alpha/real-beta/link.txt'], 'file-success', 'file-success'],
	[['./foo.txt', './real-alpha/real-beta/real-gamma/link.txt'], 'file-success', 'file-success'],
	[['./foo.txt', './alpha/link.txt'], 'file-error', 'file-success'],
	[['./foo.txt', './alpha/beta/link.txt'], 'file-error', 'file-success'],
	[['./foo.txt', './alpha/beta/gamma/link.txt'], 'file-error', 'file-success'],
	[['./foo.txt', './link-foo.txt'], 'file-error', 'file-success'],
	[['./dir-foo/foo.txt', './link-foo.txt'], 'file-error', 'file-error'],
	[['./missing.txt', './link.txt'], 'file-error', 'file-error'],
	[['./missing.txt', './missing-dir/link.txt'], 'file-error', 'file-error'],
	[['./foo.txt', './link.txt'], 'file-success', 'file-success'],
	[['./dir-foo/foo.txt', './link.txt'], 'file-success', 'file-success'],
	[['./missing.txt', './link.txt'], 'file-error', 'file-error'],
	[['../foo.txt', './link.txt'], 'file-error', 'file-error'],
	[['../dir-foo/foo.txt', './link.txt'], 'file-error', 'file-error'],
	// error is thrown if destination path exists
	[['./foo.txt', './dir-foo/foo.txt'], 'file-error', 'file-error'],
	[[path.resolve(path.join(TEST_DIR, './foo.txt')), './link.txt'], 'file-success', 'file-success'],
	[[path.resolve(path.join(TEST_DIR, './dir-foo/foo.txt')), './link.txt'], 'file-success', 'file-success'],
	[[path.resolve(path.join(TEST_DIR, './missing.txt')), './link.txt'], 'file-error', 'file-error'],
	[[path.resolve(path.join(TEST_DIR, '../foo.txt')), './link.txt'], 'file-error', 'file-error'],
	[[path.resolve(path.join(TEST_DIR, '../dir-foo/foo.txt')), './link.txt'], 'file-error', 'file-error'],
];

for(const test of tests) {
	const args = test[0];
	const newBehavior = test[2];

	if(newBehavior === 'file-success') {
		fileSuccess(args);
	}
	else if(newBehavior === 'file-error') {
		fileError(args);
	}
}

function fileSuccess(args: [string, string]) { // {{{
	const srcpath = args[0];
	const dstpath = args[1];

	it(`should create link file using src ${srcpath} and dst ${dstpath}`, () => {
		const result = fse.createLinkSync(...args);
		expect(result.fails).to.be.false;

		const isFile = fs.lstatSync(dstpath).isFile();
		expect(isFile).to.be.true;

		const destinationDir = path.dirname(dstpath);
		const destinationBasename = path.basename(dstpath);
		const destinationDirContents = fs.readdirSync(destinationDir);
		expect(destinationDirContents.includes(destinationBasename)).to.be.true;

		const sourceContent = fs.readFileSync(srcpath, 'utf8');
		const destinationContent = fs.readFileSync(dstpath, 'utf8');
		expect(destinationContent).to.equals(sourceContent);
	});
} // }}}

function fileError(args: [string, string]) { // {{{
	const srcpath = args[0];
	const dstpath = args[1];

	it(`should return error when creating link file using src ${srcpath} and dst ${dstpath}`, () => {
		const dstdirExistsBefore = fs.existsSync(path.dirname(dstpath));

		const result = fse.createLinkSync(...args);
		expect(result.fails).to.be.true;

		// ensure that directories aren't created if there's an error
		const dstdirExistsAfter = fs.existsSync(path.dirname(dstpath));
		expect(dstdirExistsAfter).to.equals(dstdirExistsBefore);
	});
} // }}}
