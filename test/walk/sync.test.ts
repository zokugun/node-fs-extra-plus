import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fse, { type WalkItem, type WalkOptions } from '../../src/index.js';

function absolute(pathname: string): string {
	return path.join(TEST_DIR, pathname);
}

const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'walk-sync');
const DIR_NAMES = ['dir1', 'dir2', 'dir2/dir2_1', 'dir2/dir2_1/dir2_1_1'];
const DIR_PATHS = DIR_NAMES.map(absolute);
const FILE_NAMES = ['dir1/file1_2', 'dir2/dir2_1/file2_1_1', 'file1'];
const FILE_PATHS = FILE_NAMES.map(absolute);

beforeEach(async () => {
	await fse.emptyDirAsync(TEST_DIR);

	for(const file of FILE_PATHS) {
		fse.ensureFileSync(file);
	}

	for(const dir of DIR_PATHS) {
		fse.ensureDirSync(dir);
	}
});

afterEach(async () => {
	await fse.removeAsync(TEST_DIR);
});

it('should return an error if the source dir does not exist', () => {
	const result = fse.walkSync('dirDoesNotExist/');

	expect(result.fails).to.be.true;
	expect(result.error!.code).to.equals('ENOENT');
});

it('should return an error if the source is not a dir', () => {
	const result = fse.walkSync(FILE_PATHS[0]);

	expect(result.fails).to.be.true;
	expect(result.error!.code).to.equals('ENOTDIR');
});

it('should return all items of a dir containing path and stats object', () => {
	const paths = [
		{ path: DIR_NAMES[0], stats: fs.statSync(DIR_PATHS[0]) },
		{ path: FILE_NAMES[0], stats: fs.statSync(FILE_PATHS[0]) },
		{ path: DIR_NAMES[1], stats: fs.statSync(DIR_PATHS[1]) },
		{ path: DIR_NAMES[2], stats: fs.statSync(DIR_PATHS[2]) },
		{ path: DIR_NAMES[3], stats: fs.statSync(DIR_PATHS[3]) },
		{ path: FILE_NAMES[1], stats: fs.statSync(FILE_PATHS[1]) },
		{ path: FILE_NAMES[2], stats: fs.statSync(FILE_PATHS[2]) },
	];

	const result = fse.walkSync(TEST_DIR);
	expect(result.fails).to.be.false;

	let index = 0;

	for(const item of result.value!) {
		expect(item.fails).to.be.false;
		expect(item.value!.path).to.equals(paths[index].path);
		expect(item.value!.stats).to.eql(paths[index].stats);

		index += 1;
	}

	expect(index).to.be.greaterThan(0);
});

it('should return only files if opts.onlyFiles is true', () => {
	const filesOnly = [
		{ path: FILE_NAMES[0], stats: fs.statSync(FILE_PATHS[0]) },
		{ path: FILE_NAMES[1], stats: fs.statSync(FILE_PATHS[1]) },
		{ path: FILE_NAMES[2], stats: fs.statSync(FILE_PATHS[2]) },
	];

	const result = fse.walkSync(TEST_DIR, { onlyFiles: true });
	expect(result.fails).to.be.false;

	let index = 0;

	for(const item of result.value!) {
		expect(item.fails).to.be.false;
		expect(item.value!.path).to.equals(filesOnly[index].path);
		expect(item.value!.stats).to.eql(filesOnly[index].stats);

		index += 1;
	}

	expect(index).to.be.greaterThan(0);
});

it('should return only dirs if opts.onlyDirectories is true', () => {
	const directoriesOnly = [
		{ path: DIR_NAMES[0], stats: fs.statSync(DIR_PATHS[0]) },
		{ path: DIR_NAMES[1], stats: fs.statSync(DIR_PATHS[1]) },
		{ path: DIR_NAMES[2], stats: fs.statSync(DIR_PATHS[2]) },
		{ path: DIR_NAMES[3], stats: fs.statSync(DIR_PATHS[3]) },
	];

	const result = fse.walkSync(TEST_DIR, { onlyDirectories: true });
	expect(result.fails).to.be.false;

	let index = 0;

	for(const item of result.value!) {
		expect(item.fails).to.be.false;
		expect(item.value!.path).to.equals(directoriesOnly[index].path);
		expect(item.value!.stats).to.eql(directoriesOnly[index].stats);

		index += 1;
	}

	expect(index).to.be.greaterThan(0);
});

