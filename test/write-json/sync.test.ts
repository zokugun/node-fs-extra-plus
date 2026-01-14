import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fse from '../../src/index.js';

const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'write-json-sync');

beforeEach(async () => {
	await fse.emptyDirAsync(TEST_DIR);
});

afterEach(async () => {
	await fse.removeAsync(TEST_DIR);
});

describe('spaces', () => {
	it('should read a file and parse the json', () => {
		const object = {
			firstName: 'JP',
			lastName: 'Richardson',
		};

		const file = path.join(TEST_DIR, 'file.json');

		fse.writeJsonSync(file, object);

		const data = fs.readFileSync(file, 'utf8');

		expect(data).to.equals(JSON.stringify(object) + '\n');
	});
});

describe('EOL', () => {
	it('should read a file and parse the json', () => {
		const object = {
			firstName: 'JP',
			lastName: 'Richardson',
		};

		const file = path.join(TEST_DIR, 'file.json');

		fse.writeJsonSync(file, object, { spaces: 2, EOL: '\r\n' });

		const data = fs.readFileSync(file, 'utf8');

		expect(data).to.equals(JSON.stringify(object, null, 2).replaceAll('\n', '\r\n') + '\r\n');
	});
});
