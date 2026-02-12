import { expect, it } from 'vitest';
import fse from '../../src/index.js';
import { testname } from './utils/testname.js';

const tests = [
	// Fewer arguments
	{ input: [], output: false },
	{ input: ['o+x'], output: false },

	// Normal permissions
	{ input: ['a+', 'a=x'], output: false },
	{ input: ['a=x', 'a=x'], output: true },
	{ input: ['a=xr', 'a=x'], output: true },
	{ input: ['a=xr', 'a=xr'], output: true },
	{ input: ['o+', 'o+'], output: true },
	{ input: ['o+', 'o+x'], output: false },
	{ input: ['o+', 'o-x'], output: false },
	{ input: ['o+', 'o=x'], output: false },
	{ input: ['o+x', 'o+'], output: true },
	{ input: ['o+x', 'o+x'], output: true },
	{ input: ['o+x', 'o+xr'], output: false },
	{ input: ['o+x', 'o-x'], output: false },
	{ input: ['o-', 'o+'], output: true },
	{ input: ['o-', 'o+x'], output: false },
	{ input: ['o-', 'o-x'], output: false },
	{ input: ['o-x', 'o+'], output: true },
	{ input: ['o-x', 'o+x'], output: false },
	{ input: ['o-x', 'o-x'], output: true },
	{ input: ['o-x', 'o-xr'], output: false },
	{ input: ['o=x', 'o=x'], output: true },
	{ input: ['o=xr', 'o=x'], output: true },
	{ input: ['o=xr', 'o=xr'], output: true },
	{ input: ['u+x', 'o-w'], output: false },
	{ input: ['o=x', 'o+x'], output: true },
	{ input: ['o+x', 'o=x'], output: false },

	// Special permission
	{ input: ['g+', 'g+s'], output: false },
	{ input: ['g+s', 'g+'], output: true },
	{ input: ['g+s', 'g+s'], output: true },
	{ input: ['g+s', 'g-s'], output: false },
	{ input: ['o+', 'o+t'], output: false },
	{ input: ['o+t', 'o+'], output: true },
	{ input: ['o+t', 'o+t'], output: true },
	{ input: ['o+t', 'o-t'], output: false },
	{ input: ['u+', 'u+s'], output: false },
	{ input: ['u+s', 'u+'], output: true },
	{ input: ['u+s', 'u+s'], output: true },
	{ input: ['u+s', 'u-s'], output: false },

	// Extremes
	{ input: ['+', '+'], output: true },
	{ input: ['+', 'o+x'], output: false },
	{ input: ['a+', 'a=rwxst'], output: false },
	{ input: ['a=rwx', 'a=rw'], output: true },
	{ input: ['a=rwx', 'a=rwx'], output: true },
	{ input: ['a=rwxst', 'a=rwx'], output: true },
	{ input: ['a=rwxst', 'a=rwxst'], output: true },

	// Combining
	{ input: ['a+x', 'o+x,g+x'], output: true },
	{ input: ['a+x', 'o+x,g+x,u+x'], output: true },
	{ input: ['a=xrw', 'a=st'], output: false },
	{ input: ['o+', 'o+x,o-r'], output: false },
	{ input: ['o+x', 'o+x,o+r'], output: false },
	{ input: ['o+x', 'o+x,o+x'], output: true },
	{ input: ['o+x', 'o+x,o-r'], output: false },
	{ input: ['o+x,g-x', 'o-x,g+x'], output: false },
	{ input: ['o+x,o+r', 'o+x,o-r'], output: false },
	{ input: ['o+x,o-r', 'o+r,o+x'], output: false },
	{ input: ['o+x,o-r', 'o+x'], output: true },
	{ input: ['o+x,o-r', 'o+x,o-r'], output: true },
	{ input: ['o+x,o-r', 'o-r'], output: true },
	{ input: ['o+x,o-r', 'o-r,o+x'], output: true },
	{ input: ['o+xw', 'o+x'], output: true },
	{ input: ['o+xw', 'o+x,o+w'], output: true },
	{ input: ['o-r', 'o+x,o-r'], output: false },
	{ input: ['o-x,o+r', 'o+x,o-r'], output: false },
	{ input: ['o=x', 'o=r'], output: false },
	{ input: ['og+x', 'o+x'], output: true },
	{ input: ['og+x', 'o+x,g+x'], output: true },

	// Several arguments
	{ input: ['o+', 'o+x', 'o+r'], output: false },
	{ input: ['o+', 'o+x', 'o-r'], output: false },
	{ input: ['o+', 'o+x', 'o-x'], output: false },
	{ input: ['o+x', 'o+', 'o-x'], output: false },
	{ input: ['o+x', 'o+x', 'o+r'], output: false },
	{ input: ['o+xr', 'o+x', 'o+r'], output: true },
	{ input: ['o+xr', 'o+x,o+r', 'o+r'], output: true },
	{ input: ['o+xr', 'o+x,o+r', 'o+r,o+x'], output: true },
	{ input: ['o-x', 'o+', 'o+x'], output: false },

	{ input: [0o4_0755, 'r-Xr-Xr-X'], output: true },
	{ input: [0o4_0644, 'r-Xr-Xr-X'], output: false },
	{ input: [0o10_0644, 'a=rX'], output: true },
	{ input: [0o10_0755, 'a=rX'], output: false },
];

for(const { input, output } of tests) {
	it(`includes - ${testname(input)}`, () => {
		const result = fse.mode.includes(...(input as Parameters<typeof fse.mode.includes>));
		expect(result).to.equals(output);
	});
}
