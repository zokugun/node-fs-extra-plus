import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import klawSync from 'klaw-sync';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fse from '../../src/index.js';

const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'copy-sync-prevent-copying-into-itself');
const FILES = [
	'file0.txt',
	path.join('dir1', 'file1.txt'),
	path.join('dir1', 'dir2', 'file2.txt'),
	path.join('dir1', 'dir2', 'dir3', 'file3.txt'),
];

const source = path.join(TEST_DIR, 'src');
const dat0 = 'file0';
const dat1 = 'file1';
const dat2 = 'file2';
const dat3 = 'file3';

beforeEach(async () => {
	await fse.emptyDirAsync(TEST_DIR);

	fse.outputFileSync(path.join(source, FILES[0]), dat0);
	fse.outputFileSync(path.join(source, FILES[1]), dat1);
	fse.outputFileSync(path.join(source, FILES[2]), dat2);
	fse.outputFileSync(path.join(source, FILES[3]), dat3);
});

afterEach(async () => {
	await fse.removeAsync(TEST_DIR);
});

describe('> when source is a file', () => {
	it('should copy the file successfully even if dest parent is a subdir of src', () => {
		const sourceFile = path.join(TEST_DIR, 'src', 'srcfile.txt');
		const destinationFile = path.join(TEST_DIR, 'src', 'dest', 'destfile.txt');
		fse.writeFileSync(sourceFile, dat0);

		fse.copySync(sourceFile, destinationFile);

		expect(fs.existsSync(destinationFile)).to.be.true;
		const out = fs.readFileSync(destinationFile, 'utf8');
		expect(out).to.equals(dat0, 'file contents matched');
	});
});

// test for these cases:
//  - src is directory, dest is directory
//  - src is directory, dest is symlink
//  - src is symlink, dest is directory
//  - src is symlink, dest is symlink

