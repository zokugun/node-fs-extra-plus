import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from 'vitest';
import { symlinkPaths } from '../../src/create-symlink/sync.js';
import fse from '../../src/index.js';

const CWD = process.cwd();
const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'create-symlink-sync');

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
	fs.symlinkSync('foo.txt', 'real-symlink.txt');
	fs.symlinkSync('dir-foo', 'real-symlink-dir-foo');
});

afterEach(async () => {
	await fse.emptyDirAsync(TEST_DIR);
});

afterAll(async () => {
	process.chdir(CWD);

	await fse.removeAsync(TEST_DIR);
});

const tests: Array<[[string, string], string, string]> = [
	// [[srcpath, dstpath], fs.symlink expect, fse.ensureSymlink expect]
	[['./foo.txt', './symlink.txt'], 'file-success', 'file-success'],
	[['../foo.txt', './empty-dir/symlink.txt'], 'file-success', 'file-success'],
	[['../foo.txt', './empty-dir/symlink.txt'], 'file-success', 'file-success'],
	[['./foo.txt', './dir-foo/symlink.txt'], 'file-success', 'file-success'],
	[['./foo.txt', './empty-dir/symlink.txt'], 'file-broken', 'file-success'],
	[['./foo.txt', './real-alpha/symlink.txt'], 'file-broken', 'file-success'],
	[['./foo.txt', './real-alpha/real-beta/symlink.txt'], 'file-broken', 'file-success'],
	[['./foo.txt', './real-alpha/real-beta/real-gamma/symlink.txt'], 'file-broken', 'file-success'],
	[['./foo.txt', './alpha/symlink.txt'], 'file-error', 'file-success'],
	[['./foo.txt', './alpha/beta/symlink.txt'], 'file-error', 'file-success'],
	[['./foo.txt', './alpha/beta/gamma/symlink.txt'], 'file-error', 'file-success'],
	[['./foo.txt', './real-symlink.txt'], 'file-error', 'file-success'],
	[['./dir-foo/foo.txt', './real-symlink.txt'], 'file-error', 'file-error'],
	[['./missing.txt', './symlink.txt'], 'file-broken', 'file-error'],
	[['./missing.txt', './missing-dir/symlink.txt'], 'file-error', 'file-error'],
	// error is thrown if destination path exists
	[['./foo.txt', './dir-foo/foo.txt'], 'file-error', 'file-error'],
	[['./dir-foo', './symlink-dir-foo'], 'dir-success', 'dir-success'],
	[['../dir-bar', './dir-foo/symlink-dir-bar'], 'dir-success', 'dir-success'],
	[['./dir-bar', './dir-foo/symlink-dir-bar'], 'dir-broken', 'dir-success'],
	[['./dir-bar', './empty-dir/symlink-dir-bar'], 'dir-broken', 'dir-success'],
	[['./dir-bar', './real-alpha/symlink-dir-bar'], 'dir-broken', 'dir-success'],
	[['./dir-bar', './real-alpha/real-beta/symlink-dir-bar'], 'dir-broken', 'dir-success'],
	[['./dir-bar', './real-alpha/real-beta/real-gamma/symlink-dir-bar'], 'dir-broken', 'dir-success'],
	[['./dir-foo', './alpha/dir-foo'], 'dir-error', 'dir-success'],
	[['./dir-foo', './alpha/beta/dir-foo'], 'dir-error', 'dir-success'],
	[['./dir-foo', './alpha/beta/gamma/dir-foo'], 'dir-error', 'dir-success'],
	[['./dir-foo', './real-symlink-dir-foo'], 'dir-error', 'dir-success'],
	[['./dir-bar', './real-symlink-dir-foo'], 'dir-error', 'dir-error'],
	[['./missing', './dir-foo/symlink-dir-missing'], 'dir-broken', 'dir-error'],
	// error is thrown if destination path exists
	[['./dir-foo', './real-alpha/real-beta'], 'dir-error', 'dir-error'],
	[[path.resolve(path.join(TEST_DIR, './foo.txt')), './symlink.txt'], 'file-success', 'file-success'],
	[[path.resolve(path.join(TEST_DIR, './dir-foo/foo.txt')), './symlink.txt'], 'file-success', 'file-success'],
	[[path.resolve(path.join(TEST_DIR, './missing.txt')), './symlink.txt'], 'file-broken', 'file-error'],
	[[path.resolve(path.join(TEST_DIR, '../foo.txt')), './symlink.txt'], 'file-broken', 'file-error'],
	[[path.resolve(path.join(TEST_DIR, '../dir-foo/foo.txt')), './symlink.txt'], 'file-broken', 'file-error'],
];

for(const test of tests) {
	const args = test[0];
	const newBehavior = test[2];

	if(newBehavior === 'file-success') {
		fileSuccess(args);
	}
	else if(newBehavior === 'file-broken') {
		fileBroken(args);
	}
	else if(newBehavior === 'file-error') {
		fileError(args);
	}
	else if(newBehavior === 'dir-success') {
		dirSuccess(args);
	}
	else if(newBehavior === 'dir-broken') {
		dirBroken(args);
	}
	else if(newBehavior === 'dir-error') {
		dirError(args);
	}
}

