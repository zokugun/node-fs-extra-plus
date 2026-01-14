import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fse from '../../src/index.js';

const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'copy-async-symlink-same-target');

beforeEach(async () => {
	await fse.emptyDirAsync(TEST_DIR);
});

afterEach(async () => {
	await fse.removeAsync(TEST_DIR);
});

describe('> when copying directory containing symlink', () => {
	it('should copy symlink when dest has no existing symlink', async () => {
		const target = path.join(TEST_DIR, 'target');
		const source = path.join(TEST_DIR, 'src');
		const destination = path.join(TEST_DIR, 'dest');

		// Setup
		fse.mkdirpSync(target);
		fse.writeFileSync(path.join(target, 'file.txt'), 'content');
		fse.mkdirpSync(source);
		fse.symlinkSync(target, path.join(source, 'link'), 'dir');

		// Copy
		const result = await fse.copyAsync(source, destination);
		expect(result.fails).to.be.false;

		// Verify symlink was copied
		const destinationLink = path.join(destination, 'link');
		expect(fs.lstatSync(destinationLink).isSymbolicLink()).to.be.true;
		expect(fs.readlinkSync(destinationLink)).to.equals(target);
	});

	// Also tests issue #1027
	it('should overwrite symlink when dest has existing symlink pointing to SAME target', async () => {
		const target = path.join(TEST_DIR, 'target');
		const source = path.join(TEST_DIR, 'src');
		const destination = path.join(TEST_DIR, 'dest');

		// Setup
		fse.mkdirpSync(target);
		fse.writeFileSync(path.join(target, 'file.txt'), 'content');
		fse.mkdirpSync(source);
		fse.mkdirpSync(destination);
		// Create symlinks pointing to the same target
		fse.symlinkSync(target, path.join(source, 'link'), 'dir');
		fse.symlinkSync(target, path.join(destination, 'link'), 'dir');

		// Copy should work - two different symlinks pointing to same target are NOT the same file
		const result = await fse.copyAsync(source, destination);
		expect(result.fails).to.be.false;

		// Verify symlink was copied/overwritten
		const destinationLink = path.join(destination, 'link');
		expect(fs.lstatSync(destinationLink).isSymbolicLink()).to.be.true;
		expect(fs.readlinkSync(destinationLink)).to.equals(target);
	});

	it('should overwrite symlink when dest has existing symlink pointing to DIFFERENT target', async () => {
		const target1 = path.join(TEST_DIR, 'target1');
		const target2 = path.join(TEST_DIR, 'target2');
		const source = path.join(TEST_DIR, 'src');
		const destination = path.join(TEST_DIR, 'dest');

		// Setup
		fse.mkdirpSync(target1);
		fse.mkdirpSync(target2);
		fse.writeFileSync(path.join(target1, 'file.txt'), 'content1');
		fse.writeFileSync(path.join(target2, 'file.txt'), 'content2');
		fse.mkdirpSync(source);
		fse.mkdirpSync(destination);
		// Create symlinks pointing to different targets
		fse.symlinkSync(target1, path.join(source, 'link'), 'dir');
		fse.symlinkSync(target2, path.join(destination, 'link'), 'dir');

		// Copy should work
		const result = await fse.copyAsync(source, destination);
		expect(result.fails).to.be.false;

		// Verify symlink was copied/overwritten to point to target1
		const destinationLink = path.join(destination, 'link');
		expect(fs.lstatSync(destinationLink).isSymbolicLink()).to.be.true;
		expect(fs.readlinkSync(destinationLink)).to.equals(target1);
	});
});

