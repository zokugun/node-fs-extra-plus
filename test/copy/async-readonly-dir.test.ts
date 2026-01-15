import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import klawSync from 'klaw-sync';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fse from '../../src/index.js';

const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'copy-async-readonly-dir');
const FILES = [
	path.join('dir1', 'file1.txt'),
	path.join('dir1', 'dir2', 'file2.txt'),
	path.join('dir1', 'dir2', 'dir3', 'file3.txt'),
];
const PLATFORM = os.platform();

beforeEach(async () => {
	await fse.emptyDirAsync(TEST_DIR);
});

afterEach(async () => {
	for(const data of klawSync(TEST_DIR)) {
		fs.chmodSync(data.path, 0o777);
	}

	await fse.removeAsync(TEST_DIR);
});

describe('> when src is readonly directory with content', () => {
	it('should copy successfully', async () => {
		for(const file of FILES) {
			fse.outputFileSync(path.join(TEST_DIR, file), file);
		}

		const sourceDir = path.join(TEST_DIR, 'dir1');
		const sourceHierarchy = klawSync(sourceDir);
		const targetDir = path.join(TEST_DIR, 'target');

		for(const source of sourceHierarchy) {
			fse.chmodSync(source.path, getMode(source));
		}

		const sourceHierarchyCheck = klawSync(sourceDir);
		// Stats.mode includes the file type bits, mask to compare permissions only
		for(const source of sourceHierarchyCheck) {
			expect(source.stats.mode & 0o777).to.equals(getMode(source));
		}

		const result = await fse.copyAsync(sourceDir, targetDir);
		expect(result.fails).to.be.false;

		// Make sure copy was made and mode was preserved
		expect(fs.existsSync(targetDir)).to.be.true;

		const targetHierarchy = klawSync(targetDir);
		expect(targetHierarchy.length).to.equals(sourceHierarchy.length);

		for(const target of targetHierarchy) {
			expect(target.stats.mode & 0o777).to.equals(getMode(target));
		}
	});
});

function getMode(item: klawSync.Item): number {
	if(PLATFORM === 'win32') {
		return 0o444;
	}
	else {
		return item.stats.isDirectory() ? 0o555 : 0o444;
	}
}
