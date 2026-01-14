import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fse from '../../src/index.js';

const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'output-file-sync');

beforeEach(async () => {
	await fse.emptyDirAsync(TEST_DIR);
});

afterEach(async () => {
	await fse.removeAsync(TEST_DIR);
});

describe('> when the file and directory does not exist', () => {
	it('should create the file', () => {
		const file = path.join(TEST_DIR, Math.random() + 'nxst', Math.random() + '.txt');

		expect(fs.existsSync(file)).to.be.false;

		fse.outputFileSync(file, 'hello man');

		expect(fs.existsSync(TEST_DIR)).to.be.true;
		expect(fs.readFileSync(file, 'utf8')).to.equals('hello man');
	});
});

describe('> when the file does exist', () => {
	it('should still modify the file', () => {
		const file = path.join(TEST_DIR, Math.random() + 'wxst', Math.random() + '.txt');

		fse.mkdirsSync(path.dirname(file));

		fs.writeFileSync(file, 'hello world');

		fse.outputFileSync(file, 'hello man');

		expect(fs.readFileSync(file, 'utf8')).to.equals('hello man');
	});
});
