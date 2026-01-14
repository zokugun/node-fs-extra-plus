import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fse from '../../src/index.js';

const SIZE = (16 * 64 * 1024) + 7;
const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'copy-sync-dir');
const source = path.join(TEST_DIR, 'src');
const destination = path.join(TEST_DIR, 'dest');

beforeEach(async () => {
	await fse.emptyDirAsync(TEST_DIR);
});

afterEach(async () => {
	await fse.removeAsync(TEST_DIR);
});

describe('> when src is a directory', () => {
	describe('> when dest exists and is a file', () => {
		it('should throw error', () => {
			const destination = path.join(TEST_DIR, 'file.txt');

			fse.mkdirSync(source);
			fse.ensureFileSync(destination);

			const result = fse.copySync(source, destination);
			expect(result.fails).to.be.true;
			expect(result.error!.message).to.equals(`Cannot overwrite non-directory '${destination}' with directory '${source}'.`);
		});
	});

	it('should copy the directory synchronously', () => {
		const files = 2;

		fse.mkdirSync(source);

		for(let i = 0; i < files; ++i) {
			fs.writeFileSync(path.join(source, i.toString()), crypto.randomBytes(SIZE));
		}

		const subdir = path.join(source, 'subdir');

		fse.mkdirSync(subdir);

		for(let i = 0; i < files; ++i) {
			fs.writeFileSync(path.join(subdir, i.toString()), crypto.randomBytes(SIZE));
		}

		fse.copySync(source, destination);

		expect(fs.existsSync(destination)).to.be.true;

		for(let i = 0; i < files; ++i) {
			expect(fs.existsSync(path.join(destination, i.toString()))).to.be.true;
		}

		const destinationSub = path.join(destination, 'subdir');
		for(let j = 0; j < files; ++j) {
			expect(fs.existsSync(path.join(destinationSub, j.toString()))).to.be.true;
		}
	});

	it('should preserve symbolic links', () => {
		const sourceTarget = path.join(TEST_DIR, 'destination');
		fse.mkdirSync(source);
		fse.mkdirSync(sourceTarget);
		fse.symlinkSync(sourceTarget, path.join(source, 'symlink'), 'dir');

		fse.copySync(source, destination);

		const link = fs.readlinkSync(path.join(destination, 'symlink'));
		expect(link).to.be.equals(sourceTarget);
	});

	describe('> when the destination dir does not exist', () => {
		it('should create the destination directory and copy the file', () => {
			const source = path.join(TEST_DIR, 'data/');
			fse.mkdirSync(source);

			const d1 = 'file1';
			const d2 = 'file2';

			fse.writeFileSync(path.join(source, 'f1.txt'), d1);
			fse.writeFileSync(path.join(source, 'f2.txt'), d2);

			const destination = path.join(TEST_DIR, 'this/path/does/not/exist/outputDir');

			fse.copySync(source, destination);

			const o1 = fs.readFileSync(path.join(destination, 'f1.txt'), 'utf8');
			const o2 = fs.readFileSync(path.join(destination, 'f2.txt'), 'utf8');

			expect(o1).to.equals(d1);
			expect(o2).to.equals(d2);
		});
	});
});

