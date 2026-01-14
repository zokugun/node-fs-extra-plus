import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { expect, it } from 'vitest';
import fse from '../../src/index.js';

const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'make-dir-win32-bad-path');

it.runIf(process.platform === 'win32')('when bad path, should return a cleaner error', async () => {
	let dirPath = path.join(TEST_DIR, 'bad?dir');
	let result = await fse.mkdirpAsync(dirPath);

	expect(result.fails).to.be.true;
	expect(result.error!.code).to.equals('EINVAL');

	dirPath = path.join(TEST_DIR, 'foo:moo');
	result = await fse.mkdirpAsync(dirPath);

	expect(result.fails).to.be.true;
	expect(result.error!.code).to.equals('EINVAL');
});
