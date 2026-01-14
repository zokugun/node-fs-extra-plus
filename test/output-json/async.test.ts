import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fse from '../../src/index.js';

const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'output-json-async');

beforeEach(async () => {
	await fse.emptyDirAsync(TEST_DIR);
});

afterEach(async () => {
	await fse.removeAsync(TEST_DIR);
});

it('should write the file regardless of whether the directory exists or not', async () => {
	const file = path.join(TEST_DIR, 'this-dir', 'prob-does-not', 'exist', 'file.json');

	expect(fs.existsSync(file)).to.be.false;

	const data = { name: 'JP' };

	await fse.outputJsonAsync(file, data);

	expect(fs.existsSync(file)).to.be.true;

	const newData = JSON.parse(fs.readFileSync(file, 'utf8')) as unknown;

	expect(newData).toMatchObject(data);
});

it('should be mutation-proof', async () => {
	const dir = path.join(TEST_DIR, 'this-dir', 'certanly-does-not', 'exist');
	const file = path.join(dir, 'file.json');

	expect(fs.existsSync(dir)).to.be.false;

	const name = 'JP';
	const data = { name };
	const promise = fse.outputJsonAsync(file, data);

	// Mutate data right after call
	data.name = 'Ryan';

	// now await for the call to finish
	await promise;

	expect(fs.existsSync(file)).to.be.true;

	const newData = JSON.parse(fs.readFileSync(file, 'utf8')) as unknown;

	// mutation did not change data
	expect(newData).toMatchObject({ name });
});

describe('> when an option is passed, like JSON replacer', () => {
	it('should pass the option along to jsonfile module', async () => {
		const file = path.join(TEST_DIR, 'this-dir', 'does-not', 'exist', 'really', 'file.json');

		expect(fs.existsSync(file)).to.be.false;

		const replacer = (_k: string, v: unknown) => v === 'JP' ? 'Jon Paul' : v;
		const data = { name: 'JP' };

		await fse.outputJsonAsync(file, data, { replacer });

		const newData = JSON.parse(fs.readFileSync(file, 'utf8')) as unknown;

		expect(newData).toMatchObject({ name: 'Jon Paul' });
	});
});