describe('> when source is a directory', () => {
	describe('>> when dest is a directory', () => {
		it('of not itself', () => {
			const destination = path.join(TEST_DIR, source.replace(/^\w:/, ''));
			return testSuccess(source, destination);
		});
		it('of itself', () => {
			const destination = path.join(source, 'dest');
			return testError(source, destination);
		});
		it('should copy the directory successfully when dest is \'src_dest\'', () => {
			const destination = path.join(TEST_DIR, 'src_dest');
			return testSuccess(source, destination);
		});
		it('should copy the directory successfully when dest is \'src-dest\'', () => {
			const destination = path.join(TEST_DIR, 'src-dest');
			return testSuccess(source, destination);
		});

		it('should copy the directory successfully when dest is \'dest_src\'', () => {
			const destination = path.join(TEST_DIR, 'dest_src');
			return testSuccess(source, destination);
		});

		it('should copy the directory successfully when dest is \'src_dest/src\'', () => {
			const destination = path.join(TEST_DIR, 'src_dest', 'src');
			return testSuccess(source, destination);
		});

		it('should copy the directory successfully when dest is \'src-dest/src\'', () => {
			const destination = path.join(TEST_DIR, 'src-dest', 'src');
			return testSuccess(source, destination);
		});

		it('should copy the directory successfully when dest is \'dest_src/src\'', () => {
			const destination = path.join(TEST_DIR, 'dest_src', 'src');
			return testSuccess(source, destination);
		});

		it('should copy the directory successfully when dest is \'src_src/dest\'', () => {
			const destination = path.join(TEST_DIR, 'src_src', 'dest');
			return testSuccess(source, destination);
		});

		it('should copy the directory successfully when dest is \'src-src/dest\'', () => {
			const destination = path.join(TEST_DIR, 'src-src', 'dest');
			return testSuccess(source, destination);
		});

		it('should copy the directory successfully when dest is \'srcsrc/dest\'', () => {
			const destination = path.join(TEST_DIR, 'srcsrc', 'dest');
			return testSuccess(source, destination);
		});

		it('should copy the directory successfully when dest is \'dest/src\'', () => {
			const destination = path.join(TEST_DIR, 'dest', 'src');
			return testSuccess(source, destination);
		});

		it('should copy the directory successfully when dest is very nested that all its parents need to be created', () => {
			const destination = path.join(TEST_DIR, 'dest', 'src', 'foo', 'bar', 'baz', 'qux', 'quux', 'waldo',
				'grault', 'garply', 'fred', 'plugh', 'thud', 'some', 'highly', 'deeply',
				'badly', 'nasty', 'crazy', 'mad', 'nested', 'dest');
			return testSuccess(source, destination);
		});

		it('should error when dest is \'src/dest\'', () => {
			const destination = path.join(TEST_DIR, 'src', 'dest');
			return testError(source, destination);
		});

		it('should error when dest is \'src/src_dest\'', () => {
			const destination = path.join(TEST_DIR, 'src', 'src_dest');
			return testError(source, destination);
		});

		it('should error when dest is \'src/dest_src\'', () => {
			const destination = path.join(TEST_DIR, 'src', 'dest_src');
			return testError(source, destination);
		});

		it('should error when dest is \'src/dest/src\'', () => {
			const destination = path.join(TEST_DIR, 'src', 'dest', 'src');
			return testError(source, destination);
		});
	});

	describe('>> when dest is a symlink', () => {
		it('should error when dest points exactly to src and dereference is true', () => {
			const destinationLink = path.join(TEST_DIR, 'dest-symlink');
			fse.symlinkSync(source, destinationLink, 'dir');

			const srclenBefore = klawSync(source).length;
			expect(srclenBefore).toBeGreaterThan(2);

			const result = fse.copySync(source, destinationLink, { dereference: true });
			expect(result.fails).to.be.true;
			expect(result.error!.message).to.equals('Source and destination must not be the same.');

			const srclenAfter = klawSync(source).length;
			expect(srclenAfter).to.equals(srclenBefore, 'src length should not change');

			const link = fs.readlinkSync(destinationLink);
			expect(link).to.equals(source);
		});

		it('should error when dest is a subdirectory of src (bind-mounted directory with subdirectory)', () => {
			const destinationLink = path.join(TEST_DIR, 'dest-symlink');
			fs.symlinkSync(source, destinationLink, 'dir');

			const srclenBefore = klawSync(source).length;
			expect(srclenBefore).toBeGreaterThan(2);

			const destination = path.join(destinationLink, 'dir1');
			expect(fs.existsSync(destination)).to.be.true;

			const result = fse.copySync(source, destination);
			expect(result.fails).to.be.true;
			expect(result.error!.message).to.equals(`Cannot copy '${source}' to a subdirectory of itself, '${destination}'.`);

			const srclenAfter = klawSync(source).length;
			expect(srclenAfter).toBeGreaterThan(2);

			const link = fs.readlinkSync(destinationLink);
			expect(link).to.equals(source);
		});

		it('should error when dest is a subdirectory of src (more than one level depth)', () => {
			const destinationLink = path.join(TEST_DIR, 'dest-symlink');
			fs.symlinkSync(source, destinationLink, 'dir');

			const srclenBefore = klawSync(source).length;
			expect(srclenBefore).toBeGreaterThan(2);

			const destination = path.join(destinationLink, 'dir1', 'dir2');
			expect(fs.existsSync(destination)).to.be.true;

			const result = fse.copySync(source, destination);
			expect(result.fails).to.be.true;
			expect(result.error!.message).to.equals(`Cannot copy '${source}' to a subdirectory of itself, '${path.join(destinationLink, 'dir1')}'.`);

			const srclenAfter = klawSync(source).length;
			expect(srclenAfter).to.equals(srclenBefore, 'src length should not change');

			const link = fs.readlinkSync(destinationLink);
			expect(link).to.equals(source);
		});

		it('should copy the directory successfully when src is a subdir of resolved dest path and dereferene is true', () => {
			const sourceInDestination = path.join(TEST_DIR, 'dest', 'some', 'nested', 'src');
			const destinationLink = path.join(TEST_DIR, 'dest-symlink');
			fse.copySync(source, sourceInDestination); // put some stuff in srcInDest

			const destination = path.join(TEST_DIR, 'dest');
			fse.symlinkSync(destination, destinationLink, 'dir');

			const srclen = klawSync(sourceInDestination).length;
			const destlenBefore = klawSync(destination).length;
			expect(destlenBefore).toBeGreaterThan(2);

			fse.copySync(sourceInDestination, destinationLink, { dereference: true });

			const destlenAfter = klawSync(destination).length;

			// assert dest length is oldlen + length of stuff copied from src
			expect(destlenAfter).to.equals(destlenBefore + srclen, 'dest length should be equal to old length + copied legnth');

			for(const f of FILES) {
				expect(fs.existsSync(path.join(destination, f))).to.equals(true, 'file copied');
			}

			const o0 = fs.readFileSync(path.join(destination, FILES[0]), 'utf8');
			const o1 = fs.readFileSync(path.join(destination, FILES[1]), 'utf8');
			const o2 = fs.readFileSync(path.join(destination, FILES[2]), 'utf8');
			const o3 = fs.readFileSync(path.join(destination, FILES[3]), 'utf8');

			expect(o0).to.equals(dat0, 'files contents matched');
			expect(o1).to.equals(dat1, 'files contents matched');
			expect(o2).to.equals(dat2, 'files contents matched');
			expect(o3).to.equals(dat3, 'files contents matched');
		});
	});
});

