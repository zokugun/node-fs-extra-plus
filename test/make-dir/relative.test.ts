import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { afterEach, beforeEach, expect, it } from 'vitest';
import fse from '../../src/index.js';

const CWD = process.cwd();
const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'make-dir-relative');

let file: string;

beforeEach(async () => {
	const result = await fse.emptyDirAsync(TEST_DIR);

	expect(result.fails).to.be.false;

	const x = Math.floor(Math.random() * (16 ** 4)).toString(16);
	const y = Math.floor(Math.random() * (16 ** 4)).toString(16);
	const z = Math.floor(Math.random() * (16 ** 4)).toString(16);

	// relative path
	file = path.join(x, y, z);
});

afterEach(async () => {
	process.chdir(CWD);

	await fse.removeAsync(TEST_DIR);
});

it('should make the directory with relative path', async () => {
	process.chdir(TEST_DIR);

	const mkResult = await fse.mkdirpAsync(file, 0o755);

	expect(mkResult.fails).to.be.false;

	const peResult = await fse.pathExistsAsync(file);

	expect(peResult.fails).to.be.false;
	expect(peResult.value).to.be.true;

	const stats = await fse.statAsync(file);

	expect(stats.fails).to.be.false;

	if(os.platform() === 'win32') {
		expect(stats.value!.mode & 0o777).to.equals(0o666);
	}
	else {
		expect(stats.value!.mode & 0o777).to.equals(0o755);
	}

	expect(stats.value!.isDirectory()).to.be.true;
});
