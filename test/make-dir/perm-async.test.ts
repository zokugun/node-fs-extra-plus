import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, expect, it } from 'vitest';
import fse from '../../src/index.js';

const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'make-dir-perm-async');

beforeEach(async () => {
	await fse.emptyDirAsync(TEST_DIR);
});

afterEach(async () => {
	await fse.removeAsync(TEST_DIR);
});

it('sync perm', async () => {
	const file = path.join(TEST_DIR, (Math.random() * (1 << 30)).toString(16) + '.json');

	await fse.mkdirpAsync(file, 0o755);

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

it('sync root perm', async () => {
	const file = TEST_DIR;

	await fse.mkdirpAsync(file, 0o755);

	const peResult = await fse.pathExistsAsync(file);

	expect(peResult.fails).to.be.false;
	expect(peResult.value).to.be.true;

	const stats = await fse.statAsync(file);

	expect(stats.fails).to.be.false;
	expect(stats.value!.isDirectory()).to.be.true;
});
