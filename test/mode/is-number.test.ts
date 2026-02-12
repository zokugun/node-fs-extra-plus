import { expect, it } from 'vitest';
import fse from '../../src/index.js';
import { testname } from './utils/testname.js';

const tests = [
	// Invalid
	{ input: Number.NaN, output: false },
	{ input: Number.POSITIVE_INFINITY, output: false },
	{ input: Number.EPSILON, output: false },
	{ input: Number.MAX_SAFE_INTEGER, output: false },
	{ input: Number.MAX_VALUE, output: false },
	{ input: -1, output: false },
	{ input: 0.5, output: false },
	{ input: 0o20_0000, output: false },

	// Each permission
	{ input: 0o1, output: true },
	{ input: 0o2, output: true },
	{ input: 0o4, output: true },
	{ input: 0o10, output: true },
	{ input: 0o20, output: true },
	{ input: 0o40, output: true },
	{ input: 0o100, output: true },
	{ input: 0o200, output: true },
	{ input: 0o400, output: true },
	{ input: 0o1000, output: true },
	{ input: 0o2000, output: true },
	{ input: 0o4000, output: true },

	// Extremes
	{ input: 0o0, output: true },
	{ input: 0o7777, output: true },

	// Combining
	{ input: 0o3, output: true },

	// `stat` bits
	{ input: 0o1_0000, output: true },
	{ input: 0o17_7777, output: true },

	{ input: 0o755, output: true },
	{ input: 0o4_0755, output: true },
];

for(const { input, output } of tests) {
	it(`isNumber - ${testname(input)}`, () => {
		const result = fse.mode.isNumber(input);
		expect(result).to.equals(output);
	});
}
