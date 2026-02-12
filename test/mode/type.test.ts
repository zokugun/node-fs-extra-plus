import { expect, it } from 'vitest';
import fse from '../../src/index.js';
import { testname } from './utils/testname.js';

const tests = [
	// {{{ Number
	// Invalid
	{ input: Number.NaN, output: null },
	{ input: Number.POSITIVE_INFINITY, output: null },
	{ input: Number.EPSILON, output: null },
	{ input: Number.MAX_SAFE_INTEGER, output: null },
	{ input: Number.MAX_VALUE, output: null },
	{ input: -1, output: null },
	{ input: 0.5, output: null },
	{ input: 0o20_0000, output: null },

	// Each permission
	{ input: 0o1, output: 'number' },
	{ input: 0o2, output: 'number' },
	{ input: 0o4, output: 'number' },
	{ input: 0o10, output: 'number' },
	{ input: 0o20, output: 'number' },
	{ input: 0o40, output: 'number' },
	{ input: 0o100, output: 'number' },
	{ input: 0o200, output: 'number' },
	{ input: 0o400, output: 'number' },
	{ input: 0o1000, output: 'number' },
	{ input: 0o2000, output: 'number' },
	{ input: 0o4000, output: 'number' },

	// Extremes
	{ input: 0o0, output: 'number' },
	{ input: 0o7777, output: 'number' },

	// Combining
	{ input: 0o3, output: 'number' },

	// `stat` bits
	{ input: 0o1_0000, output: 'number' },
	{ input: 0o17_7777, output: 'number' },

	{ input: 0o755, output: 'number' },
	{ input: 0o4_0755, output: 'number' },
	// }}}

	// {{{ Object
	// Invalid
	{ input: undefined, output: null },
	{ input: null, output: null },
	{ input: false, output: null },
	{ input: [], output: null },
	{ input: { user: null }, output: null },
	{ input: { user: [] }, output: null },
	{ input: { users: {} }, output: null },
	{ input: { user: { readd: true } }, output: null },
	{ input: { user: { setuid: true } }, output: null },
	{ input: { user: { setgid: true } }, output: null },
	{ input: { user: { sticky: true } }, output: null },
	{ input: { special: { read: true } }, output: null },
	{ input: { special: { write: true } }, output: null },
	{ input: { special: { execute: true } }, output: null },
	{ input: { others: { read: null } }, output: null },
	{ input: { others: { read: {} } }, output: null },

	// Each permission
	{ input: { others: { execute: true } }, output: 'object' },
	{ input: { others: { write: true } }, output: 'object' },
	{ input: { others: { read: true } }, output: 'object' },
	{ input: { group: { execute: true } }, output: 'object' },
	{ input: { group: { write: true } }, output: 'object' },
	{ input: { group: { read: true } }, output: 'object' },
	{ input: { user: { execute: true } }, output: 'object' },
	{ input: { user: { write: true } }, output: 'object' },
	{ input: { user: { read: true } }, output: 'object' },

	// Extremes
	{ input: {
		special: { setuid: true, setgid: true, sticky: true },
		user: { read: true, write: true, execute: true },
		group: { read: true, write: true, execute: true },
		others: { read: true, write: true, execute: true },
	}, output: 'object' },

	// Combining
	{ input: { user: { read: true, write: true } }, output: 'object' },
	{ input: { user: { read: true, write: false } }, output: 'object' },

	// Operators
	{ input: { others: { read: false } }, output: 'object' },
	{ input: { others: { read: undefined } }, output: 'object' },

	// Special permissions
	{ input: { special: { sticky: true } }, output: 'object' },
	{ input: { special: { setgid: true } }, output: 'object' },
	{ input: { special: { setuid: true } }, output: 'object' },

	// `all` category
	{ input: { all: { read: true } }, output: 'object' },
	{ input: { user: { read: false }, all: { read: true } }, output: 'object' },
	{ input: { all: { read: true }, special: { setuid: true } }, output: 'object' },
	// }}}

	// {{{ Octal
	{ input: 'NaN', output: null },
	{ input: '0.5', output: null },
	{ input: '10000', output: null },
	{ input: '8', output: null },
	{ input: '~1', output: null },

	// Each permission
	{ input: '1', output: 'octal' },
	{ input: '2', output: 'octal' },
	{ input: '4', output: 'octal' },
	{ input: '10', output: 'octal' },
	{ input: '20', output: 'octal' },
	{ input: '40', output: 'octal' },
	{ input: '100', output: 'octal' },
	{ input: '200', output: 'octal' },
	{ input: '400', output: 'octal' },
	{ input: '1000', output: 'octal' },
	{ input: '2000', output: 'octal' },
	{ input: '4000', output: 'octal' },

	// Extremes
	{ input: '0', output: 'octal' },
	{ input: '7777', output: 'octal' },

	// Combining
	{ input: '11', output: 'octal' },

	// Operators
	{ input: '=11', output: 'octal' },
	{ input: '+0', output: 'octal' },
	{ input: '+11', output: 'octal' },
	{ input: '-0', output: 'octal' },
	{ input: '-11', output: 'octal' },
	{ input: '-011', output: 'octal' },
	{ input: '-0o11', output: 'octal' },

	// Whitespace
	{ input: ' 111 ', output: 'octal' },

	// Prefixes
	{ input: '0111', output: 'octal' },
	{ input: '0o111', output: 'octal' },
	{ input: '\\111', output: 'octal' },
	{ input: '\\0111', output: 'octal' },

	{ input: '0755', output: 'octal' },
	// }}}

	// {{{ Stat
	// Invalid
	{ input: 'rwwrwxrwx', output: null },
	{ input: '--------j', output: null },
	{ input: '--------+', output: null },
	{ input: 'Br--------', output: null },
	{ input: '--------s', output: null },
	{ input: '--------S', output: null },
	{ input: '-----t---', output: null },
	{ input: '-----T---', output: null },
	{ input: '--t------', output: null },
	{ input: '--T------', output: null },
	{ input: '--------', output: null },
	{ input: '-- ---- ---', output: null },
	{ input: '-----------', output: null },

	// Each permission
	{ input: '--------x', output: 'stat' },
	{ input: '-------w-', output: 'stat' },
	{ input: '------r--', output: 'stat' },
	{ input: '-----x---', output: 'stat' },
	{ input: '----w----', output: 'stat' },
	{ input: '---r-----', output: 'stat' },
	{ input: '--x------', output: 'stat' },
	{ input: '-w-------', output: 'stat' },
	{ input: 'r--------', output: 'stat' },

	// Extremes
	{ input: '---------', output: 'stat' },
	{ input: 'rwxrwxrwx', output: 'stat' },

	// Combining
	{ input: '-------wx', output: 'stat' },

	// Special permissions
	{ input: '--------X', output: 'stat' },
	{ input: '-----X---', output: 'stat' },
	{ input: '--X------', output: 'stat' },
	{ input: '--------T', output: 'stat' },
	{ input: '--------t', output: 'stat' },
	{ input: '-----s---', output: 'stat' },
	{ input: '-----S---', output: 'stat' },
	{ input: '--s------', output: 'stat' },
	{ input: '--S------', output: 'stat' },

	// Whitespace
	{ input: ' --------x ', output: 'stat' },
	{ input: '  ---  ---  --x', output: 'stat' },

	// File types
	{ input: 'drw-------', output: 'stat' },
	{ input: 'lr--------', output: 'stat' },
	{ input: 'pr--------', output: 'stat' },
	{ input: 'sr--------', output: 'stat' },
	{ input: 'cr--------', output: 'stat' },
	{ input: 'br--------', output: 'stat' },
	{ input: 'Dr--------', output: 'stat' },

	// Changing order
	{ input: 'rxwrwxrwx', output: 'stat' },

	{ input: 'rwxr-xr-x', output: 'stat' },
	// }}}

	// {{{ Symbolic
	// Invalid
	{ input: '', output: null },
	{ input: '   ', output: null },
	{ input: 'abc', output: null },
	{ input: 'z+x', output: null },
	{ input: 'a~x', output: null },
	{ input: 'a+j', output: null },
	{ input: 'a+xx', output: null },

	// Each permission
	{ input: 'o+x', output: 'symbolic' },
	{ input: 'o+w', output: 'symbolic' },
	{ input: 'o+r', output: 'symbolic' },
	{ input: 'g+x', output: 'symbolic' },
	{ input: 'g+w', output: 'symbolic' },
	{ input: 'g+r', output: 'symbolic' },
	{ input: 'u+x', output: 'symbolic' },
	{ input: 'u+w', output: 'symbolic' },
	{ input: 'u+r', output: 'symbolic' },

	// Extremes
	{ input: 'a+', output: 'symbolic' },
	{ input: 'a-', output: 'symbolic' },
	{ input: 'a=', output: 'symbolic' },
	{ input: 'a=rwx', output: 'symbolic' },

	// No category
	{ input: '+', output: 'symbolic' },
	{ input: '-', output: 'symbolic' },
	{ input: '=', output: 'symbolic' },
	{ input: '+x', output: 'symbolic' },
	{ input: '-x', output: 'symbolic' },
	{ input: '=x', output: 'symbolic' },

	// Combining
	{ input: 'a=rw', output: 'symbolic' },

	// Operators
	{ input: 'a-x', output: 'symbolic' },
	{ input: 'a=x', output: 'symbolic' },

	// Special permissions
	{ input: 'o+t', output: 'symbolic' },
	{ input: 'g+s', output: 'symbolic' },
	{ input: 'u+s', output: 'symbolic' },
	{ input: 'o+s', output: 'symbolic' },
	{ input: 'g+t', output: 'symbolic' },
	{ input: 'u+t', output: 'symbolic' },
	{ input: 'a+ts', output: 'symbolic' },
	{ input: 'a+X', output: 'symbolic' },

	// Whitespace
	{ input: ' a+x ', output: 'symbolic' },
	{ input: 'u+x , u+r', output: 'symbolic' },

	// `all` category
	{ input: 'a+x', output: 'symbolic' },
	{ input: 'a+w', output: 'symbolic' },
	{ input: 'a+r', output: 'symbolic' },

	// Grouping categories
	{ input: 'go=x', output: 'symbolic' },
	{ input: 'gog=x', output: 'symbolic' },
	{ input: 'ag=x', output: 'symbolic' },
	{ input: 'g=x,o=x', output: 'symbolic' },

	// Combining plus and minus
	{ input: 'o+x,o-x', output: 'symbolic' },
	{ input: 'o-x,o+x', output: 'symbolic' },
	{ input: 'o+x,o+x', output: 'symbolic' },
	{ input: 'o-x,o-x', output: 'symbolic' },
	{ input: 'o=x,o-x', output: 'symbolic' },
	{ input: 'o=x,o+x', output: 'symbolic' },
	{ input: 'a+x,o-x', output: 'symbolic' },

	// Combining different categories and permissions
	{ input: 'o+x,g-x', output: 'symbolic' },
	{ input: 'o+x,o-r', output: 'symbolic' },

	{ input: 'u+rwx,g+rx,o+rx', output: 'symbolic' },
	// }}}
];

for(const { input, output } of tests) {
	it(`type - ${testname(input)}`, () => {
		const result = fse.mode.type(input);
		expect(result).to.equals(output);
	});
}
