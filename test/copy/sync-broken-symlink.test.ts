import os from 'node:os';
import path from 'node:path';
import { isNodeError } from '@zokugun/is-it-type';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fse from '../../src/index.js';

const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'copy-sync-broken-symlink');
const source = path.join(TEST_DIR, 'src');
const destination = path.join(TEST_DIR, 'dest');

beforeEach(async () => {
	await fse.emptyDirAsync(TEST_DIR);

	createFixtures(source);
});

function createFixtures(sourceDir: string) {
	fse.mkdirSync(sourceDir);

	const brokenFile = path.join(sourceDir, 'does-not-exist');
	const brokenFileLink = path.join(sourceDir, 'broken-symlink');

	fse.writeFileSync(brokenFile, 'does not matter');
	fse.symlinkSync(brokenFile, brokenFileLink, 'file');

	// break the symlink now
	fse.removeSync(brokenFile);
}

afterEach(async () => {
	await fse.removeAsync(TEST_DIR);
});

describe('when symlink is broken', () => {
	it('should not throw error if dereference is false', () => {
		const result = fse.copySync(source, destination);
		expect(result.fails).to.be.false;
	});

	it('should throw error if dereference is true', () => {
		const result = fse.copySync(source, destination, { dereference: true });
		expect(result.fails).to.be.true;
		expect(isNodeError(result.error)).to.be.true;
		expect((result.error as NodeJS.ErrnoException).code).to.equals('ENOENT');
	});
});
