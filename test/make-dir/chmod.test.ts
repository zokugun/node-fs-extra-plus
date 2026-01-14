import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { afterEach, beforeEach, expect, it } from 'vitest';
import fse from '../../src/index.js';

const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'make-dir-chmod');

let testSubDir: string;

beforeEach(async () => {
	const parts: string[] = [];

	for(let i = 0; i < 15; i++) {
		const dir = Math.floor(Math.random() * (16 ** 4)).toString(16);
		parts.push(dir);
	}

	testSubDir = path.join(TEST_DIR, ...parts);

	await fse.emptyDirAsync(TEST_DIR);
});

afterEach(async () => {
	await fse.removeAsync(TEST_DIR);
});

it('chmod-pre', async () => {
	const mode = 0o744;

	const mkdirResult = await fse.mkdirpAsync(testSubDir, mode);

	expect(mkdirResult.fails).to.be.false;

	const stats = await fse.statAsync(testSubDir);

	expect(stats.fails).to.be.false;
	expect(stats.value!.isDirectory()).to.be.true;

	if(process.platform === 'win32') {
		expect(stats.value!.mode & 0o777).to.be.equals(0o666);
	}
	else {
		expect(stats.value!.mode & 0o777).to.be.equals(mode);
	}
});

it('chmod', async () => {
	const mode = 0o755;

	const mkdirResult = await fse.mkdirpAsync(testSubDir, mode);

	expect(mkdirResult.fails).to.be.false;

	const stats = await fse.statAsync(testSubDir);

	expect(stats.fails).to.be.false;
	expect(stats.value!.isDirectory()).to.be.true;
});
