import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest';
import fse from '../../src/index.js';

const SIZE = (16 * 64 * 1024) + 7;
const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'copy-sync-file');

beforeEach(async () => {
	await fse.emptyDirAsync(TEST_DIR);
});

afterEach(async () => {
	await fse.removeAsync(TEST_DIR);
});

describe('> when dest exists and is a directory', () => {
	it('should throw error', () => {
		const source = path.join(TEST_DIR, 'file.txt');
		const destination = path.join(TEST_DIR, 'dir');

		fse.ensureFileSync(source);
		fse.ensureDirSync(destination);

		const result = fse.copySync(source, destination);
		expect(result.fails).to.be.true;
		expect(result.error!.message).to.equals(`Cannot overwrite directory '${destination}' with non-directory '${source}'.`);
	});
});

it('should copy the file synchronously', () => {
	const fileSource = path.join(TEST_DIR, 'TEST_fs-extra_src');
	const fileDestination = path.join(TEST_DIR, 'TEST_fs-extra_copy');

	fse.writeFileSync(fileSource, crypto.randomBytes(SIZE));

	const sourceMd5 = crypto.createHash('md5').update(fs.readFileSync(fileSource)).digest('hex');

	fse.copySync(fileSource, fileDestination);

	const destinationMd5 = crypto.createHash('md5').update(fs.readFileSync(fileDestination)).digest('hex');

	expect(destinationMd5).to.equals(sourceMd5);
});

it('should follow symlinks', () => {
	const fileSource = path.join(TEST_DIR, 'TEST_fs-extra_src');
	const fileDestination = path.join(TEST_DIR, 'TEST_fs-extra_copy');
	const linkSource = path.join(TEST_DIR, 'TEST_fs-extra_copy_link');

	fse.writeFileSync(fileSource, crypto.randomBytes(SIZE));

	const sourceMd5 = crypto.createHash('md5').update(fs.readFileSync(fileSource)).digest('hex');

	fse.symlinkSync(fileSource, linkSource);
	fse.copySync(linkSource, fileDestination);

	const destinationMd5 = crypto.createHash('md5').update(fs.readFileSync(fileDestination)).digest('hex');

	expect(destinationMd5).to.equals(sourceMd5);
});

it('should maintain file mode', () => {
	const fileSource = path.join(TEST_DIR, 'TEST_fs-extra_src');
	const fileDestination = path.join(TEST_DIR, 'TEST_fs-extra_copy');

	fse.writeFileSync(fileSource, crypto.randomBytes(SIZE));

	fse.chmodSync(fileSource, 0o750);
	fse.copySync(fileSource, fileDestination);

	const statSource = fs.statSync(fileSource);
	const statDestination = fs.statSync(fileDestination);

	expect(statDestination.mode).to.equals(statSource.mode);
});

it('should only copy files allowed by filter fn', () => {
	const sourceFile1 = path.join(TEST_DIR, '1.html');
	const sourceFile2 = path.join(TEST_DIR, '2.css');
	const sourceFile3 = path.join(TEST_DIR, '3.jade');

	fse.writeFileSync(sourceFile1, '');
	fse.writeFileSync(sourceFile2, '');
	fse.writeFileSync(sourceFile3, '');

	const destinationFile1 = path.join(TEST_DIR, 'dest1.html');
	const destinationFile2 = path.join(TEST_DIR, 'dest2.css');
	const destinationFile3 = path.join(TEST_DIR, 'dest3.jade');

	const filter = (s: string) => s.split('.').pop() !== 'css';

	fse.copySync(sourceFile1, destinationFile1, filter);
	fse.copySync(sourceFile2, destinationFile2, filter);
	fse.copySync(sourceFile3, destinationFile3, filter);

	expect(fs.existsSync(destinationFile1)).to.be.true;
	expect(fs.existsSync(destinationFile2)).to.be.false;
	expect(fs.existsSync(destinationFile3)).to.be.true;
});

it('should not call filter fn more than needed', () => {
	const source = path.join(TEST_DIR, 'foo');

	fse.writeFileSync(source, '');

	const destination = path.join(TEST_DIR, 'bar');

	let filterCallCount = 0;
	const filter = () => {
		filterCallCount++;
		return true;
	};

	fse.copySync(source, destination, filter);

	expect(filterCallCount).to.equals(1);
	expect(fs.existsSync(destination)).to.be.true;
});

