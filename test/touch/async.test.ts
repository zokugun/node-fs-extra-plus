import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, expect, it } from 'vitest';
import fse from '../../src/index.js';

const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'touch-async');

beforeEach(async () => {
	await fse.emptyDirAsync(TEST_DIR);
});

afterEach(async () => {
	await fse.removeAsync(TEST_DIR);
});

it('file', async () => {
	const file = path.join(TEST_DIR, 'some-file.txt');
	const touchResult = await fse.touchAsync(file);
	expect(touchResult.fails).to.be.false;
	expect(fse.isFileSync(file)).to.be.true;

	const future = new Date(Date.now() + 5);
	const utimesResult = fse.utimesSync(file, future, future);
	expect(utimesResult.fails).to.be.false;

	const newStats = fse.statSync(file);
	expect(newStats.fails).to.be.false;
	expect(newStats.value!.atime).to.eql(future);
	expect(newStats.value!.mtime).to.eql(future);

	await new Promise((resolve) => {
		setTimeout(resolve, 10);
	});

	const retouchResult = await fse.touchAsync(file);
	expect(retouchResult.fails).to.be.false;

	const newerStats = fse.statSync(file);
	expect(newerStats.fails).to.be.false;
	expect(newerStats.value!.atime.getTime()).toBeGreaterThan(future.getTime());
	expect(newerStats.value!.mtime.getTime()).toBeGreaterThan(future.getTime());
});

it('dir', async () => {
	const dir = path.join(TEST_DIR, 'some-dir');
	const endureResult = fse.ensureDirSync(dir);
	expect(endureResult.fails).to.be.false;
	expect(fse.isDirSync(dir)).to.be.true;

	const future = new Date(Date.now() + 5);
	const utimesResult = fse.utimesSync(dir, future, future);
	expect(utimesResult.fails).to.be.false;

	const newStats = fse.statSync(dir);
	expect(newStats.fails).to.be.false;
	expect(newStats.value!.atime).to.eql(future);
	expect(newStats.value!.mtime).to.eql(future);

	await new Promise((resolve) => {
		setTimeout(resolve, 10);
	});

	const retouchResult = await fse.touchAsync(dir);
	expect(retouchResult.fails).to.be.false;

	const newerStats = fse.statSync(dir);
	expect(newerStats.fails).to.be.false;
	expect(newerStats.value!.atime.getTime()).toBeGreaterThan(future.getTime());
	expect(newerStats.value!.mtime.getTime()).toBeGreaterThan(future.getTime());
});
