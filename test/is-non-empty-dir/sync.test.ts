import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, expect, it } from 'vitest';
import fse from '../../src/index.js';

const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'is-non-empty-dir-sync');

beforeEach(async () => {
	await fse.emptyDirAsync(TEST_DIR);
});

afterEach(async () => {
	await fse.removeAsync(TEST_DIR);
});

it('fails - empty', () => {
	fse.ensureDirSync(path.join(TEST_DIR, 'some-dir'));

	const result = fse.isNonEmptyDirSync(path.join(TEST_DIR, 'some-dir'));

	expect(result).to.be.false;
});

it('ok - non-empty', () => {
	fse.ensureFileSync(path.join(TEST_DIR, 'some-dir', 'some-file.txt'));

	const result = fse.isNonEmptyDirSync(path.join(TEST_DIR, 'some-dir'));

	expect(result).to.be.true;
});

it('fails - file', () => {
	fse.ensureFileSync(path.join(TEST_DIR, 'some-dir'));

	const result = fse.isNonEmptyDirSync(path.join(TEST_DIR, 'some-dir'));

	expect(result).to.be.false;
});

it('fails - non-exists', () => {
	const result = fse.isNonEmptyDirSync(path.join(TEST_DIR, 'some-dir'));

	expect(result).to.be.false;
});
