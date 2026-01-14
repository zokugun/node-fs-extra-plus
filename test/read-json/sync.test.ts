import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, expect, it } from 'vitest';
import fse from '../../src/index.js';

const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'read-json-sync');

beforeEach(async () => {
	await fse.emptyDirAsync(TEST_DIR);
});

afterEach(async () => {
	await fse.removeAsync(TEST_DIR);
});

it('should read a file and parse the json', () => {
	const object = {
		firstName: 'JP',
		lastName: 'Richardson',
	};

	const file = path.join(TEST_DIR, 'file.json');

	fs.writeFileSync(file, JSON.stringify(object));

	const result = fse.readJSONSync(file);

	expect(result.fails).to.be.false;
	expect(result.value).to.be.eql(object);
});

it('should error if it cant parse the json', () => {
	const file = path.join(TEST_DIR, 'file2.json');

	fs.writeFileSync(file, '%asdfasdff444');

	const result = fse.readJSONSync(file);

	expect(result.fails).to.be.true;
});
