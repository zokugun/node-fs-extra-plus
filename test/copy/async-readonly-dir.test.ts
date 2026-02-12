import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import klaw from 'klaw';
import klawSync from 'klaw-sync';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fse from '../../src/index.js';

const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'copy-async-readonly-dir');
const FILES = [
	path.join('dir1', 'file1.txt'),
	path.join('dir1', 'dir2', 'file2.txt'),
	path.join('dir1', 'dir2', 'dir3', 'file3.txt'),
];

beforeEach(async () => {
	if(fse.isExistingSync(TEST_DIR)) {
		for await (const data of klaw(TEST_DIR)) {
			fs.chmodSync(data.path, 0o777);
		}
	}

	await fse.emptyDirAsync(TEST_DIR);
});

afterEach(async () => {
	for await (const data of klaw(TEST_DIR)) {
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
		const targetMode = fse.mode.sanitize('a=rX').value!;

		for(const source of sourceHierarchy) {
			const result = fse.chmodSync(source.path, getMode(source));
			expect(result.fails).to.be.false;
		}

		const sourceHierarchyCheck = klawSync(sourceDir);
		for(const source of sourceHierarchyCheck) {
			expect(fse.mode.includes(source.stats.mode, targetMode)).to.be.true;
		}

		const result = await fse.copyAsync(sourceDir, targetDir);
		expect(result.fails).to.be.false;

		// Make sure copy was made and mode was preserved
		expect(fs.existsSync(targetDir)).to.be.true;

		const targetHierarchy = klawSync(targetDir);
		expect(targetHierarchy.length).to.equals(sourceHierarchy.length);

		for(const target of targetHierarchy) {
			expect(fse.mode.includes(target.stats.mode, targetMode)).to.be.true;
		}
	});
});

function getMode(item: klawSync.Item): number {
	return fse.mode.sanitizeNumber(item.stats.isDirectory() ? 0o555 : 0o444);
}
