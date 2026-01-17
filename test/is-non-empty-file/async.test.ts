import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, expect, it } from 'vitest';
import fse from '../../src/index.js';

const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'is-non-empty-file-async');

beforeEach(async () => {
	await fse.emptyDirAsync(TEST_DIR);
});

afterEach(async () => {
	await fse.removeAsync(TEST_DIR);
});

it('fails - empty', async () => {
	fse.ensureFileSync(path.join(TEST_DIR, 'some-file.txt'));

	const result = await fse.isNonEmptyFileAsync(path.join(TEST_DIR, 'some-file.txt'));

	expect(result).to.be.false;
});

it('ok - non-empty', async () => {
	fse.outputFileSync(path.join(TEST_DIR, 'some-file.txt'), 'foobar');

	const result = await fse.isNonEmptyFileAsync(path.join(TEST_DIR, 'some-file.txt'));

	expect(result).to.be.true;
});

it('fails - dir', async () => {
	fse.ensureDirSync(path.join(TEST_DIR, 'some-dir'));

	const result = await fse.isNonEmptyFileAsync(path.join(TEST_DIR, 'some-dir'));

	expect(result).to.be.false;
});

it('fails - non-exists', async () => {
	const result = await fse.isNonEmptyFileAsync(path.join(TEST_DIR, 'some-file.txt'));

	expect(result).to.be.false;
});
