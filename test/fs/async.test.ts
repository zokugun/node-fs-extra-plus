import path from 'node:path';
import { expect, it } from 'vitest';
import fse from '../../src/async.js';

it('stat', async () => { // {{{
	const result = await fse.stat(__filename);

	expect(result.fails).to.be.false;
	expect(result.value).toBeTypeOf('object');
	expect(result.value!.size).toBeTypeOf('number');
}); // }}}

it('glob', async () => { // {{{
	if(fse.glob) {
		const root = path.join(__dirname, '..');
		const iterable = fse.glob(path.join(__filename, '**'));

		for await (const result of iterable) {
			expect(result.fails).to.be.false;
			expect(result.value).toBeTypeOf('string');
			expect(path.relative(root, result.value!)).to.be.equals('fs/async.test.ts');
		}
	}
}); // }}}

it('exits - true', async () => { // {{{
	const result = await fse.exists(__filename);

	expect(result.fails).to.be.false;
	expect(result.value).toBeTypeOf('boolean');
	expect(result.value).to.be.true;
}); // }}}

it('exits - false', async () => { // {{{
	const result = await fse.exists(`${__filename}.ts`);

	expect(result.fails).to.be.false;
	expect(result.value).toBeTypeOf('boolean');
	expect(result.value).to.be.false;
}); // }}}
