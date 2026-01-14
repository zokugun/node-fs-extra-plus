import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import klawSync from 'klaw-sync';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fse from '../../src/index.js';

const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'copy-sync-prevent-copying-identical');

beforeEach(async () => {
	await fse.emptyDirAsync(TEST_DIR);
});

afterEach(async () => {
	await fse.removeAsync(TEST_DIR);
});

it('should return an error if src and dest are the same', () => {
	const fileSource = path.join(TEST_DIR, 'TEST_fs-extra_copy_sync');
	const fileDestination = path.join(TEST_DIR, 'TEST_fs-extra_copy_sync');

	fse.ensureFileSync(fileSource);

	const result = fse.copySync(fileSource, fileDestination);
	expect(result.fails).to.be.true;
	expect(result.error!.message).to.equals('Source and destination must not be the same.');
});

describe('dest with parent symlink', () => {
	describe('first parent is symlink', () => {
		it('should error when src is file', () => {
			const source = path.join(TEST_DIR, 'a', 'file.txt');
			const destination = path.join(TEST_DIR, 'b', 'file.txt');
			const sourceParent = path.join(TEST_DIR, 'a');
			const destinationParent = path.join(TEST_DIR, 'b');

			fse.ensureFileSync(source);
			fse.ensureSymlinkSync(sourceParent, destinationParent, 'dir');

			const result = fse.copySync(source, destination);
			expect(result.fails).to.be.true;
			expect(result.error!.message).to.equals('Source and destination must not be the same.');
			expect(fs.existsSync(source)).to.be.true;
		});

		it('should error when src is directory', () => {
			const source = path.join(TEST_DIR, 'a', 'foo');
			const destination = path.join(TEST_DIR, 'b', 'foo');
			const sourceParent = path.join(TEST_DIR, 'a');
			const destinationParent = path.join(TEST_DIR, 'b');

			fse.ensureDirSync(source);
			fse.ensureSymlinkSync(sourceParent, destinationParent, 'dir');

			const result = fse.copySync(source, destination);
			expect(result.fails).to.be.true;
			expect(result.error!.message).to.equals('Source and destination must not be the same.');
			expect(fs.existsSync(source)).to.be.true;
		});
	});

	describe('nested dest', () => {
		it('should error when src is file', () => {
			const source = path.join(TEST_DIR, 'a', 'dir', 'file.txt');
			const destination = path.join(TEST_DIR, 'b', 'dir', 'file.txt');
			const sourceParent = path.join(TEST_DIR, 'a');
			const destinationParent = path.join(TEST_DIR, 'b');

			fse.ensureFileSync(source);
			fse.ensureSymlinkSync(sourceParent, destinationParent, 'dir');

			const result = fse.copySync(source, destination);
			expect(result.fails).to.be.true;
			expect(result.error!.message).to.equals('Source and destination must not be the same.');
			expect(fs.existsSync(source)).to.be.true;
		});

		it('should error when src is directory', () => {
			const source = path.join(TEST_DIR, 'a', 'dir', 'foo');
			const destination = path.join(TEST_DIR, 'b', 'dir', 'foo');
			const sourceParent = path.join(TEST_DIR, 'a');
			const destinationParent = path.join(TEST_DIR, 'b');

			fse.ensureDirSync(source);
			fse.ensureSymlinkSync(sourceParent, destinationParent, 'dir');

			const result = fse.copySync(source, destination);
			expect(result.fails).to.be.true;
			expect(result.error!.message).to.equals('Source and destination must not be the same.');
			expect(fs.existsSync(source)).to.be.true;
		});
	});
});

// src is directory:
//  src is regular, dest is symlink
//  src is symlink, dest is regular
//  src is symlink, dest is symlink

