import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fse from '../../src/index.js';

const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'empty-dir-async');

beforeEach(async () => {
	await fse.emptyDirAsync(TEST_DIR);
});

afterEach(async () => {
	await fse.removeAsync(TEST_DIR);
});

describe('> when directory exists and contains items', () => {
	it('should delete all of the items', async () => {
		expect(fs.readdirSync(TEST_DIR).length).to.be.equals(0);

		fse.ensureFileSync(path.join(TEST_DIR, 'some-file'));
		fse.ensureFileSync(path.join(TEST_DIR, 'some-file-2'));
		fse.ensureDirSync(path.join(TEST_DIR, 'some-dir'));

		expect(fs.readdirSync(TEST_DIR).length).to.be.equals(3);

		const result = await fse.emptyDirAsync(TEST_DIR);

		expect(result.fails).to.be.false;
		expect(fs.readdirSync(TEST_DIR).length).to.be.equals(0);
	});
});

describe('> when directory exists and contains no items', () => {
	it('should do nothing', async () => {
		expect(fs.readdirSync(TEST_DIR).length).to.be.equals(0);

		const result = await fse.emptyDirAsync(TEST_DIR);

		expect(result.fails).to.be.false;
		expect(fs.readdirSync(TEST_DIR).length).to.be.equals(0);
	});
});

describe('> when directory does not exist', () => {
	it('should create it', async () => {
		fse.removeSync(TEST_DIR);

		expect(fs.existsSync(TEST_DIR)).to.be.false;

		const result = await fse.emptyDirAsync(TEST_DIR);

		expect(result.fails).to.be.false;
		expect(fs.readdirSync(TEST_DIR).length).to.be.equals(0);
	});
});