it('should honor opts.absolute is true', () => {
	const paths = [
		{ path: DIR_PATHS[0], stats: fs.statSync(DIR_PATHS[0]) },
		{ path: FILE_PATHS[0], stats: fs.statSync(FILE_PATHS[0]) },
		{ path: DIR_PATHS[1], stats: fs.statSync(DIR_PATHS[1]) },
		{ path: DIR_PATHS[2], stats: fs.statSync(DIR_PATHS[2]) },
		{ path: DIR_PATHS[3], stats: fs.statSync(DIR_PATHS[3]) },
		{ path: FILE_PATHS[1], stats: fs.statSync(FILE_PATHS[1]) },
		{ path: FILE_PATHS[2], stats: fs.statSync(FILE_PATHS[2]) },
	];

	const result = fse.walkSync(TEST_DIR, { absolute: true });
	expect(result.fails).to.be.false;

	let index = 0;

	for(const item of result.value!) {
		expect(item.fails).to.be.false;
		expect(item.value!.path).to.equals(paths[index].path);
		expect(item.value!.stats).to.eql(paths[index].stats);

		index += 1;
	}

	expect(index).to.be.greaterThan(0);
});

it('should honor opts.markDirectories is true', () => {
	const paths = [
		{ path: `${DIR_NAMES[0]}${path.sep}`, stats: fs.statSync(DIR_PATHS[0]) },
		{ path: FILE_NAMES[0], stats: fs.statSync(FILE_PATHS[0]) },
		{ path: `${DIR_NAMES[1]}${path.sep}`, stats: fs.statSync(DIR_PATHS[1]) },
		{ path: `${DIR_NAMES[2]}${path.sep}`, stats: fs.statSync(DIR_PATHS[2]) },
		{ path: `${DIR_NAMES[3]}${path.sep}`, stats: fs.statSync(DIR_PATHS[3]) },
		{ path: FILE_NAMES[1], stats: fs.statSync(FILE_PATHS[1]) },
		{ path: FILE_NAMES[2], stats: fs.statSync(FILE_PATHS[2]) },
	];

	const result = fse.walkSync(TEST_DIR, { markDirectories: true });
	expect(result.fails).to.be.false;

	let index = 0;

	for(const item of result.value!) {
		expect(item.fails).to.be.false;
		expect(item.value!.path).to.equals(paths[index].path);
		expect(item.value!.stats).to.eql(paths[index].stats);

		index += 1;
	}

	expect(index).to.be.greaterThan(0);
});

it('should honor opts.onlyFiles is true and with sorter', () => {
	const filesOnly = [
		{ path: FILE_NAMES[2], stats: fs.statSync(FILE_PATHS[2]) },
		{ path: FILE_NAMES[1], stats: fs.statSync(FILE_PATHS[1]) },
		{ path: FILE_NAMES[0], stats: fs.statSync(FILE_PATHS[0]) },
	];

	const result = fse.walkSync(TEST_DIR, { onlyFiles: true, sorter: (a, b) => b.localeCompare(a) });
	expect(result.fails).to.be.false;

	let index = 0;

	for(const item of result.value!) {
		expect(item.fails).to.be.false;
		expect(item.value!.path).to.equals(filesOnly[index].path);
		expect(item.value!.stats).to.eql(filesOnly[index].stats);

		index += 1;
	}

	expect(index).to.be.greaterThan(0);
});

