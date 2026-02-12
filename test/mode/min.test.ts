import { expect, it } from 'vitest';
import fse from '../../src/index.js';
import { testname } from './utils/testname.js';

const tests = [
	// Fewer arguments
	{ input: [], output: 0 },
	{ input: ['o+x'], output: 'o+x' },

	// Normal permissions
	{ input: ['a+', 'a=x'], output: '' },
	{ input: ['a=x', 'a=x'], output: 'u=x,g=x,o=x' },
	{ input: ['a=xr', 'a=x'], output: 'u=x,g=x,o=x' },
	{ input: ['a=xr', 'a=xr'], output: 'u=rx,g=rx,o=rx' },
	{ input: ['o+', 'o+'], output: '' },
	{ input: ['o+', 'o+x'], output: '' },
	{ input: ['o+', 'o-x'], output: 'o-x' },
	{ input: ['o+', 'o=x'], output: '' },
	{ input: ['o+x', 'o+'], output: '' },
	{ input: ['o+x', 'o+x'], output: 'o+x' },
	{ input: ['o+x', 'o+xr'], output: 'o+x' },
	{ input: ['o+x', 'o-x'], output: 'o-x' },
	{ input: ['o-', 'o+'], output: '' },
	{ input: ['o-', 'o+x'], output: '' },
	{ input: ['o-', 'o-x'], output: 'o-x' },
	{ input: ['o-x', 'o+'], output: 'o-x' },
	{ input: ['o-x', 'o+x'], output: 'o-x' },
	{ input: ['o-x', 'o-x'], output: 'o-x' },
	{ input: ['o-x', 'o-xr'], output: 'o-rx' },
	{ input: ['o=x', 'o=x'], output: 'o=x' },
	{ input: ['o=xr', 'o=x'], output: 'o=x' },
	{ input: ['o=xr', 'o=xr'], output: 'o=rx' },
	{ input: ['u+x', 'o-w'], output: 'o-w' },
	{ input: ['o=x', 'o+x'], output: 'o=x' },
	{ input: ['o+x', 'o=x'], output: 'o=x' },

	// Special permission
	{ input: ['g+', 'g+s'], output: '' },
	{ input: ['g+s', 'g+'], output: '' },
	{ input: ['g+s', 'g+s'], output: 'g+s' },
	{ input: ['g+s', 'g-s'], output: 'g-s' },
	{ input: ['o+', 'o+t'], output: '' },
	{ input: ['o+t', 'o+'], output: '' },
	{ input: ['o+t', 'o+t'], output: 'o+t' },
	{ input: ['o+t', 'o-t'], output: 'o-t' },
	{ input: ['u+', 'u+s'], output: '' },
	{ input: ['u+s', 'u+'], output: '' },
	{ input: ['u+s', 'u+s'], output: 'u+s' },
	{ input: ['u+s', 'u-s'], output: 'u-s' },

	// // Extremes
	{ input: ['+', '+'], output: '' },
	{ input: ['+', 'o+x'], output: '' },
	{ input: ['a+', 'a=rwxst'], output: '' },
	{ input: ['a=rwx', 'a=rw'], output: 'u=rw,g=rw,o=rw' },
	{ input: ['a=rwx', 'a=rwx'], output: 'u=rwx,g=rwx,o=rwx' },
	{ input: ['a=rwxst', 'a=rwx'], output: 'u=rwx,g=rwx,o=rwx' },
	{ input: ['a=rwxst', 'a=rwxst'], output: 'u=rws,g=rws,o=rwt' },

	// Combining
	{ input: ['a+x', 'o+x,g+x'], output: 'g+x,o+x' },
	{ input: ['a+x', 'o+x,g+x,u+x'], output: 'u+x,g+x,o+x' },
	{ input: ['a=xrw', 'a=st'], output: 'u=x,g=x,o=x' },
	{ input: ['o+', 'o+x,o-r'], output: 'o-r' },
	{ input: ['o+x', 'o+x,o+r'], output: 'o+x' },
	{ input: ['o+x', 'o+x,o+x'], output: 'o+x' },
	{ input: ['o+x', 'o+x,o-r'], output: 'o+x,o-r' },
	{ input: ['o+x,g-x', 'o-x,g+x'], output: 'g-x,o-x' },
	{ input: ['o+x,o+r', 'o+x,o-r'], output: 'o+x,o-r' },
	{ input: ['o+x,o-r', 'o+r,o+x'], output: 'o+x,o-r' },
	{ input: ['o+x,o-r', 'o+x'], output: 'o+x,o-r' },
	{ input: ['o+x,o-r', 'o+x,o-r'], output: 'o+x,o-r' },
	{ input: ['o+x,o-r', 'o-r'], output: 'o-r' },
	{ input: ['o+x,o-r', 'o-r,o+x'], output: 'o+x,o-r' },
	{ input: ['o+xw', 'o+x'], output: 'o+x' },
	{ input: ['o+xw', 'o+x,o+w'], output: 'o+wx' },
	{ input: ['o-r', 'o+x,o-r'], output: 'o-r' },
	{ input: ['o-x,o+r', 'o+x,o-r'], output: 'o-rx' },
	{ input: ['o=x', 'o=r'], output: '' },
	{ input: ['og+x', 'o+x'], output: 'o+x' },
	{ input: ['og+x', 'o+x,g+x'], output: 'g+x,o+x' },

	// Several arguments
	{ input: ['o+', 'o+x', 'o+r'], output: '' },
	{ input: ['o+', 'o+x', 'o-r'], output: 'o-r' },
	{ input: ['o+', 'o+x', 'o-x'], output: 'o-x' },
	{ input: ['o+x', 'o+', 'o-x'], output: 'o-x' },
	{ input: ['o+x', 'o+x', 'o+r'], output: '' },
	{ input: ['o+xr', 'o+x', 'o+r'], output: '' },
	{ input: ['o+xr', 'o+x,o+r', 'o+r'], output: 'o+r' },
	{ input: ['o+xr', 'o+x,o+r', 'o+r,o+x'], output: 'o+rx' },
	{ input: ['o-x', 'o+', 'o+x'], output: 'o-x' },
];

for(const { input, output } of tests) {
	it(`min - ${testname(input)}`, () => {
		const result = fse.mode.min(...(input as Parameters<typeof fse.mode.min>));

		if(result.value !== output) {
			console.log(result.value);
		}

		expect(result.fails).to.be.false;
		expect(result.value).to.eql(output);
	});
}
