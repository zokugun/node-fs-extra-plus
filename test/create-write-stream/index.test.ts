import fs, { type WriteStream } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fse from '../../src/index.js';

const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'create-write-stream');

async function writeStreamFinished(stream: WriteStream): Promise<void> {
	return new Promise((resolve, reject) => {
		stream.on('error', reject);
		stream.on('finish', () => resolve());
	});
}

beforeEach(async () => {
	await fse.emptyDirAsync(TEST_DIR);
});

afterEach(async () => {
	await fse.removeAsync(TEST_DIR);
});

describe('createWriteStream', () => {
	it('should create a writable stream and write data', async () => {
		const file = path.join(TEST_DIR, 'hello.txt');

		const stream = fse.createWriteStream(file, { encoding: 'utf8' });
		expect(stream).toBeInstanceOf(fs.WriteStream);
		expect(stream.path).to.equals(file);

		stream.write('hello world');
		stream.end();

		await writeStreamFinished(stream);

		const data = fs.readFileSync(file, 'utf8');
		expect(data).to.equals('hello world');
	});

	it('should respect flags option', async () => {
		const file = path.join(TEST_DIR, 'append.txt');
		fs.writeFileSync(file, 'hello');

		const stream = fse.createWriteStream(file, { encoding: 'utf8', flags: 'a' });
		stream.write(' world');
		stream.end();

		await writeStreamFinished(stream);

		const data = fs.readFileSync(file, 'utf8');
		expect(data).to.equals('hello world');
	});
});
