import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { isString } from '@zokugun/is-it-type';
import { err } from '@zokugun/xtry/sync';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type FsVoidResult } from '../../src/types/fs-void-result.js';

let $renameErrorCode: string | null = null;
let $renameCallCount = 0;

vi.doMock('../../src/fs/sync.js', async (factory) => {
	const original: { rename: (...args) => FsVoidResult } = await factory();

	const { rename } = original;

	return {
		...original,
		rename(...args: unknown[]) {
			if(isString($renameErrorCode)) {
				$renameCallCount += 1;

				const error = new Error($renameErrorCode);

				// @ts-expect-error TS2339
				error.code = $renameErrorCode;

				return err(error);
			}
			else {
				return rename(...args);
			}
		},
	};
});

const fse = await import('../../src/index.js');

vi.unmock('../../src/fs/sync.js');

function setUpMockFs(errCode: string) {
	$renameCallCount = 0;
	$renameErrorCode = errCode;
}

function tearDownMockFs() {
	$renameErrorCode = null;
}

const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'move-sync');

beforeEach(async () => {
	await fse.emptyDirAsync(TEST_DIR);

	// Create fixtures
	fse.outputFileSync(path.join(TEST_DIR, 'a-file'), 'sonic the hedgehog\n');
	fse.outputFileSync(path.join(TEST_DIR, 'a-folder/another-file'), 'tails\n');
	fse.outputFileSync(path.join(TEST_DIR, 'a-folder/another-folder/file3'), 'knuckles\n');
});

afterEach(async () => {
	await fse.removeAsync(TEST_DIR);
});

it('should not move if src and dest are the same', () => {
	const source = `${TEST_DIR}/a-file`;
	const destination = `${TEST_DIR}/a-file`;

	const result = fse.moveSync(source, destination);
	expect(result.fails).to.be.true;
	expect(result.error!.message).to.equals('Source and destination must not be the same.');

	// assert src not affected
	const contents = fs.readFileSync(source, 'utf8');
	const expected = /^sonic the hedgehog\r?\n$/;
	expect(contents).to.match(expected);
});

it('should error if src and dest are the same and src does not exist', () => {
	const source = `${TEST_DIR}/non-existent`;
	const destination = source;

	const result = fse.moveSync(source, destination);
	expect(result.fails).to.be.true;
});

it('should rename a file on the same device', () => {
	const source = `${TEST_DIR}/a-file`;
	const destination = `${TEST_DIR}/a-file-dest`;

	fse.moveSync(source, destination);

	const contents = fs.readFileSync(destination, 'utf8');
	const expected = /^sonic the hedgehog\r?\n$/;
	expect(contents).to.match(expected);
});

it('should not overwrite the destination by default', () => {
	const source = `${TEST_DIR}/a-file`;
	const destination = `${TEST_DIR}/a-folder/another-file`;

	// verify file exists already
	expect(fs.existsSync(destination)).to.be.true;

	const result = fse.moveSync(source, destination);
	expect(result.fails).to.be.true;
	expect(result.error!.message).to.equals('dest already exists.');
});

it('should not overwrite if overwrite = false', () => {
	const source = `${TEST_DIR}/a-file`;
	const destination = `${TEST_DIR}/a-folder/another-file`;

	// verify file exists already
	expect(fs.existsSync(destination)).to.be.true;

	const result = fse.moveSync(source, destination, { overwrite: false });
	expect(result.fails).to.be.true;
	expect(result.error!.message).to.equals('dest already exists.');
});

it('should overwrite file if overwrite = true', () => {
	const source = `${TEST_DIR}/a-file`;
	const destination = `${TEST_DIR}/a-folder/another-file`;

	// verify file exists already
	expect(fs.existsSync(destination)).to.be.true;

	const result = fse.moveSync(source, destination, { overwrite: true });
	expect(result.fails).to.be.false;

	const contents = fs.readFileSync(destination, 'utf8');
	const expected = /^sonic the hedgehog\r?\n$/;
	expect(contents).to.match(expected);
});

it('should overwrite the destination directory if overwrite = true', () => {
	// Create src
	const source = path.join(TEST_DIR, 'src');
	fse.ensureDirSync(source);
	fse.mkdirsSync(path.join(source, 'some-folder'));
	fse.writeFileSync(path.join(source, 'some-file'), 'hi');

	const destination = path.join(TEST_DIR, 'a-folder');

	// verify dest has stuff in it
	const pathsBefore = fs.readdirSync(destination);
	expect(pathsBefore).to.contains('another-file');
	expect(pathsBefore).to.contains('another-folder');

	fse.moveSync(source, destination, { overwrite: true });

	// verify dest does not have old stuff
	const pathsAfter = fs.readdirSync(destination);
	expect(pathsAfter).to.not.contains('another-file');
	expect(pathsAfter).to.not.contains('another-folder');

	// verify dest has new stuff
	expect(pathsAfter).to.contains('some-file');
	expect(pathsAfter).to.contains('some-folder');
});

