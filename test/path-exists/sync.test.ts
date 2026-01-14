import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, expect, it } from 'vitest';
import fse from '../../src/index.js';

const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'path-exists-sync');

beforeEach(async () => {
	await fse.emptyDirAsync(TEST_DIR);
});

afterEach(async () => {
	await fse.removeAsync(TEST_DIR);
});

it('should return false if file does not exist', () => {
	const file = path.join(TEST_DIR, 'somefile');
	const result = fse.pathExistsSync(file);

	expect(result.value).to.be.false;
});

it('should return true if file does exist', () => {
	const file = path.join(TEST_DIR, 'exists');

	fse.ensureFileSync(file);

	const result = fse.pathExistsSync(file);
	expect(result.value).to.be.true;
});
