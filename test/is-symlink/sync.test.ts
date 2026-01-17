import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, expect, it } from 'vitest';
import fse from '../../src/index.js';

const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'is-symlink-sync');

beforeEach(async () => {
	await fse.emptyDirAsync(TEST_DIR);
});

afterEach(async () => {
	await fse.removeAsync(TEST_DIR);
});

it('fails - link', () => {
	fse.ensureFileSync(path.join(TEST_DIR, 'some-file.txt'));
	fse.createLinkSync(path.join(TEST_DIR, 'some-file.txt'), path.join(TEST_DIR, 'link.txt'));

	const result = fse.isSymlinkSync(path.join(TEST_DIR, 'link.txt'));

	expect(result).to.be.false;
});

it('fails - file', () => {
	fse.ensureFileSync(path.join(TEST_DIR, 'some-file.txt'));

	const result = fse.isSymlinkSync(path.join(TEST_DIR, 'some-file.txt'));

	expect(result).to.be.false;
});

it('ok - symlink', () => {
	fse.ensureFileSync(path.join(TEST_DIR, 'some-file.txt'));
	fse.createSymlinkSync(path.join(TEST_DIR, 'some-file.txt'), path.join(TEST_DIR, 'link.txt'));

	const result = fse.isSymlinkSync(path.join(TEST_DIR, 'link.txt'));

	expect(result).to.be.true;
});

it('fails - dir', () => {
	fse.ensureDirSync(path.join(TEST_DIR, 'some-dir'));

	const result = fse.isSymlinkSync(path.join(TEST_DIR, 'some-dir'));

	expect(result).to.be.false;
});

it('fails - non-exists', () => {
	const result = fse.isSymlinkSync(path.join(TEST_DIR, 'some-file.txt'));

	expect(result).to.be.false;
});
