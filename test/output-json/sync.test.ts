import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fse from '../../src/index.js';

const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'output-json-sync');

beforeEach(async () => {
	await fse.emptyDirAsync(TEST_DIR);
});

afterEach(async () => {
	await fse.removeAsync(TEST_DIR);
});

it('should write the file regardless of whether the directory exists or not', () => {
	const file = path.join(TEST_DIR, 'this-dir', 'prob-does-not', 'exist', 'file.json');

	expect(fs.existsSync(file)).to.be.false;

	const data = { name: 'JP' };

	fse.outputJsonSync(file, data);

	expect(fs.existsSync(file)).to.be.true;

	const newData = JSON.parse(fs.readFileSync(file, 'utf8')) as unknown;

	expect(newData).toMatchObject(data);
});

describe('> when an option is passed, like JSON replacer', () => {
	it('should pass the option along to jsonfile module', () => {
		const file = path.join(TEST_DIR, 'this-dir', 'does-not', 'exist', 'really', 'file.json');

		expect(fs.existsSync(file)).to.be.false;

		const replacer = (_k: string, v: unknown) => v === 'JP' ? 'Jon Paul' : v;
		const data = { name: 'JP' };

		fse.outputJsonSync(file, data, { replacer });

		const newData = JSON.parse(fs.readFileSync(file, 'utf8')) as unknown;

		expect(newData).toMatchObject({ name: 'Jon Paul' });
	});
});
