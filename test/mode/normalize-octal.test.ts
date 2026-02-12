import { expect, it } from 'vitest';
import fse from '../../src/index.js';
import { testname } from './utils/testname.js';

const tests = [
	// Invalid
	{ input: 'NaN', error: 'Cannot normalize octal: "NaN"' },
	{ input: '0.5', error: 'Cannot normalize octal: "0.5"' },
	{ input: '10000', error: 'Cannot normalize octal: "10000"' },
	{ input: '8', error: 'Cannot normalize octal: "8"' },
	{ input: '~1', error: 'Cannot normalize octal: "~1"' },

	// Each permission
	{ input: '1', value: '=0o0001' },
	{ input: '2', value: '=0o0002' },
	{ input: '4', value: '=0o0004' },
	{ input: '10', value: '=0o0010' },
	{ input: '20', value: '=0o0020' },
	{ input: '40', value: '=0o0040' },
	{ input: '100', value: '=0o0100' },
	{ input: '200', value: '=0o0200' },
	{ input: '400', value: '=0o0400' },
	{ input: '1000', value: '=0o1000' },
	{ input: '2000', value: '=0o2000' },
	{ input: '4000', value: '=0o4000' },

	// Extremes
	{ input: '0', value: '=0o0000' },
	{ input: '7777', value: '=0o7777' },

	// Combining
	{ input: '11', value: '=0o0011' },

	// Operators
	{ input: '=11', value: '=0o0011' },
	{ input: '+0', value: '+0o0000' },
	{ input: '+11', value: '+0o0011' },
	{ input: '-0', value: '-0o0000' },
	{ input: '-11', value: '-0o0011' },
	{ input: '-011', value: '-0o0011' },
	{ input: '-0o11', value: '-0o0011' },

	// Whitespace
	{ input: ' 111 ', value: '=0o0111' },

	// Prefixes
	{ input: '0111', value: '=0o0111' },
	{ input: '0o111', value: '=0o0111' },
	{ input: '\\111', value: '=0o0111' },
	{ input: '\\0111', value: '=0o0111' },

	{ input: '0755', value: '=0o0755' },
];

for(const { input, error, value } of tests) {
	it(`normalizeOctal - ${testname(input)}`, () => {
		const result = fse.mode.normalizeOctal(input);
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
