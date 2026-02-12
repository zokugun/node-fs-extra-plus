import { expect, it } from 'vitest';
import fse from '../../src/index.js';
import { testname } from './utils/testname.js';

const tests = [
	// Invalid
	{ input: undefined, error: 'Cannot normalize object: undefined' },
	{ input: null, error: 'Cannot normalize object: null' },
	{ input: false, error: 'Cannot normalize object: false' },
	{ input: [], error: 'Cannot normalize object: []' },
	{ input: { user: null }, error: 'Cannot normalize object: { user: null }' },
	{ input: { user: [] }, error: 'Cannot normalize object: { user: [] }' },
	{ input: { users: {} }, error: 'Cannot normalize object: { users: {} }' },
	{ input: { user: { readd: true } }, error: 'Cannot normalize object: { user: { readd: true } }' },
	{ input: { user: { setuid: true } }, error: 'Cannot normalize object: { user: { setuid: true } }' },
	{ input: { user: { setgid: true } }, error: 'Cannot normalize object: { user: { setgid: true } }' },
	{ input: { user: { sticky: true } }, error: 'Cannot normalize object: { user: { sticky: true } }' },
	{ input: { special: { read: true } }, error: 'Cannot normalize object: { special: { read: true } }' },
	{ input: { special: { write: true } }, error: 'Cannot normalize object: { special: { write: true } }' },
	{ input: { special: { execute: true } }, error: 'Cannot normalize object: { special: { execute: true } }' },
	{ input: { others: { read: null } }, error: 'Cannot normalize object: { others: { read: null } }' },
	{ input: { others: { read: {} } }, error: 'Cannot normalize object: { others: { read: {} } }' },

	// Each permission
	{ input: { others: { execute: true } }, value: { others: { execute: true } } },
	{ input: { others: { write: true } }, value: { others: { write: true } } },
	{ input: { others: { read: true } }, value: { others: { read: true } } },
	{ input: { group: { execute: true } }, value: { group: { execute: true } } },
	{ input: { group: { write: true } }, value: { group: { write: true } } },
	{ input: { group: { read: true } }, value: { group: { read: true } } },
	{ input: { user: { execute: true } }, value: { user: { execute: true } } },
	{ input: { user: { write: true } }, value: { user: { write: true } } },
	{ input: { user: { read: true } }, value: { user: { read: true } } },

	// Extremes
	{ input: {
		special: { setuid: true, setgid: true, sticky: true },
		user: { read: true, write: true, execute: true },
		group: { read: true, write: true, execute: true },
		others: { read: true, write: true, execute: true },
	}, value: {
		special: { setuid: true, setgid: true, sticky: true },
		user: { read: true, write: true, execute: true },
		group: { read: true, write: true, execute: true },
		others: { read: true, write: true, execute: true },
	} },

	// Combining
	{ input: { user: { read: true, write: true } }, value: { user: { read: true, write: true } } },
	{ input: { user: { read: true, write: false } }, value: { user: { read: true, write: false } } },

	// Operators
	{ input: { others: { read: false } }, value: { others: { read: false } } },
	{ input: { others: { read: undefined } }, value: {} },

	// Special permissions
	{ input: { special: { sticky: true } }, value: { special: { sticky: true } } },
	{ input: { special: { setgid: true } }, value: { special: { setgid: true } } },
	{ input: { special: { setuid: true } }, value: { special: { setuid: true } } },

	// `all` category
	{ input: { all: { read: true } }, value: { user: { read: true }, group: { read: true }, others: { read: true } } },
	{ input: { user: { read: false }, all: { read: true } }, value: { user: { read: false }, group: { read: true }, others: { read: true } } },
	{ input: { all: { read: true }, special: { setuid: true } }, value: { user: { read: true }, group: { read: true }, others: { read: true }, special: { setuid: true } } },
];

for(const { input, error, value } of tests) {
	it(`normalizeObject - ${testname(input)}`, () => {
		const result = fse.mode.normalizeObject(input);
		if(error) {
			expect(result.fails).to.be.true;
			expect(result.error).to.equals(error);
		}
		else {
			expect(result.fails).to.be.false;
			expect(result.value).to.eql(value);
		}
	});
}
