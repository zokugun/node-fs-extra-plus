import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import klaw from 'klaw';
import klawSync from 'klaw-sync';
import { afterEach, beforeEach, expect, it } from 'vitest';
import fse from '../../src/index.js';

const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'mode-async-set');
const FILE = path.join('dir1', 'file1.txt');
const DIRECTORY = path.join('dir1', 'dir2');

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

it('should set successfully', async () => {
	fse.outputFileSync(path.join(TEST_DIR, FILE), FILE);
	fse.mkdirSync(path.join(TEST_DIR, DIRECTORY));

	const sourceDir = path.join(TEST_DIR, 'dir1');
	const sourceHierarchy = klawSync(sourceDir);
	const mode = fse.mode.sanitize('a=rX').value!;

	// reset mode
	for(const source of sourceHierarchy) {
		const result = fse.chmodSync(source.path, 0);
		expect(result.fails).to.be.false;
	}

	// set
	for(const source of sourceHierarchy) {
		const result = await fse.mode.setAsync(source.path, mode);
		expect(result.fails).to.be.false;
	}

	const sourceHierarchyCheck = klawSync(sourceDir);
	for(const source of sourceHierarchyCheck) {
		expect(fse.mode.includes(source.stats.mode, mode)).to.be.true;
	}
});
