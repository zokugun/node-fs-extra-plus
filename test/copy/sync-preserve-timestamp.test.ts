import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fse from '../../src/index.js';

const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'copy-sync-preserve-timestamp');
const SRC = path.join(TEST_DIR, 'src');
const DEST = path.join(TEST_DIR, 'dest');
const FILES = ['a-file', path.join('a-folder', 'another-file'), path.join('a-folder', 'another-folder', 'file3')];

beforeEach(async () => {
	await fse.emptyDirAsync(TEST_DIR);
});

afterEach(async () => {
	await fse.removeAsync(TEST_DIR);
});

describe.skipIf(process.arch === 'ia32')('copySync() - preserveTimestamps option', () => {
	describe('> when preserveTimestamps option is true', () => {
		for(const parameters of [
			{ subcase: 'writable', readonly: false },
			{ subcase: 'readonly', readonly: true },
		]) {
			describe(`>> with ${parameters.subcase} source files`, () => {
				beforeEach(() => setupFixture(parameters.readonly));

				it('should have the same timestamps on copy', () => {
					fse.copySync(SRC, DEST, { preserveTimestamps: true });

					const action = testFile({ preserveTimestamps: true });

					for(const file of FILES) {
						action(file);
					}
				});
			});
		}
	});
});

function setupFixture(readonly: boolean) {
	const timestamp = (Date.now() / 1000) - 5;

	for(const file of FILES) {
		const filePath = path.join(SRC, file);

		fse.ensureFileSync(filePath);

		// rewind timestamps to make sure that coarser OS timestamp resolution
		// does not alter results
		fse.utimesSync(filePath, timestamp, timestamp);

		if(readonly) {
			fse.chmodSync(filePath, 0o444);
		}
	}
}

function testFile(options: { preserveTimestamps: boolean }) {
	return function (file: string) {
		const a = path.join(SRC, file);
		const b = path.join(DEST, file);
		const fromStat = fs.statSync(a);
		const toStat = fs.statSync(b);

		if(options.preserveTimestamps) {
			// Windows sub-second precision fixed: https://github.com/nodejs/io.js/issues/2069
			expect(toStat.mtime.getTime()).to.equals(fromStat.mtime.getTime(), 'different mtime values');
			expect(toStat.atime.getTime()).to.equals(fromStat.atime.getTime(), 'different atime values');
		}
		else {
			// the access time might actually be the same, so check only modification time
			expect(toStat.mtime.getTime()).to.not.equals(fromStat.mtime.getTime(), 'same mtime values');
		}
	};
}
