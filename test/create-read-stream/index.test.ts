import fs, { type ReadStream } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fse from '../../src/index.js';

const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'create-read-stream');

async function readStreamToString(stream: ReadStream): Promise<string> {
	return new Promise((resolve, reject) => {
		let data = '';
		stream.on('data', (chunk) => {
			data += chunk.toString();
		});
		stream.on('error', reject);
		stream.on('end', () => resolve(data));
	});
}

beforeEach(async () => {
	await fse.emptyDirAsync(TEST_DIR);
});

afterEach(async () => {
	await fse.removeAsync(TEST_DIR);
});

describe('createReadStream', () => {
	it('should create a readable stream', async () => {
		const file = path.join(TEST_DIR, 'hello.txt');
		fs.writeFileSync(file, 'hello world');

		const stream = fse.createReadStream(file, { encoding: 'utf8' });

		expect(stream).toBeInstanceOf(fs.ReadStream);
		expect(stream.path).to.equals(file);

		const data = await readStreamToString(stream);
		expect(data).to.equals('hello world');
	});

	it('should respect start/end options', async () => {
		const file = path.join(TEST_DIR, 'range.txt');
		fs.writeFileSync(file, 'hello world');

		const stream = fse.createReadStream(file, { encoding: 'utf8', start: 6, end: 10 });
		const data = await readStreamToString(stream);

		expect(data).to.equals('world');
	});
});
