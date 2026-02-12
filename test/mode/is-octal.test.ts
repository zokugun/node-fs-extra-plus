import { expect, it } from 'vitest';
import fse from '../../src/index.js';
import { testname } from './utils/testname.js';

const tests = [
	// Invalid
	{ input: 'NaN', output: false },
	{ input: '0.5', output: false },
	{ input: '10000', output: false },
	{ input: '8', output: false },
	{ input: '~1', output: false },

	// Each permission
	{ input: '1', output: true },
	{ input: '2', output: true },
	{ input: '4', output: true },
	{ input: '10', output: true },
	{ input: '20', output: true },
	{ input: '40', output: true },
	{ input: '100', output: true },
	{ input: '200', output: true },
	{ input: '400', output: true },
	{ input: '1000', output: true },
	{ input: '2000', output: true },
	{ input: '4000', output: true },

	// Extremes
	{ input: '0', output: true },
	{ input: '7777', output: true },

	// Combining
	{ input: '11', output: true },

	// Operators
	{ input: '=11', output: true },
	{ input: '+0', output: true },
	{ input: '+11', output: true },
	{ input: '-0', output: true },
	{ input: '-11', output: true },
	{ input: '-011', output: true },
	{ input: '-0o11', output: true },

	// Whitespace
	{ input: ' 111 ', output: true },

	// Prefixes
	{ input: '0111', output: true },
	{ input: '0o111', output: true },
	{ input: '\\111', output: true },
	{ input: '\\0111', output: true },

	{ input: '0755', output: true },
];

for(const { input, output } of tests) {
	it(`isOctal - ${testname(input)}`, () => {
		const result = fse.mode.isOctal(input);
		expect(result).to.equals(output);
	});
}
