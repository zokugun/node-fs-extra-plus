import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import klawSync from 'klaw-sync';
import { afterEach, beforeEach, expect, it } from 'vitest';
import fse from '../../src/index.js';

const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'fs-chmod');

beforeEach(async () => {
	await fse.emptyDirAsync(TEST_DIR);
});

afterEach(async () => {
	for(const data of klawSync(TEST_DIR)) {
		fs.chmodSync(data.path, 0o777);
	}

	await fse.removeAsync(TEST_DIR);
});

it('666', () => {
	const file = path.join(TEST_DIR, 'some-file.txt');
	fse.outputFileSync(file, 'hello');
	fse.chmodSync(file, 0o666);

	const readResult = fse.readFileSync(file, 'utf8');
	expect(readResult.fails).to.be.false;
	expect(readResult.value).to.equals('hello');

	const writeResult = fse.writeFileSync(file, 'hello world');
	expect(writeResult.fails).to.be.false;
});

it.runIf(process.platform !== 'win32')('600', () => {
	const file = path.join(TEST_DIR, 'some-file.txt');
	fse.outputFileSync(file, 'hello');
	fse.chmodSync(file, 0o600);

	const readResult = fse.readFileSync(file, 'utf8');
	expect(readResult.fails).to.be.false;
	expect(readResult.value).to.equals('hello');

	const writeResult = fse.writeFileSync(file, 'hello world');
	expect(writeResult.fails).to.be.false;
});

it.runIf(process.platform !== 'win32')('060', () => {
	const file = path.join(TEST_DIR, 'some-file.txt');
	fse.outputFileSync(file, 'hello');
	fse.chmodSync(file, 0o060);

	const readResult = fse.readFileSync(file, 'utf8');
	expect(readResult.fails).to.be.true;

	const writeResult = fse.writeFileSync(file, 'hello world');
	expect(writeResult.fails).to.be.true;
});

it.runIf(process.platform !== 'win32')('006', () => {
	const file = path.join(TEST_DIR, 'some-file.txt');
	fse.outputFileSync(file, 'hello');
	fse.chmodSync(file, 0o006);

	const writeResult = fse.writeFileSync(file, 'hello world');
	expect(writeResult.fails).to.be.true;

	const readResult = fse.readFileSync(file, 'utf8');
	expect(readResult.fails).to.be.true;
});

it.runIf(process.platform !== 'win32')('000', () => {
	const file = path.join(TEST_DIR, 'some-file.txt');
	fse.outputFileSync(file, 'hello');
	fse.chmodSync(file, 0o006);

	const readResult = fse.readFileSync(file, 'utf8');
	expect(readResult.fails).to.be.true;

	const writeResult = fse.writeFileSync(file, 'hello world');
	expect(writeResult.fails).to.be.true;
});

it('444', () => {
	const file = path.join(TEST_DIR, 'some-file.txt');
	fse.outputFileSync(file, 'hello');
	fse.chmodSync(file, 0o444);

	const readResult = fse.readFileSync(file, 'utf8');
	expect(readResult.fails).to.be.false;
	expect(readResult.value).to.equals('hello');

	const writeResult = fse.writeFileSync(file, 'hello world');
	expect(writeResult.fails).to.be.true;
});

it.runIf(process.platform !== 'win32')('222', () => {
	const file = path.join(TEST_DIR, 'some-file.txt');
	fse.outputFileSync(file, 'hello');
	fse.chmodSync(file, 0o222);

	const readResult = fse.readFileSync(file, 'utf8');
	expect(readResult.fails).to.be.true;

	const writeResult = fse.writeFileSync(file, 'hello world');
	expect(writeResult.fails).to.be.false;
});
