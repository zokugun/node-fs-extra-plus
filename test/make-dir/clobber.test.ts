import os from 'node:os';
import path from 'node:path';
import { beforeEach, expect, it } from 'vitest';
import fse from '../../src/index.js';

const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'make-dir-clobber');

let targetDir: string;

beforeEach(async () => {
	const emptyDirResult = await fse.emptyDirAsync(TEST_DIR);

	expect(emptyDirResult.fails).to.be.false;

	const parts = [TEST_DIR];

	for(let i = 0; i < 15; i++) {
		const dir = Math.floor(Math.random() * (16 ** 4)).toString(16);
		parts.push(dir);
	}

	targetDir = parts.join(path.sep);

	const itwFile = parts.slice(0, 2).join(path.sep);

	await fse.writeFileAsync(itwFile, 'I AM IN THE WAY, THE TRUTH, AND THE LIGHT.');

	const stats = await fse.statAsync(itwFile);

	expect(stats.fails).to.be.false;
	expect(stats.value!.isFile()).to.be.true;
});

it('should clobber', async () => {
	const mode = 0o755;

	const result = await fse.mkdirpAsync(targetDir, mode);

	expect(result.fails).to.be.true;
	expect(result.error!.code).to.equals('ENOTDIR');
});
