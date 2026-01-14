import path from 'node:path';
import process from 'node:process';
import { expect, it } from 'vitest';
import fse from '../../src/index.js';

const TEST_DIR = path.normalize(path.resolve(path.sep)).toLowerCase();

it.skipIf(process.platform === 'win32')('should', async () => {
	const mdResult = await fse.mkdirpAsync(TEST_DIR, 0o755);

	expect(mdResult.fails).to.be.false;

	const stats = await fse.statAsync(TEST_DIR);

	expect(stats.fails).to.be.false;
	expect(stats.value!.isDirectory()).to.be.true;
});