describe('when opts.filter is true', () => {
	it('should filter based on path', () => {
		const f1 = path.join(TEST_DIR, 'foo.js');
		const f2 = path.join(TEST_DIR, 'bar.js');
		fse.ensureFileSync(f1);
		fse.ensureFileSync(f2);

		const paths = [{ path: 'foo.js', stats: fs.statSync(f1) }];
		const filter = (item: WalkItem) => path.basename(item.path).includes('foo');

		const result = fse.walkSync(TEST_DIR, { filter });
		expect(result.fails).to.be.false;

		let index = 0;

		for(const item of result.value!) {
			expect(item.fails).to.be.false;
			expect(item.value!.path).to.equals(paths[index].path);
			expect(item.value!.stats).to.eql(paths[index].stats);

			index += 1;
		}

		expect(index).to.be.greaterThan(0);
	});

	it('should filter based on stats', () => {
		const f1 = path.join(TEST_DIR, 'bar.js');
		const f2 = path.join(TEST_DIR, 'foo.js');
		fse.outputFileSync(f1, 'test file 1 contents');
		fse.outputFileSync(f2, 'test file 2 contents');

		const paths = [
			{ path: 'bar.js', stats: fs.statSync(f1) },
			{ path: 'foo.js', stats: fs.statSync(f2) },
		];

		const filter = (item: WalkItem) => item.stats.isFile() && item.stats.size > 0;

		const result = fse.walkSync(TEST_DIR, { filter });
		expect(result.fails).to.be.false;

		let index = 0;

		for(const item of result.value!) {
			expect(item.fails).to.be.false;
			expect(item.value!.path).to.equals(paths[index].path);
			expect(item.value!.stats).to.eql(paths[index].stats);

			index += 1;
		}

		expect(index).to.be.greaterThan(0);
	});

	it('should filter based on both path and stats', () => {
		const f1 = path.join(TEST_DIR, 'foo.js');
		const f2 = path.join(TEST_DIR, 'bar.js');
		fse.outputFileSync(f1, 'test file 1 contents');
		fse.outputFileSync(f2, 'test file 2 contents');

		const paths = [{ path: 'foo.js', stats: fs.statSync(f1) }];
		const filter = (item: WalkItem) => path.basename(item.path).includes('foo') && item.stats.isFile() && item.stats.size > 0;

		const result = fse.walkSync(TEST_DIR, { filter });
		expect(result.fails).to.be.false;

		let index = 0;

		for(const item of result.value!) {
			expect(item.fails).to.be.false;
			expect(item.value!.path).to.equals(paths[index].path);
			expect(item.value!.stats).to.eql(paths[index].stats);

			index += 1;
		}

		expect(index).to.be.greaterThan(0);
	});

	it('should ignore hidden directories', () => {
		const dir1 = path.join(TEST_DIR, '.dir1');
		const dir2 = path.join(TEST_DIR, '.dir2');
		fse.ensureDirSync(dir1);
		fse.ensureDirSync(dir2);

		const filter = (item: WalkItem) => !path.basename(item.path).startsWith('.');

		const result = fse.walkSync(TEST_DIR, { filter });
		expect(result.fails).to.be.false;

		let index = 0;

		for(const item of result.value!) {
			expect(item.value!.path).to.not.be.equals('.dir1');
			expect(item.value!.path).to.not.be.equals('.dir2');

			index += 1;
		}

		expect(index).to.be.greaterThan(0);
	});

	it('should filter and apply opts.onlyFiles', () => {
		const f1 = path.join(TEST_DIR, 'bar.js');
		const f2 = path.join(TEST_DIR, 'foo.js');
		fse.outputFileSync(f1, 'test file 1 contents');
		fse.outputFileSync(f2, 'test file 2 contents');

		const paths = [
			{ path: 'bar.js', stats: fs.statSync(f1) },
			{ path: 'foo.js', stats: fs.statSync(f2) },
		];
		const filter = (item: WalkItem) => item.stats.isFile() && item.stats.size > 0;

		const result = fse.walkSync(TEST_DIR, { filter, onlyFiles: true });
		expect(result.fails).to.be.false;

		let index = 0;

		for(const item of result.value!) {
			expect(item.fails).to.be.false;
			expect(item.value!.path).to.equals(paths[index].path);
			expect(item.value!.stats).to.eql(paths[index].stats);

			index += 1;
		}

		expect(index).to.be.greaterThan(0);
	});

	it('should filter and apply opts.onlyDirectories', () => {
		const f = path.join(TEST_DIR, 'foo.js');
		const d1 = path.join(TEST_DIR, 'foo');
		const d2 = path.join(TEST_DIR, 'foobar');
		fse.ensureFileSync(f);
		fse.ensureDirSync(d1);
		fse.ensureDirSync(d2);

		const paths = [
			{ path: 'foo', stats: fs.statSync(d1) },
			{ path: 'foobar', stats: fs.statSync(d2) },
		];

		const filter = (item: WalkItem) => item.path.includes('foo');

		const result = fse.walkSync(TEST_DIR, { filter, onlyDirectories: true });
		expect(result.fails).to.be.false;

		let index = 0;

		for(const item of result.value!) {
			expect(item.fails).to.be.false;
			expect(item.value!.path).to.equals(paths[index].path);
			expect(item.value!.stats).to.eql(paths[index].stats);

			index += 1;
		}

		expect(index).to.be.greaterThan(0);
	});
});

