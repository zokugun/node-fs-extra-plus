import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fse from '../../src/index.js';

const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'move-sync-case-insensitive-paths');

beforeEach(async () => {
	await fse.emptyDirAsync(TEST_DIR);
});

afterEach(async () => {
	await fse.removeAsync(TEST_DIR);
});

describe('> when src is a directory', () => {
	it('should move successfully', () => {
		const source = path.join(TEST_DIR, 'srcdir');
		const destination = path.join(TEST_DIR, 'srcDir');

		fse.outputFileSync(path.join(source, 'subdir', 'file.txt'), 'some data');

		fse.moveSync(source, destination);

		expect(fs.existsSync(destination)).to.be.true;
		expect(fs.readFileSync(path.join(destination, 'subdir', 'file.txt'), 'utf8')).to.equals('some data');
	});
});

describe('> when src is a file', () => {
	it('should move successfully', () => {
		const source = path.join(TEST_DIR, 'srcfile');
		const destination = path.join(TEST_DIR, 'srcFile');

		fse.outputFileSync(source, 'some data');

		fse.moveSync(source, destination);

		expect(fs.existsSync(destination)).to.be.true;
		expect(fs.readFileSync(destination, 'utf8')).to.equals('some data');
	});
});

describe('> when src is a symlink', () => {
	it('should move successfully, symlink dir', () => {
		const source = path.join(TEST_DIR, 'srcdir');
		const sourceLink = path.join(TEST_DIR, 'src-symlink');
		const destination = path.join(TEST_DIR, 'src-Symlink');

		fse.outputFileSync(path.join(source, 'subdir', 'file.txt'), 'some data');
		fse.symlinkSync(source, sourceLink, 'dir');

		fse.moveSync(sourceLink, destination);
		expect(fs.existsSync(destination)).to.be.true;
		expect(fs.readFileSync(path.join(destination, 'subdir', 'file.txt'), 'utf8')).to.equals('some data');

		const destinationLink = fs.readlinkSync(destination);
		expect(destinationLink).to.equals(source);
	});

	it('should move successfully, symlink file', () => {
		const source = path.join(TEST_DIR, 'srcfile');
		const sourceLink = path.join(TEST_DIR, 'src-symlink');
		const destination = path.join(TEST_DIR, 'src-Symlink');

		fse.outputFileSync(source, 'some data');
		fse.symlinkSync(source, sourceLink, 'file');

		fse.moveSync(sourceLink, destination);
		expect(fs.existsSync(destination)).to.be.true;
		expect(fs.readFileSync(destination, 'utf8')).to.equals('some data');

		const destinationLink = fs.readlinkSync(destination);
		expect(destinationLink).to.equals(source);
	});
});