it('should create directory structure by default', () => {
	const source = `${TEST_DIR}/a-file`;
	const destination = `${TEST_DIR}/does/not/exist/a-file-dest`;

	// verify dest directory does not exist
	expect(fs.existsSync(path.dirname(destination))).to.be.false;

	fse.moveSync(source, destination);

	const contents = fs.readFileSync(destination, 'utf8');
	const expected = /^sonic the hedgehog\r?\n$/;
	expect(contents).to.match(expected);
});

it('should work across devices', () => {
	const source = `${TEST_DIR}/a-file`;
	const destination = `${TEST_DIR}/a-file-dest`;

	setUpMockFs('EXDEV');

	fse.moveSync(source, destination);

	const contents = fs.readFileSync(destination, 'utf8');
	const expected = /^sonic the hedgehog\r?\n$/;
	expect(contents).to.match(expected);

	tearDownMockFs();

	expect($renameCallCount).to.equals(1);
});

it('should move folders', () => {
	const source = `${TEST_DIR}/a-folder`;
	const destination = `${TEST_DIR}/a-folder-dest`;

	// verify it doesn't exist
	expect(fs.existsSync(destination)).to.be.false;

	fse.moveSync(source, destination);

	const contents = fs.readFileSync(destination + '/another-file', 'utf8');
	const expected = /^tails\r?\n$/;
	expect(contents).to.match(expected);
});

it('should overwrite folders across devices', () => {
	const source = `${TEST_DIR}/a-folder`;
	const destination = `${TEST_DIR}/a-folder-dest`;
	fs.mkdirSync(destination);

	setUpMockFs('EXDEV');

	fse.moveSync(source, destination, { overwrite: true });

	const contents = fs.readFileSync(destination + '/another-folder/file3', 'utf8');
	const expected = /^knuckles\r?\n$/;
	expect(contents).to.match(expected);

	tearDownMockFs();

	expect($renameCallCount).to.equals(1);
});

it('should move folders across devices with EXDEV error', () => {
	const source = `${TEST_DIR}/a-folder`;
	const destination = `${TEST_DIR}/a-folder-dest`;

	setUpMockFs('EXDEV');

	fse.moveSync(source, destination);

	const contents = fs.readFileSync(destination + '/another-folder/file3', 'utf8');
	const expected = /^knuckles\r?\n$/;
	expect(contents).to.match(expected);

	tearDownMockFs();

	expect($renameCallCount).to.equals(1);
});

describe('clobber', () => {
	it('should be an alias for overwrite', () => {
		const source = `${TEST_DIR}/a-file`;
		const destination = `${TEST_DIR}/a-folder/another-file`;

		// verify file exists already
		expect(fs.existsSync(destination)).to.be.true;

		fse.moveSync(source, destination, { clobber: true });

		const contents = fs.readFileSync(destination, 'utf8');
		const expected = /^sonic the hedgehog\r?\n$/;
		expect(contents).to.match(expected);
	});
});

describe('> when trying to move a folder into itself', () => {
	it('should produce an error', () => {
		const sourceDir = path.join(TEST_DIR, 'src');
		const destinationDir = path.join(TEST_DIR, 'src', 'dest');

		expect(fs.existsSync(sourceDir)).to.be.false;
		fse.mkdirSync(sourceDir);
		expect(fs.existsSync(sourceDir)).to.be.true;

		const result = fse.moveSync(sourceDir, destinationDir);
		expect(result.fails).to.be.true;
		expect(result.error!.message).to.equals(`Cannot move '${sourceDir}' to a subdirectory of itself, '${destinationDir}'.`);

		expect(fs.existsSync(sourceDir)).to.be.true;
		expect(fs.existsSync(destinationDir)).to.be.false;
	});
});

describe('> when trying to move a file into its parent subdirectory', () => {
	it('should move successfully', () => {
		const source = `${TEST_DIR}/a-file`;
		const destination = `${TEST_DIR}/dest/a-file-dest`;

		fse.moveSync(source, destination);

		const contents = fs.readFileSync(destination, 'utf8');
		const expected = /^sonic the hedgehog\r?\n$/;
		expect(contents).to.match(expected);
	});
});

describe.runIf(process.platform === 'win32')('> when dest parent is root', () => {
	let destination: string;

	afterEach(() => fse.removeSync(destination));

	it('should not create parent directory', () => {
		const source = path.join(TEST_DIR, 'a-file');
		destination = path.join(path.parse(TEST_DIR).root, 'another-file');

		fse.moveSync(source, destination);

		const contents = fs.readFileSync(destination, 'utf8');
		const expected = /^sonic the hedgehog\r?\n$/;
		expect(contents).to.match(expected);
	});
});
