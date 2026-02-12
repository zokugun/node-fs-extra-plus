import { expect, it } from 'vitest';
import fse from '../../src/index.js';
import { testname } from './utils/testname.js';

const tests = [
	// Invalid
	{ input: '', output: false },
	{ input: '   ', output: false },
	{ input: 'abc', output: false },
	{ input: 'z+x', output: false },
	{ input: 'a~x', output: false },
	{ input: 'a+j', output: false },
	{ input: 'a+xx', output: false },

	// Each permission
	{ input: 'o+x', output: true },
	{ input: 'o+w', output: true },
	{ input: 'o+r', output: true },
	{ input: 'g+x', output: true },
	{ input: 'g+w', output: true },
	{ input: 'g+r', output: true },
	{ input: 'u+x', output: true },
	{ input: 'u+w', output: true },
	{ input: 'u+r', output: true },

	// Extremes
	{ input: 'a+', output: true },
	{ input: 'a-', output: true },
	{ input: 'a=', output: true },
	{ input: 'a=rwx', output: true },

	// No category
	{ input: '+', output: true },
	{ input: '-', output: true },
	{ input: '=', output: true },
	{ input: '+x', output: true },
	{ input: '-x', output: true },
	{ input: '=x', output: true },

	// Combining
	{ input: 'a=rw', output: true },

	// Operators
	{ input: 'a-x', output: true },
	{ input: 'a=x', output: true },

	// Special permissions
	{ input: 'o+t', output: true },
	{ input: 'g+s', output: true },
	{ input: 'u+s', output: true },
	{ input: 'o+s', output: true },
	{ input: 'g+t', output: true },
	{ input: 'u+t', output: true },
	{ input: 'a+ts', output: true },
	{ input: 'a+X', output: true },

	// Whitespace
	{ input: ' a+x ', output: true },
	{ input: 'u+x , u+r', output: true },

	// `all` category
	{ input: 'a+x', output: true },
	{ input: 'a+w', output: true },
	{ input: 'a+r', output: true },

	// Grouping categories
	{ input: 'go=x', output: true },
	{ input: 'gog=x', output: true },
	{ input: 'ag=x', output: true },
	{ input: 'g=x,o=x', output: true },

	// Combining plus and minus
	{ input: 'o+x,o-x', output: true },
	{ input: 'o-x,o+x', output: true },
	{ input: 'o+x,o+x', output: true },
	{ input: 'o-x,o-x', output: true },
	{ input: 'o=x,o-x', output: true },
	{ input: 'o=x,o+x', output: true },
	{ input: 'a+x,o-x', output: true },

	// Combining different categories and permissions
	{ input: 'o+x,g-x', output: true },
	{ input: 'o+x,o-r', output: true },

	{ input: 'u+rwx,g+rx,o+rx', output: true },
];

for(const { input, output } of tests) {
	it(`isSymbolic - ${testname(input)}`, () => {
		const result = fse.mode.isSymbolic(input);
		expect(result).to.equals(output);
	});
}
