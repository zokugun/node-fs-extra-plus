import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, expect, it } from 'vitest';
import fse from '../../src/index.js';

const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'make-dir-mkdir');

beforeEach(async () => {
	await fse.emptyDirAsync(TEST_DIR);
});

afterEach(async () => {
	await fse.removeAsync(TEST_DIR);
});

it('should make the directory', async () => {
	const dir = path.join(TEST_DIR, 'tmp-' + Date.now() + Math.random());

	expect(fs.existsSync(dir)).to.be.false;

	await fse.mkdirsAsync(dir);

	expect(fs.existsSync(dir)).to.be.true;
});

it('should make the entire directory path', async () => {
	const dir = path.join(TEST_DIR, 'tmp-' + Date.now() + Math.random());
	const newDir = path.join(dir, 'dfdf', 'ffff', 'aaa');

	expect(fs.existsSync(newDir)).to.be.false;

	await fse.mkdirsAsync(newDir);

	expect(fs.existsSync(newDir)).to.be.true;
});
