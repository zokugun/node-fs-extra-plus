import { expect, it } from 'vitest';
import fse from '../../src/index.js';
import { testname } from './utils/testname.js';

const tests = [
	// Invalid
	{ input: '', error: 'Cannot normalize symbolic: ""' },
	{ input: '   ', error: 'Cannot normalize symbolic: "   "' },
	{ input: 'abc', error: 'Cannot normalize symbolic: "abc"' },
	{ input: 'z+x', error: 'Cannot normalize symbolic: "z+x"' },
	{ input: 'a~x', error: 'Cannot normalize symbolic: "a~x"' },
	{ input: 'a+j', error: 'Cannot normalize symbolic: "a+j"' },
	{ input: 'a+xx', error: 'Cannot normalize symbolic: "a+xx"' },

	// Each permission
	{ input: 'o+x', value: 'o+x' },
	{ input: 'o+w', value: 'o+w' },
	{ input: 'o+r', value: 'o+r' },
	{ input: 'g+x', value: 'g+x' },
	{ input: 'g+w', value: 'g+w' },
	{ input: 'g+r', value: 'g+r' },
	{ input: 'u+x', value: 'u+x' },
	{ input: 'u+w', value: 'u+w' },
	{ input: 'u+r', value: 'u+r' },

	// Extremes
	{ input: 'a+', value: '' },
	{ input: 'a-', value: '' },
	{ input: 'a=', value: '' },
	{ input: 'a=rwx', value: 'u=rwx,g=rwx,o=rwx' },

	// No category
	{ input: '+', value: '' },
	{ input: '-', value: '' },
	{ input: '=', value: '' },
	{ input: '+x', value: 'u+x,g+x,o+x' },
	{ input: '-x', value: 'u-x,g-x,o-x' },
	{ input: '=x', value: 'u=x,g=x,o=x' },

	// Combining
	{ input: 'a=rw', value: 'u=rw,g=rw,o=rw' },

	// Operators
	{ input: 'a-x', value: 'u-x,g-x,o-x' },
	{ input: 'a=x', value: 'u=x,g=x,o=x' },

	// Special permissions
	{ input: 'o+t', value: 'o+t' },
	{ input: 'g+s', value: 'g+s' },
	{ input: 'u+s', value: 'u+s' },
	{ input: 'o+s', value: '' },
	{ input: 'g+t', value: '' },
	{ input: 'u+t', value: '' },
	{ input: 'a+ts', value: 'u+s,g+s,o+t' },
	{ input: 'a+X', value: 'u+X,g+X,o+X' },

	// Whitespace
	{ input: ' a+x ', value: 'u+x,g+x,o+x' },
	{ input: 'u+x , u+r', value: 'u+rx' },

	// `all` category
	{ input: 'a+x', value: 'u+x,g+x,o+x' },
	{ input: 'a+w', value: 'u+w,g+w,o+w' },
	{ input: 'a+r', value: 'u+r,g+r,o+r' },

	// Grouping categories
	{ input: 'go=x', value: 'g=x,o=x' },
	{ input: 'gog=x', value: 'g=x,o=x' },
	{ input: 'ag=x', value: 'u=x,g=x,o=x' },
	{ input: 'g=x,o=x', value: 'g=x,o=x' },

	// Combining plus and minus
	{ input: 'o+x,o-x', value: 'o-x' },
	{ input: 'o-x,o+x', value: 'o+x' },
	{ input: 'o+x,o+x', value: 'o+x' },
	{ input: 'o-x,o-x', value: 'o-x' },
	{ input: 'o=x,o-x', value: 'o-x' },
	{ input: 'o=x,o+x', value: 'o+x' },
	{ input: 'a+x,o-x', value: 'u+x,g+x,o-x' },

	// Combining different categories and permissions
	{ input: 'o+x,g-x', value: 'g-x,o+x' },
	{ input: 'o+x,o-r', value: 'o+x,o-r' },

	{ input: 'u+rwx,g+rx,o+rx', value: 'u+rwx,g+rx,o+rx' },
];

for(const { input, error, value } of tests) {
	it(`normalizeSymbolic - ${testname(input)}`, () => {
		const result = fse.mode.normalizeSymbolic(input);
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