describe('> when source is a symlink', () => {
	describe('>> when dest is a directory', () => {
		it('should error when resolved src path points to dest', () => {
			const sourceLink = path.join(TEST_DIR, 'src-symlink');
			fse.symlinkSync(source, sourceLink, 'dir');

			const destination = path.join(TEST_DIR, 'src');

			const result = fse.copySync(sourceLink, destination);
			expect(result.fails).to.be.true;

			// assert source not affected
			const link = fs.readlinkSync(sourceLink);
			expect(link).to.equals(source);
		});

		it('should error when dest is a subdir of resolved src path', () => {
			const sourceLink = path.join(TEST_DIR, 'src-symlink');
			fse.symlinkSync(source, sourceLink, 'dir');

			const destination = path.join(TEST_DIR, 'src', 'some', 'nested', 'dest');
			fse.mkdirsSync(destination);

			const result = fse.copySync(sourceLink, destination);
			expect(result.fails).to.be.true;

			const link = fs.readlinkSync(sourceLink);
			expect(link).to.equals(source);
		});

		it('should error when resolved src path is a subdir of dest', () => {
			const destination = path.join(TEST_DIR, 'dest');

			const resolvedSourcePath = path.join(destination, 'contains', 'src');
			const sourceLink = path.join(TEST_DIR, 'src-symlink');
			fse.copySync(source, resolvedSourcePath);

			// make symlink that points to a subdir in dest
			fse.symlinkSync(resolvedSourcePath, sourceLink, 'dir');

			const result = fse.copySync(sourceLink, destination);
			expect(result.fails).to.be.true;
		});

		it('should copy the directory successfully when dest is \'src_src/dest\'', () => {
			const sourceLink = path.join(TEST_DIR, 'src-symlink');
			fse.symlinkSync(source, sourceLink, 'dir');

			const destination = path.join(TEST_DIR, 'src_src', 'dest');

			testSuccess(sourceLink, destination);

			const link = fs.readlinkSync(destination);
			expect(link).to.equals(source);
		});

		it('should copy the directory successfully when dest is \'srcsrc/dest\'', () => {
			const sourceLink = path.join(TEST_DIR, 'src-symlink');
			fs.symlinkSync(source, sourceLink, 'dir');

			const destination = path.join(TEST_DIR, 'srcsrc', 'dest');

			testSuccess(sourceLink, destination);

			const link = fs.readlinkSync(destination);
			expect(link).to.equals(source);
		});
	});

	describe('>> when dest is a symlink', () => {
		it('should error when resolved dest path is exactly the same as resolved src path and dereference is true', () => {
			const sourceLink = path.join(TEST_DIR, 'src-symlink');
			fse.symlinkSync(source, sourceLink, 'dir');
			const destinationLink = path.join(TEST_DIR, 'dest-symlink');
			fse.symlinkSync(source, destinationLink, 'dir');

			const srclenBefore = klawSync(sourceLink).length;
			const destlenBefore = klawSync(destinationLink).length;
			expect(srclenBefore).toBeGreaterThan(2);
			expect(destlenBefore).toBeGreaterThan(2);

			const result = fse.copySync(sourceLink, destinationLink, { dereference: true });
			expect(result.fails).to.be.true;
			expect(result.error!.message).to.equals('Source and destination must not be the same.');

			const srclenAfter = klawSync(sourceLink).length;
			expect(srclenAfter).to.equals(srclenBefore, 'src length should not change');
			const destlenAfter = klawSync(destinationLink).length;
			expect(destlenAfter).to.equals(destlenBefore, 'dest length should not change');

			const srcln = fs.readlinkSync(sourceLink);
			expect(srcln).to.equals(source);
			const destln = fs.readlinkSync(destinationLink);
			expect(destln).to.equals(source);
		});

		it('should error when resolved dest path is a subdir of resolved src path', () => {
			const sourceLink = path.join(TEST_DIR, 'src-symlink');
			fs.symlinkSync(source, sourceLink, 'dir');

			const destinationLink = path.join(TEST_DIR, 'dest-symlink');
			const resolvedDestinationPath = path.join(TEST_DIR, 'src', 'some', 'nested', 'dest');
			fse.ensureFileSync(path.join(resolvedDestinationPath, 'subdir', 'somefile.txt'));

			fse.symlinkSync(resolvedDestinationPath, destinationLink, 'dir');

			const result = fse.copySync(sourceLink, destinationLink);
			expect(result.fails).to.be.true;
			expect(result.error!.message).to.equals(`Cannot copy '${source}' to a subdirectory of itself, '${resolvedDestinationPath}'.`);

			const destln = fs.readlinkSync(destinationLink);
			expect(destln).to.equals(resolvedDestinationPath);
		});

		it('should error when resolved src path is a subdir of resolved dest path', () => {
			const sourceInDestination = path.join(TEST_DIR, 'dest', 'some', 'nested', 'src');
			const sourceLink = path.join(TEST_DIR, 'src-symlink');
			const destinationLink = path.join(TEST_DIR, 'dest-symlink');
			const destination = path.join(TEST_DIR, 'dest');

			fse.ensureDirSync(sourceInDestination);
			fse.ensureSymlinkSync(sourceInDestination, sourceLink, 'dir');
			fse.ensureSymlinkSync(destination, destinationLink, 'dir');

			const result = fse.copySync(sourceLink, destinationLink);
			expect(result.fails).to.be.true;
			expect(result.error!.message).to.equals(`Cannot overwrite '${destination}' with '${sourceInDestination}'.`);

			const destln = fs.readlinkSync(destinationLink);
			expect(destln).to.equals(destination);
		});
	});
});

function testSuccess(source: string, destination: string) {
	const srclen = klawSync(source).length;

	expect(srclen).toBeGreaterThan(2);

	fse.copySync(source, destination);

	for(const f of FILES) {
		expect(fs.existsSync(path.join(destination, f))).to.be.true;
	}

	const o0 = fs.readFileSync(path.join(destination, FILES[0]), 'utf8');
	const o1 = fs.readFileSync(path.join(destination, FILES[1]), 'utf8');
	const o2 = fs.readFileSync(path.join(destination, FILES[2]), 'utf8');
	const o3 = fs.readFileSync(path.join(destination, FILES[3]), 'utf8');

	expect(o0).to.equals(dat0, 'file contents matched');
	expect(o1).to.equals(dat1, 'file contents matched');
	expect(o2).to.equals(dat2, 'file contents matched');
	expect(o3).to.equals(dat3, 'file contents matched');
}

function testError(source: string, destination: string) {
	const result = fse.copySync(source, destination);
	expect(result.fails).to.be.true;
	expect(result.error!.message).to.equals(`Cannot copy '${source}' to a subdirectory of itself, '${destination}'.`);
}
