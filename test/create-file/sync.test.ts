import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fse from '../../src/index.js';

const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'create-file-sync');

beforeEach(async () => {
	await fse.emptyDirAsync(TEST_DIR);
});

afterEach(async () => {
	await fse.removeAsync(TEST_DIR);
});

describe('> when file exists', () => {
	it('should not do anything', () => {
		const file = path.join(TEST_DIR, 'file.txt');
		fs.writeFileSync(file, 'blah');

		expect(fs.existsSync(file)).to.be.true;

		const result = fse.ensureFileSync(file);
		expect(result.fails).to.be.false;

		expect(fs.existsSync(file)).to.be.true;
	});
});

describe('> when file does not exist', () => {
	it('should create the file', () => {
		const file = path.join(TEST_DIR, 'dir/that/does/not/exist', 'file.txt');

		expect(fs.existsSync(file)).to.be.false;

		const result = fse.ensureFileSync(file);
		expect(result.fails).to.be.false;

		expect(fs.existsSync(file)).to.be.true;
	});

	it('should create the JSON file', () => {
		const file = path.join(TEST_DIR, 'dir/that/does/not/exist', 'file.json');

		expect(fs.existsSync(file)).to.be.false;

		const result = fse.ensureFileSync(file, '{}');
		expect(result.fails).to.be.false;

		expect(fs.existsSync(file)).to.be.true;
		expect(fs.readFileSync(file, 'utf8')).to.equals('{}');
	});
});

describe('> when there is a directory at that path', () => {
	it('should error', () => {
		const p = path.join(TEST_DIR, 'somedir2');
		fs.mkdirSync(p);

		const result = fse.ensureFileSync(p);
		expect(result.fails).to.be.true;
	});
});
