import { expect, it } from 'vitest';
import fse from '../../src/index.js';
import { testname } from './utils/testname.js';

const tests = [
	// Invalid
	{ input: undefined, output: false },
	{ input: null, output: false },
	{ input: false, output: false },
	{ input: [], output: false },
	{ input: { user: null }, output: false },
	{ input: { user: [] }, output: false },
	{ input: { users: {} }, output: false },
	{ input: { user: { readd: true } }, output: false },
	{ input: { user: { setuid: true } }, output: false },
	{ input: { user: { setgid: true } }, output: false },
	{ input: { user: { sticky: true } }, output: false },
	{ input: { special: { read: true } }, output: false },
	{ input: { special: { write: true } }, output: false },
	{ input: { special: { execute: true } }, output: false },
	{ input: { others: { read: null } }, output: false },
	{ input: { others: { read: {} } }, output: false },

	// Each permission
	{ input: { others: { execute: true } }, output: true },
	{ input: { others: { write: true } }, output: true },
	{ input: { others: { read: true } }, output: true },
	{ input: { group: { execute: true } }, output: true },
	{ input: { group: { write: true } }, output: true },
	{ input: { group: { read: true } }, output: true },
	{ input: { user: { execute: true } }, output: true },
	{ input: { user: { write: true } }, output: true },
	{ input: { user: { read: true } }, output: true },

	// Extremes
	{ input: {
		special: { setuid: true, setgid: true, sticky: true },
		user: { read: true, write: true, execute: true },
		group: { read: true, write: true, execute: true },
		others: { read: true, write: true, execute: true },
	}, output: true },

	// Combining
	{ input: { user: { read: true, write: true } }, output: true },
	{ input: { user: { read: true, write: false } }, output: true },

	// Operators
	{ input: { others: { read: false } }, output: true },
	{ input: { others: { read: undefined } }, output: true },

	// Special permissions
	{ input: { special: { sticky: true } }, output: true },
	{ input: { special: { setgid: true } }, output: true },
	{ input: { special: { setuid: true } }, output: true },

	// `all` category
	{ input: { all: { read: true } }, output: true },
	{ input: { user: { read: false }, all: { read: true } }, output: true },
	{ input: { all: { read: true }, special: { setuid: true } }, output: true },
];

for(const { input, output } of tests) {
	it(`isObject - ${testname(input)}`, () => {
		const result = fse.mode.isObject(input);
		expect(result).to.equals(output);
	});
}
