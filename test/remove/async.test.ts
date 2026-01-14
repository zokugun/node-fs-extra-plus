import { randomBytes } from 'crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { afterEach, beforeEach, expect, it } from 'vitest';
import fse from '../../src/index.js';

const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'remove-async');

function buildFixtureDir() {
	const buf = randomBytes(5);
	const baseDir = path.join(TEST_DIR, `test-fs-extra-remove-async-${Date.now()}`);

	fs.mkdirSync(baseDir);
	fs.writeFileSync(path.join(baseDir, String(Math.random())), buf);
	fs.writeFileSync(path.join(baseDir, String(Math.random())), buf);

	const subDir = path.join(TEST_DIR, String(Math.random()));
	fs.mkdirSync(subDir);
	fs.writeFileSync(path.join(subDir, String(Math.random())), buf);
	return baseDir;
}

beforeEach(async () => {
	await fse.emptyDirAsync(TEST_DIR);
});

afterEach(async () => {
	await fse.removeAsync(TEST_DIR);
});

it('should delete an empty directory', async () => {
	expect(fs.existsSync(TEST_DIR)).to.be.true;

	const result = await fse.removeAsync(TEST_DIR);

	expect(result.fails).to.be.false;
	expect(fs.existsSync(TEST_DIR)).to.be.false;
});

it('should delete a directory full of directories and files', async () => {
	buildFixtureDir();

	expect(fs.existsSync(TEST_DIR)).to.be.true;

	const result = await fse.removeAsync(TEST_DIR);

	expect(result.fails).to.be.false;
	expect(fs.existsSync(TEST_DIR)).to.be.false;
});

it('should delete a file', async () => {
	const file = path.join(TEST_DIR, 'file');
	fs.writeFileSync(file, 'hello');

	expect(fs.existsSync(file)).to.be.true;

	const result = await fse.removeAsync(file);

	expect(result.fails).to.be.false;
	expect(fs.existsSync(file)).to.be.false;
	expect(fs.existsSync(TEST_DIR)).to.be.true;
});

it.skipIf(process.platform === 'win32')('should not delete glob matches', async () => {
	const file = path.join(TEST_DIR, 'file?');
	fs.writeFileSync(file, 'hello');

	const wrongFile = path.join(TEST_DIR, 'file1');
	fs.writeFileSync(wrongFile, 'yo');

	expect(fs.existsSync(file)).to.be.true;
	expect(fs.existsSync(wrongFile)).to.be.true;

	const result = await fse.removeAsync(file);
	expect(result.fails).to.be.false;

	expect(fs.existsSync(file)).to.be.false;
	expect(fs.existsSync(wrongFile)).to.be.true;
});

it('should not delete glob matches when file does not exist', async () => {
	const nonexistentFile = path.join(TEST_DIR, 'file?');

	const wrongFile = path.join(TEST_DIR, 'file1');
	fs.writeFileSync(wrongFile, 'yo');

	expect(fs.existsSync(nonexistentFile)).to.be.false;
	expect(fs.existsSync(wrongFile)).to.be.true;

	const result = await fse.removeAsync(nonexistentFile);
	expect(result.fails).to.be.false;

	expect(fs.existsSync(nonexistentFile)).to.be.false;
	expect(fs.existsSync(wrongFile)).to.be.true;
});
