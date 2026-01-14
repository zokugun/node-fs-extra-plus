import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { beforeEach, expect, it } from 'vitest';
import fse from '../../src/index.js';

const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'make-dir-opts-undef');

beforeEach(async () => {
	await fse.emptyDirAsync(TEST_DIR);
});

it('should not hang', async () => {
	const newDir = path.join(TEST_DIR, 'doest', 'not', 'exist');

	expect(fs.existsSync(newDir)).to.be.false;

	const result = await fse.mkdirsAsync(newDir, undefined);

	expect(result.fails).to.be.false;
	expect(fs.existsSync(newDir)).to.be.true;
});
