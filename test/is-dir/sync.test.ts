import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, expect, it } from 'vitest';
import fse from '../../src/index.js';

const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'is-dir-sync');

beforeEach(async () => {
	await fse.emptyDirAsync(TEST_DIR);
});

afterEach(async () => {
	await fse.removeAsync(TEST_DIR);
});

it('ok', () => {
	fse.ensureDirSync(path.join(TEST_DIR, 'some-dir'));

	const result = fse.isDirSync(path.join(TEST_DIR, 'some-dir'));

	expect(result).to.be.true;
});

it('fails - file', () => {
	fse.ensureFileSync(path.join(TEST_DIR, 'some-dir'));

	const result = fse.isDirSync(path.join(TEST_DIR, 'some-dir'));

	expect(result).to.be.false;
});

it('fails - non-exists', () => {
	const result = fse.isDirSync(path.join(TEST_DIR, 'some-dir'));

	expect(result).to.be.false;
});