describe('> when filter is used', () => {
	it('should do nothing if filter fails', () => {
		const sourceDir = path.join(TEST_DIR, 'src');
		const sourceFile = path.join(sourceDir, 'srcfile.css');

		fse.outputFileSync(sourceFile, 'src contents');

		const destinationDir = path.join(TEST_DIR, 'dest');
		const destinationFile = path.join(destinationDir, 'destfile.css');
		const filter = (s: string) => path.extname(s) !== '.css' && !fs.statSync(s).isDirectory();

		fse.copySync(sourceFile, destinationFile, filter);

		expect(fs.existsSync(destinationDir)).to.be.false;
	});

	it('should apply filter recursively', () => {
		const files = 2;
		// Don't match anything that ends with a digit higher than 0:
		const filter = (s: string) => /(0|\D)$/i.test(s);

		fse.mkdirSync(source);

		for(let i = 0; i < files; ++i) {
			fse.writeFileSync(path.join(source, i.toString()), crypto.randomBytes(SIZE));
		}

		const subdir = path.join(source, 'subdir');
		fse.mkdirSync(subdir);

		for(let i = 0; i < files; ++i) {
			fse.writeFileSync(path.join(subdir, i.toString()), crypto.randomBytes(SIZE));
		}

		fse.copySync(source, destination, filter);

		expect(fs.existsSync(destination)).to.be.true;
		expect(files).toBeGreaterThan(1);

		for(let i = 0; i < files; ++i) {
			if(i === 0) {
				expect(fs.existsSync(path.join(destination, i.toString()))).to.be.true;
			}
			else {
				expect(fs.existsSync(path.join(destination, i.toString()))).to.be.false;
			}
		}

		const destinationSub = path.join(destination, 'subdir');

		for(let j = 0; j < files; ++j) {
			if(j === 0) {
				expect(fs.existsSync(path.join(destinationSub, j.toString()))).to.be.true;
			}
			else {
				expect(fs.existsSync(path.join(destinationSub, j.toString()))).to.be.false;
			}
		}
	});

	it('should apply the filter to directory names', () => {
		const ignore = 'ignore';
		const filter = (s: string) => s.includes(ignore);

		fse.mkdirSync(source);

		const ignoreDir = path.join(source, ignore);
		fse.mkdirSync(ignoreDir);

		fse.writeFileSync(path.join(ignoreDir, 'file'), crypto.randomBytes(SIZE));

		fse.copySync(source, destination, filter);

		expect(fs.existsSync(path.join(destination, ignore)), 'directory was not ignored').to.be.false;
		expect(fs.existsSync(path.join(destination, ignore, 'file')), 'file was not ignored').to.be.false;
	});

	it('should apply filter when it is applied only to dest', async () => {
		const timeCond = Date.now();

		const filter = (_s: string, d: string) => fs.statSync(d).mtime.getTime() < timeCond;

		const destination = path.join(TEST_DIR, 'dest');

		await new Promise((resolve) => {
			setTimeout(resolve, 1000);
		});

		fse.outputFileSync(path.join(source, 'somefile.html'), 'some data');
		fse.mkdirSync(destination);
		fse.copySync(source, destination, filter);

		expect(fs.existsSync(path.join(destination, 'somefile.html'))).to.be.false;
	});

	it('should apply filter when it is applied to both src and dest', async () => {
		const timeCond = Date.now();
		const filter = (s: string, d: string) => s.split('.').pop() !== 'css' && fs.statSync(path.dirname(d)).mtime.getTime() > timeCond;

		const destination = path.join(TEST_DIR, 'dest');

		await new Promise((resolve) => {
			setTimeout(resolve, 1000);
		});

		const sourceFile1 = path.join(TEST_DIR, '1.html');
		const sourceFile2 = path.join(TEST_DIR, '2.css');
		const sourceFile3 = path.join(TEST_DIR, '3.jade');

		fse.writeFileSync(sourceFile1, '');
		fse.writeFileSync(sourceFile2, '');
		fse.writeFileSync(sourceFile3, '');

		const destinationFile1 = path.join(destination, 'dest1.html');
		const destinationFile2 = path.join(destination, 'dest2.css');
		const destinationFile3 = path.join(destination, 'dest3.jade');

		fse.mkdirSync(destination);

		fse.copySync(sourceFile1, destinationFile1, filter);
		fse.copySync(sourceFile2, destinationFile2, filter);
		fse.copySync(sourceFile3, destinationFile3, filter);

		expect(fs.existsSync(destinationFile1)).to.be.true;
		expect(fs.existsSync(destinationFile2)).to.be.false;
		expect(fs.existsSync(destinationFile3)).to.be.true;
	});
});
