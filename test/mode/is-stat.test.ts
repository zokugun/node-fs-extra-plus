import { expect, it } from 'vitest';
import fse from '../../src/index.js';
import { testname } from './utils/testname.js';

const tests = [
	// Invalid
	{ input: 'rwwrwxrwx', output: false },
	{ input: '--------j', output: false },
	{ input: '--------+', output: false },
	{ input: 'Br--------', output: false },
	{ input: '--------s', output: false },
	{ input: '--------S', output: false },
	{ input: '-----t---', output: false },
	{ input: '-----T---', output: false },
	{ input: '--t------', output: false },
	{ input: '--T------', output: false },
	{ input: '--------', output: false },
	{ input: '-- ---- ---', output: false },
	{ input: '-----------', output: false },

	// Each permission
	{ input: '--------x', output: true },
	{ input: '-------w-', output: true },
	{ input: '------r--', output: true },
	{ input: '-----x---', output: true },
	{ input: '----w----', output: true },
	{ input: '---r-----', output: true },
	{ input: '--x------', output: true },
	{ input: '-w-------', output: true },
	{ input: 'r--------', output: true },

	// Extremes
	{ input: '---------', output: true },
	{ input: 'rwxrwxrwx', output: true },

	// Combining
	{ input: '-------wx', output: true },

	// Special permissions
	{ input: '--------X', output: true },
	{ input: '-----X---', output: true },
	{ input: '--X------', output: true },
	{ input: '--------T', output: true },
	{ input: '--------t', output: true },
	{ input: '-----s---', output: true },
	{ input: '-----S---', output: true },
	{ input: '--s------', output: true },
	{ input: '--S------', output: true },

	// Whitespace
	{ input: ' --------x ', output: true },
	{ input: '  ---  ---  --x', output: true },

	// File types
	{ input: 'drw-------', output: true },
	{ input: 'lr--------', output: true },
	{ input: 'pr--------', output: true },
	{ input: 'sr--------', output: true },
	{ input: 'cr--------', output: true },
	{ input: 'br--------', output: true },
	{ input: 'Dr--------', output: true },

	// Changing order
	{ input: 'rxwrwxrwx', output: true },

	{ input: 'rwxr-xr-x', output: true },
];

for(const { input, output } of tests) {
	it(`isStat - ${testname(input)}`, () => {
		const result = fse.mode.isStat(input);
		expect(result).to.equals(output);
	});
}
