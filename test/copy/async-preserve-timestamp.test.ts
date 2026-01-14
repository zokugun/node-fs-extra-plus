import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fse from '../../src/index.js';

const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'copy-async-preserve-timestamp');
const SRC = path.join(TEST_DIR, 'src');
const DEST = path.join(TEST_DIR, 'dest');
const FILES = ['a-file', path.join('a-folder', 'another-file'), path.join('a-folder', 'another-folder', 'file3')];
const TEST_CASES = [
	{ subcase: 'writable', readonly: false },
	{ subcase: 'readonly', readonly: true },
];

beforeEach(async () => {
	await fse.emptyDirAsync(TEST_DIR);
});

afterEach(async () => {
	await fse.removeAsync(TEST_DIR);
});

describe.skipIf(process.arch === 'ia32')('copySync() - preserveTimestamps option', () => {
	describe('> when preserveTimestamps option is true', () => {
		for(const testCase of TEST_CASES) {
			describe(`>> with ${testCase.subcase} source files`, () => {
				beforeEach(() => setupFixture(testCase.readonly));

				it('should have the same timestamps on copy', async () => {
					await fse.copyAsync(SRC, DEST, { preserveTimestamps: true });

					const test = testFile({ preserveTimestamps: true });

					for(const file of FILES) {
						test(file);
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

		const fromStatResult = fse.statSync(a);
		expect(fromStatResult.fails).to.be.false;
		expect(fromStatResult.value).toBeDefined();

		const toStatResult = fse.statSync(b);
		expect(toStatResult.fails).to.be.false;
		expect(toStatResult.value).toBeDefined();

		const fromStat = fromStatResult.value!;
		const toStat = toStatResult.value!;

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