describe('> when src is a directory', () => {
	describe('>> when src is regular and dest is a symlink that points to src', () => {
		it('should error if dereference is true', () => {
			const source = path.join(TEST_DIR, 'src');

			fse.mkdirsSync(source);

			const subdir = path.join(TEST_DIR, 'src', 'subdir');

			fse.mkdirsSync(subdir);
			fse.writeFileSync(path.join(subdir, 'file.txt'), 'some data');

			const destinationLink = path.join(TEST_DIR, 'dest-symlink');

			fse.symlinkSync(source, destinationLink, 'dir');

			const oldlen = klawSync(source).length;

			const result = fse.copySync(source, destinationLink, { dereference: true });
			expect(result.fails).to.be.true;
			expect(result.error!.message).to.equals('Source and destination must not be the same.');

			const newlen = klawSync(source).length;
			expect(newlen).to.equals(oldlen);
			const link = fs.readlinkSync(destinationLink);
			expect(link).to.equals(source);
		});
	});

	describe('>> when src is a symlink that points to a regular dest', () => {
		it('should throw error', () => {
			const destination = path.join(TEST_DIR, 'dest');

			fse.mkdirsSync(destination);

			const subdir = path.join(TEST_DIR, 'dest', 'subdir');

			fse.mkdirsSync(subdir);
			fse.writeFileSync(path.join(subdir, 'file.txt'), 'some data');

			const sourceLink = path.join(TEST_DIR, 'src-symlink');

			fse.symlinkSync(destination, sourceLink, 'dir');

			const oldlen = klawSync(destination).length;

			const result = fse.copySync(sourceLink, destination);
			expect(result.fails).to.be.true;

			// assert nothing copied
			const newlen = klawSync(destination).length;
			expect(newlen).to.equals(oldlen);
			const link = fs.readlinkSync(sourceLink);
			expect(link).to.equals(destination);
		});
	});

	describe('>> when src and dest are symlinks that point to the exact same path', () => {
		it('should error if src and dest are the same and dereferene is true', () => {
			const source = path.join(TEST_DIR, 'src');

			fse.mkdirsSync(source);

			const sourceLink = path.join(TEST_DIR, 'src_symlink');

			fse.symlinkSync(source, sourceLink, 'dir');

			const destinationLink = path.join(TEST_DIR, 'dest_symlink');

			fse.symlinkSync(source, destinationLink, 'dir');

			const srclenBefore = klawSync(sourceLink).length;
			const destlenBefore = klawSync(destinationLink).length;

			const result = fse.copySync(source, destinationLink, { dereference: true });
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
	});
});

// src is file:
//  src is regular, dest is symlink
//  src is symlink, dest is regular
//  src is symlink, dest is symlink

describe('> when src is a file', () => {
	describe('>> when src is regular and dest is a symlink that points to src', () => {
		it('should error if dereference is true', () => {
			const source = path.join(TEST_DIR, 'src', 'somefile.txt');

			fse.ensureFileSync(source);
			fse.writeFileSync(source, 'some data');

			const destinationLink = path.join(TEST_DIR, 'dest-symlink');

			fse.symlinkSync(source, destinationLink, 'file');

			const result = fse.copySync(source, destinationLink, { dereference: true });
			expect(result.fails).to.be.true;
			expect(result.error!.message).to.equals('Source and destination must not be the same.');

			const link = fs.readlinkSync(destinationLink);
			expect(link).to.equals(source);
			expect(fs.readFileSync(link, 'utf8')).to.equals('some data');
		});
	});

	describe('>> when src is a symlink that points to a regular dest', () => {
		it('should throw error', () => {
			const destination = path.join(TEST_DIR, 'dest', 'somefile.txt');

			fse.outputFileSync(destination, 'some data');

			const sourceLink = path.join(TEST_DIR, 'src-symlink');

			fse.symlinkSync(destination, sourceLink, 'file');

			const result = fse.copySync(sourceLink, destination);
			expect(result.fails).to.be.true;

			const link = fs.readlinkSync(sourceLink);
			expect(link).to.equals(destination);
			expect(fs.readFileSync(link, 'utf8')).to.equals('some data');
		});
	});

	describe('>> when src and dest are symlinks that point to the exact same path', () => {
		it('should error if src and dest are the same and dereference is true', () => {
			const source = path.join(TEST_DIR, 'src', 'srcfile.txt');

			fse.outputFileSync(source, 'src data');

			const sourceLink = path.join(TEST_DIR, 'src_symlink');

			fse.symlinkSync(source, sourceLink, 'file');

			const destinationLink = path.join(TEST_DIR, 'dest_symlink');

			fse.symlinkSync(source, destinationLink, 'file');

			const result = fse.copySync(sourceLink, destinationLink, { dereference: true });
			expect(result.fails).to.be.true;
			expect(result.error!.message).to.equals('Source and destination must not be the same.');

			const srcln = fs.readlinkSync(sourceLink);
			expect(srcln).to.equals(source);
			const destln = fs.readlinkSync(destinationLink);
			expect(destln).to.equals(source);
			expect(fs.readFileSync(srcln, 'utf8')).to.equals('src data');
			expect(fs.readFileSync(destln, 'utf8')).to.equals('src data');
		});
	});
});
