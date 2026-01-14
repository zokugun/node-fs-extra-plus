import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fse from '../../src/index.js';

const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'create-file-async');

beforeEach(async () => {
	await fse.emptyDirAsync(TEST_DIR);
});

afterEach(async () => {
	await fse.removeAsync(TEST_DIR);
});

describe('> when file exists', () => {
	it('should not do anything', async () => {
		const file = path.join(TEST_DIR, 'file.txt');
		fs.writeFileSync(file, 'blah');

		expect(fs.existsSync(file)).to.be.true;

		const result = await fse.ensureFileAsync(file);
		expect(result.fails).to.be.false;

		expect(fs.existsSync(file)).to.be.true;
	});
});

describe('> when file does not exist', () => {
	it('should create the file', async () => {
		const file = path.join(TEST_DIR, 'dir/that/does/not/exist', 'file.txt');

		expect(fs.existsSync(file)).to.be.false;

		const result = await fse.ensureFileAsync(file);
		expect(result.fails).to.be.false;

		expect(fs.existsSync(file)).to.be.true;
	});
});

describe('> when there is a directory at that path', () => {
	it('should error', async () => {
		const p = path.join(TEST_DIR, 'somedir2');
		fs.mkdirSync(p);

		const result = await fse.ensureFileAsync(p);
		expect(result.fails).to.be.true;
	});
});