describe('depth limit', () => {
	function testDepthLimit(depthLimit: number, expected: string[], options: WalkOptions = {}) {
		for(const file of ['a/b/c/d.txt', 'a/e.jpg', 'h/i/j/k.txt', 'h/i/l.txt', 'h/i/m.jpg', 't.txt']) {
			fse.outputFileSync(path.join(TEST_DIR, file), path.basename(file, path.extname(file)));
		}

		const result = fse.walkSync(TEST_DIR, { ...options, depthLimit });
		expect(result.fails).to.be.false;

		let index = 0;

		for(const item of result.value!) {
			expect(item.fails).to.be.false;
			expect(item.value!.path).to.equals(expected[index]);

			index += 1;
		}

		expect(index).to.equals(expected.length);
	}

	beforeEach(() => {
		fse.emptyDirSync(TEST_DIR);
	});

	it('should honor depthLimit option -1', () => {
		testDepthLimit(-1, ['a', 'a/b', 'a/b/c', 'a/b/c/d.txt', 'a/e.jpg', 'h', 'h/i', 'h/i/j', 'h/i/j/k.txt', 'h/i/l.txt', 'h/i/m.jpg', 't.txt']);
	});

	it('should honor depthLimit option 0', () => {
		testDepthLimit(0, ['a', 'h', 't.txt']);
	});

	it('should honor depthLimit option 1', () => {
		testDepthLimit(1, ['a', 'a/b', 'a/e.jpg', 'h', 'h/i', 't.txt']);
	});

	it('should honor depthLimit option 2', () => {
		testDepthLimit(2, ['a', 'a/b', 'a/b/c', 'a/e.jpg', 'h', 'h/i', 'h/i/j', 'h/i/l.txt', 'h/i/m.jpg', 't.txt']);
	});

	it('should honor depthLimit option 3', () => {
		testDepthLimit(3, ['a', 'a/b', 'a/b/c', 'a/b/c/d.txt', 'a/e.jpg', 'h', 'h/i', 'h/i/j', 'h/i/j/k.txt', 'h/i/l.txt', 'h/i/m.jpg', 't.txt']);
	});

	it('should honor depthLimit option -1 with onlyFiles = true', () => {
		testDepthLimit(-1, ['a/b/c/d.txt', 'a/e.jpg', 'h/i/j/k.txt', 'h/i/l.txt', 'h/i/m.jpg', 't.txt'], { onlyFiles: true });
	});

	it('should honor depthLimit option 0 with onlyFiles = true', () => {
		testDepthLimit(0, ['t.txt'], { onlyFiles: true });
	});

	it('should honor depthLimit option 1 with onlyFiles = true', () => {
		testDepthLimit(1, ['a/e.jpg', 't.txt'], { onlyFiles: true });
	});

	it('should honor depthLimit option -1 with onlyFiles = true and with a filter to search for a specific file', () => {
		const filter = (item: WalkItem) => item.stats.isDirectory() || path.basename(item.path) === 'k.txt';

		testDepthLimit(-1, ['h/i/j/k.txt'], { onlyFiles: true, filter });
	});

	it('should return all files except under filtered out directory', () => {
		const filter = (item: WalkItem) => !item.stats.isDirectory() || (item.stats.isDirectory() && path.basename(item.path) !== 'h');

		testDepthLimit(-1, ['a/b/c/d.txt', 'a/e.jpg', 't.txt'], { onlyFiles: true, filter });
	});
});

