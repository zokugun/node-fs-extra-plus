import { expect, it } from 'vitest';
import fse from '../../src/index.js';
import { testname } from './utils/testname.js';

const tests = [
	// {{{ Number
	// Invalid
	{ input: Number.NaN, error: 'Cannot convert NaN to stat' },
	{ input: Number.POSITIVE_INFINITY, value: '---------' },
	{ input: Number.EPSILON, value: '---------' },
	{ input: Number.MAX_SAFE_INTEGER, value: 'rwsrwsrwt' },
	{ input: Number.MAX_VALUE, value: '---------' },
	{ input: -1, error: 'Cannot convert -1 to stat' },
	{ input: 0.5, value: '---------' },
	{ input: 0o20_0000, value: '---------' },

	// Each permission
	{ input: 0o1, value: '--------x' },
	{ input: 0o2, value: '-------w-' },
	{ input: 0o4, value: '------r--' },
	{ input: 0o10, value: '-----x---' },
	{ input: 0o20, value: '----w----' },
	{ input: 0o40, value: '---r-----' },
	{ input: 0o100, value: '--x------' },
	{ input: 0o200, value: '-w-------' },
	{ input: 0o400, value: 'r--------' },
	{ input: 0o1000, value: '--------t' },
	{ input: 0o2000, value: '-----s---' },
	{ input: 0o4000, value: '--s------' },

	// Extremes
	{ input: 0o0, value: '---------' },
	{ input: 0o7777, value: 'rwsrwsrwt' },

	// Combining
	{ input: 0o3, value: '-------wx' },

	// `stat` bits
	{ input: 0o1_0000, value: 'p---------' },
	{ input: 0o17_7777, value: 'rwsrwsrwt' },

	{ input: 0o755, value: 'rwxr-xr-x' },
	{ input: 0o4_0755, value: 'drwxr-xr-x' },
	// }}}

	// {{{ Object
	// Invalid
	{ input: undefined, error: 'Cannot convert undefined to stat' },
	{ input: null, error: 'Cannot convert null to stat' },
	{ input: false, error: 'Cannot convert false to stat' },
	{ input: [], error: 'Cannot convert [] to stat' },
	{ input: { user: null }, error: 'Cannot convert { user: null } to stat' },
	{ input: { user: [] }, error: 'Cannot convert { user: [] } to stat' },
	{ input: { users: {} }, error: 'Cannot convert { users: {} } to stat' },
	{ input: { user: { readd: true } }, error: 'Cannot convert { user: { readd: true } } to stat' },
	{ input: { user: { setuid: true } }, error: 'Cannot convert { user: { setuid: true } } to stat' },
	{ input: { user: { setgid: true } }, error: 'Cannot convert { user: { setgid: true } } to stat' },
	{ input: { user: { sticky: true } }, error: 'Cannot convert { user: { sticky: true } } to stat' },
	{ input: { special: { read: true } }, error: 'Cannot convert { special: { read: true } } to stat' },
	{ input: { special: { write: true } }, error: 'Cannot convert { special: { write: true } } to stat' },
	{ input: { special: { execute: true } }, error: 'Cannot convert { special: { execute: true } } to stat' },
	{ input: { others: { read: null } }, error: 'Cannot convert { others: { read: null } } to stat' },
	{ input: { others: { read: {} } }, error: 'Cannot convert { others: { read: {} } } to stat' },

	// Each permission
	{ input: { others: { execute: true } }, error: 'Cannot convert { others: { execute: true } } to stat' },
	{ input: { others: { write: true } }, error: 'Cannot convert { others: { write: true } } to stat' },
	{ input: { others: { read: true } }, error: 'Cannot convert { others: { read: true } } to stat' },
	{ input: { group: { execute: true } }, error: 'Cannot convert { group: { execute: true } } to stat' },
	{ input: { group: { write: true } }, error: 'Cannot convert { group: { write: true } } to stat' },
	{ input: { group: { read: true } }, error: 'Cannot convert { group: { read: true } } to stat' },
	{ input: { user: { execute: true } }, error: 'Cannot convert { user: { execute: true } } to stat' },
	{ input: { user: { write: true } }, error: 'Cannot convert { user: { write: true } } to stat' },
	{ input: { user: { read: true } }, error: 'Cannot convert { user: { read: true } } to stat' },

	// Extremes
	{ input: {
		special: { setuid: true, setgid: true, sticky: true },
		user: { read: true, write: true, execute: true },
		group: { read: true, write: true, execute: true },
		others: { read: true, write: true, execute: true },
	}, value: 'rwsrwsrwt' },

	// Combining
	{ input: { user: { read: true, write: true } }, error: 'Cannot convert { user: { read: true, write: true } } to stat' },
	{ input: { user: { read: true, write: false } }, error: 'Cannot convert { user: { read: true, write: false } } to stat' },

	// Operators
	{ input: { others: { read: false } }, error: 'Cannot convert { others: { read: false } } to stat' },
	{ input: { others: { read: undefined } }, error: 'Cannot convert { others: { read: undefined } } to stat' },

	// Special permissions
	{ input: { special: { sticky: true } }, error: 'Cannot convert { special: { sticky: true } } to stat' },
	{ input: { special: { setgid: true } }, error: 'Cannot convert { special: { setgid: true } } to stat' },
	{ input: { special: { setuid: true } }, error: 'Cannot convert { special: { setuid: true } } to stat' },

	// `all` category
	{ input: { all: { read: true } }, error: 'Cannot convert { all: { read: true } } to stat' },
	{ input: { user: { read: false }, all: { read: true } }, error: 'Cannot convert { user: { read: false }, all: { read: true } } to stat' },
	{ input: { all: { read: true }, special: { setuid: true } }, error: 'Cannot convert { all: { read: true }, special: { setuid: true } } to stat' },
	{ input: { all: { read: true, write: false, execute: false } }, value: 'r--r--r--' },
	// }}}

	// {{{ Octal
	// Invalid
	{ input: 'NaN', error: 'Cannot convert "NaN" to stat' },
	{ input: '0.5', error: 'Cannot convert "0.5" to stat' },
	{ input: '10000', error: 'Cannot convert "10000" to stat' },
	{ input: '8', error: 'Cannot convert "8" to stat' },
	{ input: '~1', error: 'Cannot convert "~1" to stat' },

	// Each permission
	{ input: '1', value: '--------x' },
	{ input: '2', value: '-------w-' },
	{ input: '4', value: '------r--' },
	{ input: '10', value: '-----x---' },
	{ input: '20', value: '----w----' },
	{ input: '40', value: '---r-----' },
	{ input: '100', value: '--x------' },
	{ input: '200', value: '-w-------' },
	{ input: '400', value: 'r--------' },
	{ input: '1000', value: '--------t' },
	{ input: '2000', value: '-----s---' },
	{ input: '4000', value: '--s------' },

	// Extremes
	{ input: '0', value: '---------' },
	{ input: '7777', value: 'rwsrwsrwt' },

	// Combining
	{ input: '11', value: '-----x--x' },

	// Operators
	{ input: '=11', value: '-----x--x' },
	{ input: '+0', error: 'Cannot convert "+0" to stat' },
	{ input: '+11', error: 'Cannot convert "+11" to stat' },
	{ input: '-0', error: 'Cannot convert "-0" to stat' },
	{ input: '-11', error: 'Cannot convert "-11" to stat' },
	{ input: '-011', error: 'Cannot convert "-011" to stat' },
	{ input: '-0o11', error: 'Cannot convert "-0o11" to stat' },

	// Whitespace
	{ input: ' 111 ', value: '--x--x--x' },

	// Prefixes
	{ input: '0111', value: '--x--x--x' },
	{ input: '0o111', value: '--x--x--x' },
	{ input: '\\111', value: '--x--x--x' },
	{ input: '\\0111', value: '--x--x--x' },

	{ input: '0755', value: 'rwxr-xr-x' },
	// }}}

	// {{{ Stat
	// Invalid
	{ input: 'rwwrwxrwx', error: 'Cannot convert "rwwrwxrwx" to stat' },
	{ input: '--------j', error: 'Cannot convert "--------j" to stat' },
	{ input: '--------+', error: 'Cannot convert "--------+" to stat' },
	{ input: 'Br--------', error: 'Cannot convert "Br--------" to stat' },
	{ input: '--------s', error: 'Cannot convert "--------s" to stat' },
	{ input: '--------S', error: 'Cannot convert "--------S" to stat' },
	{ input: '-----t---', error: 'Cannot convert "-----t---" to stat' },
	{ input: '-----T---', error: 'Cannot convert "-----T---" to stat' },
	{ input: '--t------', error: 'Cannot convert "--t------" to stat' },
	{ input: '--T------', error: 'Cannot convert "--T------" to stat' },
	{ input: '--------', error: 'Cannot convert "--------" to stat' },
	{ input: '-- ---- ---', error: 'Cannot convert "-- ---- ---" to stat' },
	{ input: '-----------', error: 'Cannot convert "-----------" to stat' },

	// Each permission
	{ input: '--------x', value: '--------x' },
	{ input: '-------w-', value: '-------w-' },
	{ input: '------r--', value: '------r--' },
	{ input: '-----x---', value: '-----x---' },
	{ input: '----w----', value: '----w----' },
	{ input: '---r-----', value: '---r-----' },
	{ input: '--x------', value: '--x------' },
	{ input: '-w-------', value: '-w-------' },
	{ input: 'r--------', value: 'r--------' },

	// Extremes
	{ input: '---------', value: '---------' },
	{ input: 'rwxrwxrwx', value: 'rwxrwxrwx' },

	// Combining
	{ input: '-------wx', value: '-------wx' },

	// Special permissions
	{ input: '--------X', value: '--------X' },
	{ input: '-----X---', value: '-----X---' },
	{ input: '--X------', value: '--X------' },
	{ input: '--------T', value: '--------T' },
	{ input: '--------t', value: '--------t' },
	{ input: '-----s---', value: '-----s---' },
	{ input: '-----S---', value: '-----S---' },
	{ input: '--s------', value: '--s------' },
	{ input: '--S------', value: '--S------' },

	// Whitespace
	{ input: ' --------x ', value: '--------x' },
	{ input: '  ---  ---  --x', value: '--------x' },

	// File types
	{ input: '-rw-------', value: '-rw-------' },
	{ input: 'drw-------', value: 'drw-------' },
	{ input: 'lr--------', value: 'lr--------' },
	{ input: 'pr--------', value: 'pr--------' },
	{ input: 'sr--------', value: 'sr--------' },
	{ input: 'cr--------', value: 'cr--------' },
	{ input: 'br--------', value: 'br--------' },
	{ input: 'Dr--------', value: 'Dr--------' },

	// Changing order
	{ input: 'rxwrwxrwx', value: 'rwxrwxrwx' },

	{ input: 'rwxr-xr-x', value: 'rwxr-xr-x' },
	// }}}

	// {{{ Symbolic
	// Invalid
	{ input: '', error: 'Cannot convert "" to stat' },
	{ input: '   ', error: 'Cannot convert "   " to stat' },
	{ input: 'abc', error: 'Cannot convert "abc" to stat' },
	{ input: 'z+x', error: 'Cannot convert "z+x" to stat' },
	{ input: 'a~x', error: 'Cannot convert "a~x" to stat' },
	{ input: 'a+j', error: 'Cannot convert "a+j" to stat' },
	{ input: 'a+xx', error: 'Cannot convert "a+xx" to stat' },

	// Each permission
	{ input: 'o=x', value: '--------x' },
	{ input: 'o=w', value: '-------w-' },
	{ input: 'o=r', value: '------r--' },
	{ input: 'g=x', value: '-----x---' },
	{ input: 'g=w', value: '----w----' },
	{ input: 'g=r', value: '---r-----' },
	{ input: 'u=x', value: '--x------' },
	{ input: 'u=w', value: '-w-------' },
	{ input: 'u=r', value: 'r--------' },

	// Extremes
	{ input: 'a+', error: 'Cannot convert "a+" to stat' },
	{ input: 'a-', error: 'Cannot convert "a-" to stat' },
	{ input: 'a=', error: 'Cannot convert "a=" to stat' },
	{ input: 'a=rwx', value: 'rwxrwxrwx' },

	// No category
	{ input: '+', error: 'Cannot convert "+" to stat' },
	{ input: '-', error: 'Cannot convert "-" to stat' },
	{ input: '=', error: 'Cannot convert "=" to stat' },
	{ input: '+x', error: 'Cannot convert "+x" to stat' },
	{ input: '-x', error: 'Cannot convert "-x" to stat' },
	{ input: '=x', value: '--x--x--x' },

	// Combining
	{ input: 'a=rw', value: 'rw-rw-rw-' },

	// Operators
	{ input: 'a-x', error: 'Cannot convert "a-x" to stat' },
	{ input: 'a=x', value: '--x--x--x' },

	// Special permissions
	{ input: 'o=t', value: '--------t' },
	{ input: 'g=s', value: '-----s---' },
	{ input: 'u=s', value: '--s------' },
	{ input: 'o=s', error: 'Cannot convert "o=s" to stat' },
	{ input: 'g=t', error: 'Cannot convert "g=t" to stat' },
	{ input: 'u=t', error: 'Cannot convert "u=t" to stat' },
	{ input: 'a=ts', value: '--s--s--t' },
	{ input: 'a=X', value: '--X--X--X' },

	// Whitespace
	{ input: ' a+x ', error: 'Cannot convert " a+x " to stat' },
	{ input: 'u+x , u+r', error: 'Cannot convert "u+x , u+r" to stat' },

	// `all` category
	{ input: 'a+x', error: 'Cannot convert "a+x" to stat' },
	{ input: 'a+w', error: 'Cannot convert "a+w" to stat' },
	{ input: 'a+r', error: 'Cannot convert "a+r" to stat' },

	// Grouping categories
	{ input: 'go=x', value: '-----x--x' },
	{ input: 'gog=x', value: '-----x--x' },
	{ input: 'ag=x', value: '--x--x--x' },
	{ input: 'g=x,o=x', value: '-----x--x' },

	// Combining plus and minus
	{ input: 'o+x,o-x', error: 'Cannot convert "o+x,o-x" to stat' },
	{ input: 'o-x,o+x', error: 'Cannot convert "o-x,o+x" to stat' },
	{ input: 'o+x,o+x', error: 'Cannot convert "o+x,o+x" to stat' },
	{ input: 'o-x,o-x', error: 'Cannot convert "o-x,o-x" to stat' },
	{ input: 'o=x,o-x', error: 'Cannot convert "o=x,o-x" to stat' },
	{ input: 'o=x,o+x', error: 'Cannot convert "o=x,o+x" to stat' },
	{ input: 'a+x,o-x', error: 'Cannot convert "a+x,o-x" to stat' },

	// Combining different categories and permissions
	{ input: 'o+x,g-x', error: 'Cannot convert "o+x,g-x" to stat' },
	{ input: 'o+x,o-r', error: 'Cannot convert "o+x,o-r" to stat' },

	{ input: 'u+rwx,g+rx,o+rx', error: 'Cannot convert "u+rwx,g+rx,o+rx" to stat' },
	// }}}
];

for(const { input, error, value } of tests) {
	it(`toStat - ${testname(input)}`, () => {
		const result = fse.mode.toStat(input);
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
