import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fse from '../../src/index.js';

const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'copy-sync-case-insensitive-paths');
const platform = os.platform();

beforeEach(async () => {
	await fse.emptyDirAsync(TEST_DIR);
});

afterEach(async () => {
	await fse.removeAsync(TEST_DIR);
});

describe('> when src is a directory', () => {
	it('should behave correctly based on the OS', () => {
		const source = path.join(TEST_DIR, 'srcdir');

		fse.outputFileSync(path.join(source, 'subdir', 'file.txt'), 'some data');

		const destination = path.join(TEST_DIR, 'srcDir');

		const result = fse.copySync(source, destination);

		if(platform === 'darwin' || platform === 'win32') {
			expect(result.fails).to.be.true;
			expect(result.error!.message).to.equals('Source and destination must not be the same.');
		}
		else if(platform === 'linux') {
			expect(result.fails).to.be.false;
			expect(fs.existsSync(destination)).to.be.true;
			expect(fs.readFileSync(path.join(destination, 'subdir', 'file.txt'), 'utf8')).to.equal('some data');
		}
	});
});

describe('> when src is a file', () => {
	it('should behave correctly based on the OS', () => {
		const source = path.join(TEST_DIR, 'srcfile');

		fse.outputFileSync(source, 'some data');

		const destination = path.join(TEST_DIR, 'srcFile');

		const result = fse.copySync(source, destination);

		if(platform === 'darwin' || platform === 'win32') {
			expect(result.fails).to.be.true;
			expect(result.error!.message).to.equals('Source and destination must not be the same.');
		}
		else if(platform === 'linux') {
			expect(result.fails).to.be.false;
			expect(fs.existsSync(destination)).to.be.true;
			expect(fs.readFileSync(destination, 'utf8')).to.equal('some data');
		}
	});
});

describe('> when src is a symlink', () => {
	it('should behave correctly based on the OS, symlink dir', () => {
		const source = path.join(TEST_DIR, 'srcdir');

		fse.outputFileSync(path.join(source, 'subdir', 'file.txt'), 'some data');

		const sourceLink = path.join(TEST_DIR, 'src-symlink');

		fse.symlinkSync(source, sourceLink, 'dir');

		const destination = path.join(TEST_DIR, 'src-Symlink');

		const result = fse.copySync(sourceLink, destination);

		if(platform === 'darwin' || platform === 'win32') {
			expect(result.fails).to.be.true;
			expect(result.error!.message).to.equals('Source and destination must not be the same.');
		}
		else if(platform === 'linux') {
			expect(result.fails).to.be.false;
			expect(fs.existsSync(destination)).to.be.true;
			expect(fs.readFileSync(path.join(destination, 'subdir', 'file.txt'), 'utf8')).to.equal('some data');
			expect(fs.readlinkSync(destination)).to.equals(source);
		}
	});

	it('should behave correctly based on the OS, symlink file', () => {
		const source = path.join(TEST_DIR, 'srcfile');

		fse.outputFileSync(source, 'some data');

		const sourceLink = path.join(TEST_DIR, 'src-symlink');

		fse.symlinkSync(source, sourceLink, 'file');

		const destination = path.join(TEST_DIR, 'src-Symlink');

		const result = fse.copySync(sourceLink, destination);

		if(platform === 'darwin' || platform === 'win32') {
			expect(result.fails).to.be.true;
			expect(result.error!.message).to.equals('Source and destination must not be the same.');
		}
		else if(platform === 'linux') {
			expect(result.fails).to.be.false;
			expect(fs.existsSync(destination)).to.be.true;
			expect(fs.readFileSync(destination, 'utf8')).to.equal('some data');
			expect(fs.readlinkSync(destination)).to.equals(source);
		}
	});
});