describe('traverse all', () => {
	function testTraverseAll(options: WalkOptions, expected) {
		for(const file of ['a/b/c/d.txt', 'a/e.jpg', 'h/i/j/k.txt', 'h/i/l.txt', 'h/i/m.jpg', 't.txt']) {
			fse.outputFileSync(path.join(TEST_DIR, file), path.basename(file, path.extname(file)));
		}

		const result = fse.walkSync(TEST_DIR, { ...options, traverseAll: true });
		expect(result.fails).to.be.false;

		let index = 0;

		for(const item of result.value!) {
			expect(item.fails).to.be.false;
			expect(item.value!.path).to.equals(expected[index]);

			index += 1;
		}

		expect(index).to.equals(expected.length);
	}

	beforeEach(() => {
		fse.emptyDirSync(TEST_DIR);
	});

	it('should honor traverseAll option with no filter & onlyFiles: false', () => {
		testTraverseAll({ onlyFiles: false }, ['a', 'a/b', 'a/b/c', 'a/b/c/d.txt', 'a/e.jpg', 'h', 'h/i', 'h/i/j', 'h/i/j/k.txt', 'h/i/l.txt', 'h/i/m.jpg', 't.txt']);
	});

	it('should honor traverseAll option with no filter & onlyFiles: true', () => {
		testTraverseAll({ onlyFiles: true }, ['a/b/c/d.txt', 'a/e.jpg', 'h/i/j/k.txt', 'h/i/l.txt', 'h/i/m.jpg', 't.txt']);
	});

	it('should honor traverseAll option with filter & onlyFiles: true', () => {
		const filter = (item: WalkItem) => path.extname(item.path) === '.txt';

		testTraverseAll({ onlyFiles: true, filter }, ['a/b/c/d.txt', 'h/i/j/k.txt', 'h/i/l.txt', 't.txt']);
	});

	it('should honor traverseAll option with filter & onlyFiles: false', () => {
		const filter = (item: WalkItem) => path.basename(item.path) !== 'i' && path.extname(item.path) !== '.txt';

		testTraverseAll({ onlyFiles: false, filter }, ['a', 'a/b', 'a/b/c', 'a/e.jpg', 'h', 'h/i/j', 'h/i/m.jpg']);
	});
});

describe('symlinks', () => {
	function testSymlinks(preserveSymlinks: boolean, expected) {
		for(const file of ['a/b/c/d.txt', 'a/e.jpg', 't.txt']) {
			fse.outputFileSync(path.join(TEST_DIR, file), path.basename(file, path.extname(file)));
		}

		fse.symlinkSync(path.join(TEST_DIR, 'a'), path.join(TEST_DIR, 'h'));

		const result = fse.walkSync(TEST_DIR, { preserveSymlinks });
		expect(result.fails).to.be.false;

		let index = 0;

		for(const item of result.value!) {
			expect(item.fails).to.be.false;
			expect(item.value!.path).to.equals(expected[index]);

			index += 1;
		}

		expect(index).to.equals(expected.length);
	}

	beforeEach(() => {
		fse.emptyDirSync(TEST_DIR);
	});

	it('should honor preserveSymlinks option false', () => {
		testSymlinks(false, ['a', 'a/b', 'a/b/c', 'a/b/c/d.txt', 'a/e.jpg', 'h', 'h/b', 'h/b/c', 'h/b/c/d.txt', 'h/e.jpg', 't.txt']);
	});

	it('should honor preserveSymlinks option true', () => {
		testSymlinks(true, ['a', 'a/b', 'a/b/c', 'a/b/c/d.txt', 'a/e.jpg', 'h', 't.txt']);
	});
});
