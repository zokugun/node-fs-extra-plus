import { expect, it } from 'vitest';
import fse from '../../src/index.js';
import { testname } from './utils/testname.js';

const tests = [
	// Invalid
	{ input: Number.NaN, error: 'Cannot normalize number: NaN' },
	{ input: Number.POSITIVE_INFINITY, value: 0o0 },
	{ input: Number.EPSILON, value: 0o0 },
	{ input: Number.MAX_SAFE_INTEGER, value: 0o17_7777 },
	{ input: Number.MAX_VALUE, value: 0o0 },
	{ input: -1, error: 'Cannot normalize number: -1' },
	{ input: 0.5, value: 0o0 },
	{ input: 0o20_0000, value: 0o0 },

	// Each permission
	{ input: 0o1, value: 0o1 },
	{ input: 0o2, value: 0o2 },
	{ input: 0o4, value: 0o4 },
	{ input: 0o10, value: 0o10 },
	{ input: 0o20, value: 0o20 },
	{ input: 0o40, value: 0o40 },
	{ input: 0o100, value: 0o100 },
	{ input: 0o200, value: 0o200 },
	{ input: 0o400, value: 0o400 },
	{ input: 0o1000, value: 0o1000 },
	{ input: 0o2000, value: 0o2000 },
	{ input: 0o4000, value: 0o4000 },

	// Extremes
	{ input: 0o0, value: 0o0 },
	{ input: 0o7777, value: 0o7777 },

	// Combining
	{ input: 0o3, value: 0o3 },

	// `stat` bits
	{ input: 0o1_0000, value: 0o1_0000 },
	{ input: 0o17_7777, value: 0o17_7777 },

	{ input: 0o755, value: 0o755 },
	{ input: 0o4_0755, value: 0o4_0755 },
];

for(const { input, error, value } of tests) {
	it(`normalizeNumber - ${testname(input)}`, () => {
		const result = fse.mode.normalizeNumber(input);
		if(error) {
			expect(result.fails).to.be.true;
			expect(result.error).to.equals(error);
		}
		else {
			expect(result.fails).to.be.false;
			expect(result.value).to.equals(value);
		}
	});
}
