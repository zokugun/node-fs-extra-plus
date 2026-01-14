import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, expect, it } from 'vitest';
import fse from '../../src/index.js';

const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'copy-sync-symlink');
const source = path.join(TEST_DIR, 'src');
const out = path.join(TEST_DIR, 'out');

beforeEach(async () => {
	await fse.emptyDirAsync(TEST_DIR);

	createFixtures(source);
});

function createFixtures(sourceDir: string) {
	fse.mkdirSync(sourceDir);

	const fooFile = path.join(sourceDir, 'foo');
	const fooFileLink = path.join(sourceDir, 'file-symlink');

	fse.writeFileSync(fooFile, 'foo contents');
	fse.symlinkSync(fooFile, fooFileLink, 'file');

	const dir = path.join(sourceDir, 'dir');
	const dirFile = path.join(dir, 'bar');
	const dirLink = path.join(sourceDir, 'dir-symlink');

	fs.mkdirSync(dir);
	fs.writeFileSync(dirFile, 'bar contents');
	fs.symlinkSync(dir, dirLink, 'dir');
}

afterEach(async () => {
	await fse.removeAsync(TEST_DIR);
});

it('copies symlinks by default', () => {
	const result = fse.copySync(source, out);
	expect(result.fails).to.be.false;

	expect(fs.readlinkSync(path.join(out, 'file-symlink'))).to.equals(path.join(source, 'foo'));
	expect(fs.readlinkSync(path.join(out, 'dir-symlink'))).to.equals(path.join(source, 'dir'));
});

it('copies file contents when dereference=true', () => {
	const result = fse.copySync(source, out, { dereference: true });
	expect(result.fails).to.be.false;

	const fileSymlinkPath = path.join(out, 'file-symlink');
	expect(fs.lstatSync(fileSymlinkPath).isFile()).to.be.true;
	expect(fs.readFileSync(fileSymlinkPath, 'utf8')).to.equals('foo contents');

	const dirSymlinkPath = path.join(out, 'dir-symlink');
	expect(fs.lstatSync(dirSymlinkPath).isDirectory()).to.be.true;
	expect(fs.readdirSync(dirSymlinkPath)).to.eql(['bar']);
});
