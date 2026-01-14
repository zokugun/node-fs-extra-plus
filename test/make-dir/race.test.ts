import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, expect, it } from 'vitest';
import fse from '../../src/index.js';

const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'make-dir-race');

let file: string;

beforeEach(async () => {
	const result = await fse.emptyDirAsync(TEST_DIR);

	expect(result.fails).to.be.false;

	const parts = [TEST_DIR];

	for(let i = 0; i < 15; i++) {
		const dir = Math.floor(Math.random() * (16 ** 4)).toString(16);

		parts.push(dir);
	}

	file = path.join(...parts);
});

afterEach(async () => {
	await fse.removeAsync(TEST_DIR);
});

it('race', async () => {
	await Promise.all([mk(file), mk(file)]);
});

async function mk(file: string) {
	const mdResult = await fse.mkdirpAsync(file, 0o755);

	expect(mdResult.fails).to.be.false;

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
}
