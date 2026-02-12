import { expect, it } from 'vitest';
import fse from '../../src/index.js';
import { testname } from './utils/testname.js';

const tests = [
	// {{{ Number
	// Invalid
	{ input: Number.NaN, error: 'Cannot convert NaN to number' },
	{ input: Number.POSITIVE_INFINITY, value: 0o0 },
	{ input: Number.EPSILON, value: 0o0 },
	{ input: Number.MAX_SAFE_INTEGER, value: 0o17_7777 },
	{ input: Number.MAX_VALUE, value: 0o0 },
	{ input: -1, error: 'Cannot convert -1 to number' },
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
	// }}}

	// {{{ Object
	// Invalid
	{ input: undefined, error: 'Cannot convert undefined to number' },
	{ input: null, error: 'Cannot convert null to number' },
	{ input: false, error: 'Cannot convert false to number' },
	{ input: [], error: 'Cannot convert [] to number' },
	{ input: { user: null }, error: 'Cannot convert { user: null } to number' },
	{ input: { user: [] }, error: 'Cannot convert { user: [] } to number' },
	{ input: { users: {} }, error: 'Cannot convert { users: {} } to number' },
	{ input: { user: { readd: true } }, error: 'Cannot convert { user: { readd: true } } to number' },
	{ input: { user: { setuid: true } }, error: 'Cannot convert { user: { setuid: true } } to number' },
	{ input: { user: { setgid: true } }, error: 'Cannot convert { user: { setgid: true } } to number' },
	{ input: { user: { sticky: true } }, error: 'Cannot convert { user: { sticky: true } } to number' },
	{ input: { special: { read: true } }, error: 'Cannot convert { special: { read: true } } to number' },
	{ input: { special: { write: true } }, error: 'Cannot convert { special: { write: true } } to number' },
	{ input: { special: { execute: true } }, error: 'Cannot convert { special: { execute: true } } to number' },
	{ input: { others: { read: null } }, error: 'Cannot convert { others: { read: null } } to number' },
	{ input: { others: { read: {} } }, error: 'Cannot convert { others: { read: {} } } to number' },

	// Each permission
	{ input: { others: { execute: true } }, error: 'Cannot convert { others: { execute: true } } to number' },
	{ input: { others: { write: true } }, error: 'Cannot convert { others: { write: true } } to number' },
	{ input: { others: { read: true } }, error: 'Cannot convert { others: { read: true } } to number' },
	{ input: { group: { execute: true } }, error: 'Cannot convert { group: { execute: true } } to number' },
	{ input: { group: { write: true } }, error: 'Cannot convert { group: { write: true } } to number' },
	{ input: { group: { read: true } }, error: 'Cannot convert { group: { read: true } } to number' },
	{ input: { user: { execute: true } }, error: 'Cannot convert { user: { execute: true } } to number' },
	{ input: { user: { write: true } }, error: 'Cannot convert { user: { write: true } } to number' },
	{ input: { user: { read: true } }, error: 'Cannot convert { user: { read: true } } to number' },

	// Extremes
	{ input: {
		special: { setuid: true, setgid: true, sticky: true },
		user: { read: true, write: true, execute: true },
		group: { read: true, write: true, execute: true },
		others: { read: true, write: true, execute: true },
	}, value: 0o7777 },

	// Combining
	{ input: { user: { read: true, write: true } }, error: 'Cannot convert { user: { read: true, write: true } } to number' },
	{ input: { user: { read: true, write: false } }, error: 'Cannot convert { user: { read: true, write: false } } to number' },

	// Operators
	{ input: { others: { read: false } }, error: 'Cannot convert { others: { read: false } } to number' },
	{ input: { others: { read: undefined } }, error: 'Cannot convert { others: { read: undefined } } to number' },

	// Special permissions
	{ input: { special: { sticky: true } }, error: 'Cannot convert { special: { sticky: true } } to number' },
	{ input: { special: { setgid: true } }, error: 'Cannot convert { special: { setgid: true } } to number' },
	{ input: { special: { setuid: true } }, error: 'Cannot convert { special: { setuid: true } } to number' },

	// `all` category
	{ input: { all: { read: true } }, error: 'Cannot convert { all: { read: true } } to number' },
	{ input: { user: { read: false }, all: { read: true } }, error: 'Cannot convert { user: { read: false }, all: { read: true } } to number' },
	{ input: { all: { read: true }, special: { setuid: true } }, error: 'Cannot convert { all: { read: true }, special: { setuid: true } } to number' },
	{ input: { all: { read: true, write: false, execute: false } }, value: 0o444 },
	// }}}

	// {{{ Octal
	// Invalid
	{ input: 'NaN', error: 'Cannot convert "NaN" to number' },
	{ input: '0.5', error: 'Cannot convert "0.5" to number' },
	{ input: '10000', error: 'Cannot convert "10000" to number' },
	{ input: '8', error: 'Cannot convert "8" to number' },
	{ input: '~1', error: 'Cannot convert "~1" to number' },

	// Each permission
	{ input: '1', value: 0o0001 },
	{ input: '2', value: 0o0002 },
	{ input: '4', value: 0o0004 },
	{ input: '10', value: 0o0010 },
	{ input: '20', value: 0o0020 },
	{ input: '40', value: 0o0040 },
	{ input: '100', value: 0o0100 },
	{ input: '200', value: 0o0200 },
	{ input: '400', value: 0o0400 },
	{ input: '1000', value: 0o1000 },
	{ input: '2000', value: 0o2000 },
	{ input: '4000', value: 0o4000 },

	// Extremes
	{ input: '0', value: 0o0000 },
	{ input: '7777', value: 0o7777 },

	// Combining
	{ input: '11', value: 0o0011 },

	// Operators
	{ input: '=11', value: 0o0011 },
	{ input: '+0', error: 'Cannot convert "+0" to number' },
	{ input: '+11', error: 'Cannot convert "+11" to number' },
	{ input: '-0', error: 'Cannot convert "-0" to number' },
	{ input: '-11', error: 'Cannot convert "-11" to number' },
	{ input: '-011', error: 'Cannot convert "-011" to number' },
	{ input: '-0o11', error: 'Cannot convert "-0o11" to number' },

	// Whitespace
	{ input: ' 111 ', value: 0o0111 },

	// Prefixes
	{ input: '0111', value: 0o0111 },
	{ input: '0o111', value: 0o0111 },
	{ input: '\\111', value: 0o0111 },
	{ input: '\\0111', value: 0o0111 },

	{ input: '0755', value: 0o0755 },
	// }}}

	// {{{ Stat
	// Invalid
	{ input: 'rwwrwxrwx', error: 'Cannot convert "rwwrwxrwx" to number' },
	{ input: '--------j', error: 'Cannot convert "--------j" to number' },
	{ input: '--------+', error: 'Cannot convert "--------+" to number' },
	{ input: 'Br--------', error: 'Cannot convert "Br--------" to number' },
	{ input: '--------s', error: 'Cannot convert "--------s" to number' },
	{ input: '--------S', error: 'Cannot convert "--------S" to number' },
	{ input: '-----t---', error: 'Cannot convert "-----t---" to number' },
	{ input: '-----T---', error: 'Cannot convert "-----T---" to number' },
	{ input: '--t------', error: 'Cannot convert "--t------" to number' },
	{ input: '--T------', error: 'Cannot convert "--T------" to number' },
	{ input: '--------', error: 'Cannot convert "--------" to number' },
	{ input: '-- ---- ---', error: 'Cannot convert "-- ---- ---" to number' },
	{ input: '-----------', error: 'Cannot convert "-----------" to number' },

	// Each permission
	{ input: '--------x', value: 0o0001 },
	{ input: '-------w-', value: 0o0002 },
	{ input: '------r--', value: 0o0004 },
	{ input: '-----x---', value: 0o0010 },
	{ input: '----w----', value: 0o0020 },
	{ input: '---r-----', value: 0o0040 },
	{ input: '--x------', value: 0o0100 },
	{ input: '-w-------', value: 0o0200 },
	{ input: 'r--------', value: 0o0400 },

	// Extremes
	{ input: '---------', value: 0o0000 },
	{ input: 'rwxrwxrwx', value: 0o0777 },

	// Combining
	{ input: '-------wx', value: 0o0003 },

	// Special permissions
	{ input: '--------X', error: 'Cannot convert "--------X" to number' },
	{ input: '-----X---', error: 'Cannot convert "-----X---" to number' },
	{ input: '--X------', error: 'Cannot convert "--X------" to number' },
	{ input: '--------T', value: 0o1000 },
	{ input: '--------t', value: 0o1001 },
	{ input: '-----s---', value: 0o2010 },
	{ input: '-----S---', value: 0o2000 },
	{ input: '--s------', value: 0o4100 },
	{ input: '--S------', value: 0o4000 },

	// Whitespace
	{ input: ' --------x ', value: 0o0001 },
	{ input: '  ---  ---  --x', value: 0o0001 },

	// File types
	{ input: '-rw-------', value: 0o10_0600 },
	{ input: 'drw-------', value: 0o4_0600 },
	{ input: 'lr--------', value: 0o12_0400 },
	{ input: 'pr--------', value: 0o1_0400 },
	{ input: 'sr--------', value: 0o14_0400 },
	{ input: 'cr--------', value: 0o2_0400 },
	{ input: 'br--------', value: 0o6_0400 },
	{ input: 'Dr--------', value: 0o16_0400 },

	// Changing order
	{ input: 'rxwrwxrwx', value: 0o0777 },

	{ input: 'rwxr-xr-x', value: 0o0755 },
	// }}}

	// {{{ Symbolic
	// Invalid
	{ input: '', error: 'Cannot convert "" to number' },
	{ input: '   ', error: 'Cannot convert "   " to number' },
	{ input: 'abc', error: 'Cannot convert "abc" to number' },
	{ input: 'z+x', error: 'Cannot convert "z+x" to number' },
	{ input: 'a~x', error: 'Cannot convert "a~x" to number' },
	{ input: 'a+j', error: 'Cannot convert "a+j" to number' },
	{ input: 'a+xx', error: 'Cannot convert "a+xx" to number' },

	// Each permission
	{ input: 'o=x', value: 0o0001 },
	{ input: 'o=w', value: 0o0002 },
	{ input: 'o=r', value: 0o0004 },
	{ input: 'g=x', value: 0o0010 },
	{ input: 'g=w', value: 0o0020 },
	{ input: 'g=r', value: 0o0040 },
	{ input: 'u=x', value: 0o0100 },
	{ input: 'u=w', value: 0o0200 },
	{ input: 'u=r', value: 0o0400 },

	// Extremes
	{ input: 'a+', error: 'Cannot convert "a+" to number' },
	{ input: 'a-', error: 'Cannot convert "a-" to number' },
	{ input: 'a=', error: 'Cannot convert "a=" to number' },
	{ input: 'a=rwx', value: 0o0777 },

	// No category
	{ input: '+', error: 'Cannot convert "+" to number' },
	{ input: '-', error: 'Cannot convert "-" to number' },
	{ input: '=', error: 'Cannot convert "=" to number' },
	{ input: '+x', error: 'Cannot convert "+x" to number' },
	{ input: '-x', error: 'Cannot convert "-x" to number' },
	{ input: '=x', value: 0o0111 },

	// Combining
	{ input: 'a=rw', value: 0o0666 },

	// Operators
	{ input: 'a-x', error: 'Cannot convert "a-x" to number' },
	{ input: 'a=x', value: 0o0111 },

	// Special permissions
	{ input: 'o=t', value: 0o1001 },
	{ input: 'g=s', value: 0o2010 },
	{ input: 'u=s', value: 0o4100 },
	{ input: 'o=s', error: 'Cannot convert "o=s" to number' },
	{ input: 'g=t', error: 'Cannot convert "g=t" to number' },
	{ input: 'u=t', error: 'Cannot convert "u=t" to number' },
	{ input: 'a=ts', value: 0o7111 },
	{ input: 'a=X', error: 'Cannot convert "a=X" to number' },

	// Whitespace
	{ input: ' a+x ', error: 'Cannot convert " a+x " to number' },
	{ input: 'u+x , u+r', error: 'Cannot convert "u+x , u+r" to number' },

	// `all` category
	{ input: 'a+x', error: 'Cannot convert "a+x" to number' },
	{ input: 'a+w', error: 'Cannot convert "a+w" to number' },
	{ input: 'a+r', error: 'Cannot convert "a+r" to number' },

	// Grouping categories
	{ input: 'go=x', value: 0o0011 },
	{ input: 'gog=x', value: 0o0011 },
	{ input: 'ag=x', value: 0o0111 },
	{ input: 'g=x,o=x', value: 0o0011 },

	// Combining plus and minus
	{ input: 'o+x,o-x', error: 'Cannot convert "o+x,o-x" to number' },
	{ input: 'o-x,o+x', error: 'Cannot convert "o-x,o+x" to number' },
	{ input: 'o+x,o+x', error: 'Cannot convert "o+x,o+x" to number' },
	{ input: 'o-x,o-x', error: 'Cannot convert "o-x,o-x" to number' },
	{ input: 'o=x,o-x', error: 'Cannot convert "o=x,o-x" to number' },
	{ input: 'o=x,o+x', error: 'Cannot convert "o=x,o+x" to number' },
	{ input: 'a+x,o-x', error: 'Cannot convert "a+x,o-x" to number' },

	// Combining different categories and permissions
	{ input: 'o+x,g-x', error: 'Cannot convert "o+x,g-x" to number' },
	{ input: 'o+x,o-r', error: 'Cannot convert "o+x,o-r" to number' },

	{ input: 'u+rwx,g+rx,o+rx', error: 'Cannot convert "u+rwx,g+rx,o+rx" to number' },
	// }}}
];

for(const { input, error, value } of tests) {
	it(`toNumber - ${testname(input)}`, () => {
		const result = fse.mode.toNumber(input);
		if(error) {
			expect(result.fails).to.be.true;
			expect(result.error).to.equals(error);
		}
		else {
			if(result.value !== value) {
				console.log(result.value?.toString(8));
			}

			expect(result.fails).to.be.false;
			expect(result.value).to.eql(value);
		}
	});
}
