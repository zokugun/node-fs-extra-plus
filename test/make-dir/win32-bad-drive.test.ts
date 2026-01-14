import process from 'node:process';
import { expect, it } from 'vitest';
import fse from '../../src/index.js';

it.runIf(process.platform === 'win32')('when drive does not exist, it should return a cleaner error', async () => {
	const dirPath = 'R:\\afasd\\afaff\\fdfd';

	const result = await fse.mkdirpAsync(dirPath);

	expect(result.fails).to.be.true;
	expect(result.error!.code).toBeOneOf(['EPERM', 'ENOENT']);
});