describe('> when copying file symlinks', () => {
	it('should overwrite file symlink when dest has existing symlink pointing to SAME target', async () => {
		const target = path.join(TEST_DIR, 'target.txt');
		const source = path.join(TEST_DIR, 'src');
		const destination = path.join(TEST_DIR, 'dest');

		// Setup
		fse.writeFileSync(target, 'content');
		fse.mkdirpSync(source);
		fse.mkdirpSync(destination);
		// Create file symlinks pointing to the same target
		fse.symlinkSync(target, path.join(source, 'link'), 'file');
		fse.symlinkSync(target, path.join(destination, 'link'), 'file');

		// Copy should work
		const result = await fse.copyAsync(source, destination);
		expect(result.fails).to.be.false;

		// Verify symlink was copied/overwritten
		const destinationLink = path.join(destination, 'link');
		expect(fs.lstatSync(destinationLink).isSymbolicLink()).to.be.true;
		expect(fs.readlinkSync(destinationLink)).to.equals(target);
	});

	it('should overwrite file symlink when dest has existing symlink pointing to DIFFERENT target', async () => {
		const target1 = path.join(TEST_DIR, 'target1.txt');
		const target2 = path.join(TEST_DIR, 'target2.txt');
		const source = path.join(TEST_DIR, 'src');
		const destination = path.join(TEST_DIR, 'dest');

		// Setup
		fse.writeFileSync(target1, 'content1');
		fse.writeFileSync(target2, 'content2');
		fse.mkdirpSync(source);
		fse.mkdirpSync(destination);
		// Create file symlinks pointing to different targets
		fse.symlinkSync(target1, path.join(source, 'link'), 'file');
		fse.symlinkSync(target2, path.join(destination, 'link'), 'file');

		// Copy should work
		const result = await fse.copyAsync(source, destination);
		expect(result.fails).to.be.false;

		// Verify symlink was copied/overwritten to point to target1
		const destinationLink = path.join(destination, 'link');
		expect(fs.lstatSync(destinationLink).isSymbolicLink()).to.be.true;
		expect(fs.readlinkSync(destinationLink)).to.equals(target1);
	});
});

describe('> when copying symlink directly to another symlink (issue #1019)', () => {
	it('should copy symlink to another symlink pointing to same target', async () => {
		const target = path.join(TEST_DIR, 'target.txt');
		const sourceLink = path.join(TEST_DIR, 'srcLink');
		const destinationLink = path.join(TEST_DIR, 'destLink');

		// Setup - two different symlinks pointing to the same file
		fs.writeFileSync(target, 'content');
		fs.symlinkSync(target, sourceLink, 'file');
		fs.symlinkSync(target, destinationLink, 'file');

		// Copy should work - these are different symlinks even though they point to the same target
		const result = await fse.copyAsync(sourceLink, destinationLink);
		expect(result.fails).to.be.false;

		expect(fs.lstatSync(destinationLink).isSymbolicLink()).to.be.true;
		expect(fs.readlinkSync(destinationLink)).to.equals(target);
	});
});

describe('> edge cases', () => {
	it('should still prevent copying a symlink to itself', async () => {
		const target = path.join(TEST_DIR, 'target');
		const link = path.join(TEST_DIR, 'link');

		// Setup
		fse.mkdirpSync(target);
		fse.symlinkSync(target, link, 'dir');

		// Copying a symlink to itself should fail
		const result = await fse.copyAsync(link, link);
		expect(result.fails).to.be.true;
		expect(result.error!.message).to.equals('Source and destination must not be the same.');
	});

	it('should allow copying symlink to subdirectory of its target (symlink copy, not recursive)', async () => {
		// When copying a symlink (not dereferencing), we just copy the link itself
		// This should be allowed because we're not recursively copying the target's contents
		const target = path.join(TEST_DIR, 'target');
		const source = path.join(TEST_DIR, 'src');

		// Setup
		fse.mkdirpSync(target);
		fse.mkdirpSync(path.join(target, 'subdir'));
		fse.mkdirpSync(source);
		fse.symlinkSync(target, path.join(source, 'link'), 'dir');

		// Dest is inside src's resolved target
		const destination = path.join(target, 'subdir', 'dest');

		// This should work - we're just copying the symlink, not following it
		const result = await fse.copyAsync(source, destination);
		expect(result.fails).to.be.false;

		// Verify symlink was copied
		const destinationLink = path.join(destination, 'link');
		expect(fs.lstatSync(destinationLink).isSymbolicLink()).to.be.true;
		expect(fs.readlinkSync(destinationLink)).to.equals(target);
	});
});