function fileSuccess(args: [string, string]) { // {{{
	const srcpath = args[0];
	const dstpath = args[1];

	it(`should create symlink file using src ${srcpath} and dst ${dstpath}`, () => {
		const result = fse.createSymlinkSync(...args);
		expect(result.fails).to.be.false;

		const relative = symlinkPaths(srcpath, dstpath);
		expect(relative.fails).to.be.false;

		const isSymlink = fs.lstatSync(dstpath).isSymbolicLink();
		expect(isSymlink).to.be.true;

		const destinationDir = path.dirname(dstpath);
		const destinationBasename = path.basename(dstpath);
		const destinationDirContents = fs.readdirSync(destinationDir);
		expect(destinationDirContents.includes(destinationBasename)).to.be.true;

		const sourceContent = fs.readFileSync(relative.value!.toCwd, 'utf8');
		const destinationContent = fs.readFileSync(dstpath, 'utf8');
		expect(destinationContent).to.equals(sourceContent);
	});
} // }}}

function fileBroken(args: [string, string]) { // {{{
	const srcpath = args[0];
	const dstpath = args[1];

	it(`should create broken symlink file using src ${srcpath} and dst ${dstpath}`, () => {
		const result = fse.createSymlinkSync(...args);
		expect(result.fails).to.be.false;

		const isSymlink = fs.lstatSync(dstpath).isSymbolicLink();
		expect(isSymlink).to.be.true;

		const destinationDir = path.dirname(dstpath);
		const destinationBasename = path.basename(dstpath);
		const destinationDirContents = fs.readdirSync(destinationDir);
		expect(destinationDirContents.includes(destinationBasename)).to.be.true;

		const destinationContent = fse.readFileSync(dstpath, 'utf8');
		expect(destinationContent.fails).to.be.true;
	});
} // }}}

function fileError(args: [string, string]) { // {{{
	const srcpath = args[0];
	const dstpath = args[1];

	it(`should return error when creating symlink file using src ${srcpath} and dst ${dstpath}`, () => {
		const dstdirExistsBefore = fs.existsSync(path.dirname(dstpath));

		const result = fse.createSymlinkSync(...args);
		expect(result.fails).to.be.true;

		// ensure that directories aren't created if there's an error
		const dstdirExistsAfter = fs.existsSync(path.dirname(dstpath));
		expect(dstdirExistsAfter).to.equals(dstdirExistsBefore);
	});
} // }}}

function dirSuccess(args: [string, string]) { // {{{
	const srcpath = args[0];
	const dstpath = args[1];

	it(`should create symlink dir using src ${srcpath} and dst ${dstpath}`, () => {
		const result = fse.createSymlinkSync(...args);
		expect(result.fails).to.be.false;

		const relative = symlinkPaths(srcpath, dstpath);
		expect(relative.fails).to.be.false;

		const isSymlink = fs.lstatSync(dstpath).isSymbolicLink();
		expect(isSymlink).to.be.true;

		const destinationDir = path.dirname(dstpath);
		const destinationBasename = path.basename(dstpath);
		const destinationDirContents = fs.readdirSync(destinationDir);
		expect(destinationDirContents.includes(destinationBasename)).to.be.true;

		const sourceContent = fs.readdirSync(relative.value!.toCwd);
		const destinationContents = fs.readdirSync(dstpath);
		expect(destinationContents).to.eql(sourceContent);
	});
} // }}}

function dirBroken(args: [string, string]) { // {{{
	const srcpath = args[0];
	const dstpath = args[1];

	it(`should create broken symlink dir using src ${srcpath} and dst ${dstpath}`, () => {
		const result = fse.createSymlinkSync(...args);
		expect(result.fails).to.be.false;

		const isSymlink = fs.lstatSync(dstpath).isSymbolicLink();
		expect(isSymlink).to.be.true;

		const destinationDir = path.dirname(dstpath);
		const destinationBasename = path.basename(dstpath);
		const destinationDirContents = fs.readdirSync(destinationDir);
		expect(destinationDirContents.includes(destinationBasename)).to.be.true;

		const destinationContent = fse.readdirSync(dstpath, 'utf8');
		expect(destinationContent.fails).to.be.true;
	});
} // }}}

function dirError(args: [string, string]) { // {{{
	const srcpath = args[0];
	const dstpath = args[1];

	it(`should return error when creating symlink dir using src ${srcpath} and dst ${dstpath}`, () => {
		const dstdirExistsBefore = fs.existsSync(path.dirname(dstpath));

		const result = fse.createSymlinkSync(...args);
		expect(result.fails).to.be.true;

		// ensure that directories aren't created if there's an error
		const dstdirExistsAfter = fs.existsSync(path.dirname(dstpath));
		expect(dstdirExistsAfter).to.equals(dstdirExistsBefore);
	});
} // }}}