describe('> when the destination dir does not exist', () => {
	it('should create the destination directory and copy the file', () => {
		const source = path.join(TEST_DIR, 'file.txt');
		const destination = path.join(TEST_DIR, 'this/path/does/not/exist/copied.txt');
		const data = 'did it copy?\n';

		fse.writeFileSync(source, data, 'utf8');
		fse.copySync(source, destination);

		const data2 = fs.readFileSync(destination, 'utf8');

		expect(data2).to.equals(data);
	});
});

describe('> when src file does not have write permissions', () => {
	it('should be able to copy contents of file', () => {
		const fileSource = path.join(TEST_DIR, 'file.txt');
		const fileDestination = path.join(TEST_DIR, 'file-copy.txt');
		const data = 'did it copy?';

		fse.writeFileSync(fileSource, data, 'utf8');
		fse.chmodSync(fileSource, '0444');

		fse.copySync(fileSource, fileDestination);

		const data2 = fs.readFileSync(fileDestination, 'utf8');

		expect(data2).to.equals(data);
	});
});

describe('> when overwrite option is passed', () => {
	const sourceData = 'some src data';
	const source = path.join(TEST_DIR, 'src-file');
	const destination = path.join(TEST_DIR, 'des-file');

	beforeEach(() => {
		// source file must always exist in these cases
		fs.writeFileSync(source, sourceData);
	});

	describe('> when destination file does NOT exist', () => {
		describe('> when overwrite is true', () => {
			it('should copy the file and not throw an error', () => {
				fse.copySync(source, destination, { overwrite: true });

				const destinationData = fs.readFileSync(destination, 'utf8');

				expect(destinationData).to.equals(sourceData);
			});
		});

		describe('> when overwrite is false', () => {
			it('should copy the file and not throw an error', () => {
				fse.copySync(source, destination, { overwrite: false });

				const destinationData = fs.readFileSync(destination, 'utf8');

				expect(destinationData).to.equals(sourceData);
			});
		});
	});

	describe('when destination file does exist', () => {
		let destinationData: string;

		beforeEach(() => {
			destinationData = 'some dest data';

			fs.writeFileSync(destination, destinationData);
		});

		describe('> when overwrite is true', () => {
			it('should copy the file and not throw an error', () => {
				fse.copySync(source, destination, { overwrite: true });

				destinationData = fs.readFileSync(destination, 'utf8');

				expect(destinationData).to.equals(sourceData);
			});
		});

		describe('> when overwrite is false', () => {
			it('should not throw an error', () => {
				fse.copySync(source, destination, { overwrite: false });

				// copy never happened
				const destinationDataNew = fs.readFileSync(destination, 'utf8');

				expect(destinationDataNew).to.equals(destinationData);
			});
			it('should throw an error when errorOnExist is true', () => {
				const result = fse.copySync(source, destination, { overwrite: false, errorOnExist: true });
				expect(result.fails).to.be.true;

				// copy never happened
				const destinationDataNew = fs.readFileSync(destination, 'utf8');

				expect(destinationDataNew).to.equals(destinationData);
			});
		});

		describe('> when overwrite is true and dest is readonly', () => {
			afterAll(() => {
				fse.unlinkSync(destination);
			});

			it('should copy the file and not throw an error', () => {
				fse.chmodSync(destination, 0o444);
				fse.copySync(source, destination, { overwrite: true });

				const destinationDataNew = fs.readFileSync(destination, 'utf8');

				expect(destinationDataNew).to.equals(sourceData);
			});
		});
	});
});

describe('clobber', () => {
	const source = path.join(TEST_DIR, 'src-file');
	const destination = path.join(TEST_DIR, 'des-file');
	const sourceData = 'some src data';
	const destinationData = 'some dest data';

	beforeEach(() => {
		fs.writeFileSync(source, sourceData);
		fs.writeFileSync(destination, destinationData);
	});

	it('is an alias for overwrite', () => {
		fse.copySync(source, destination, { clobber: false });

		// copy never happened
		const destinationDataNew = fs.readFileSync(destination, 'utf8');

		expect(destinationDataNew).to.equals(destinationData);
	});
});
