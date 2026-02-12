import { expect, it } from 'vitest';
import fse from '../../src/index.js';
import { testname } from './utils/testname.js';

const tests = [
	// {{{ Number
	// Invalid
	{ input: Number.NaN, error: 'Cannot convert NaN to symbolic' },
	{ input: Number.POSITIVE_INFINITY, value: '' },
	{ input: Number.EPSILON, value: '' },
	{ input: Number.MAX_SAFE_INTEGER, value: 'u=rws,g=rws,o=rwt' },
	{ input: Number.MAX_VALUE, value: '' },
	{ input: -1, error: 'Cannot convert -1 to symbolic' },
	{ input: 0.5, value: '' },
	{ input: 0o20_0000, value: '' },

	// Each permission
	{ input: 0o1, value: 'o=x' },
	{ input: 0o2, value: 'o=w' },
	{ input: 0o4, value: 'o=r' },
	{ input: 0o10, value: 'g=x' },
	{ input: 0o20, value: 'g=w' },
	{ input: 0o40, value: 'g=r' },
	{ input: 0o100, value: 'u=x' },
	{ input: 0o200, value: 'u=w' },
	{ input: 0o400, value: 'u=r' },
	{ input: 0o1000, value: 'o-t' },
	{ input: 0o2000, value: 'g-s' },
	{ input: 0o4000, value: 'u-s' },

	// Extremes
	{ input: 0o0, value: '' },
	{ input: 0o7777, value: 'u=rws,g=rws,o=rwt' },

	// Combining
	{ input: 0o3, value: 'o=wx' },

	// `stat` bits
	{ input: 0o1_0000, error: 'Cannot convert 0o10000 to symbolic' },
	{ input: 0o17_7777, value: 'u=rws,g=rws,o=rwt' },

	{ input: 0o755, value: 'u=rwx,g=rx,o=rx' },
	{ input: 0o4_0755, error: 'Cannot convert 0o40755 to symbolic' },
	// }}}

	// {{{ Object
	// Invalid
	{ input: undefined, error: 'Cannot convert undefined to symbolic' },
	{ input: null, error: 'Cannot convert null to symbolic' },
	{ input: false, error: 'Cannot convert false to symbolic' },
	{ input: [], error: 'Cannot convert [] to symbolic' },
	{ input: { user: null }, error: 'Cannot convert { user: null } to symbolic' },
	{ input: { user: [] }, error: 'Cannot convert { user: [] } to symbolic' },
	{ input: { users: {} }, error: 'Cannot convert { users: {} } to symbolic' },
	{ input: { user: { readd: true } }, error: 'Cannot convert { user: { readd: true } } to symbolic' },
	{ input: { user: { setuid: true } }, error: 'Cannot convert { user: { setuid: true } } to symbolic' },
	{ input: { user: { setgid: true } }, error: 'Cannot convert { user: { setgid: true } } to symbolic' },
	{ input: { user: { sticky: true } }, error: 'Cannot convert { user: { sticky: true } } to symbolic' },
	{ input: { special: { read: true } }, error: 'Cannot convert { special: { read: true } } to symbolic' },
	{ input: { special: { write: true } }, error: 'Cannot convert { special: { write: true } } to symbolic' },
	{ input: { special: { execute: true } }, error: 'Cannot convert { special: { execute: true } } to symbolic' },
	{ input: { others: { read: null } }, error: 'Cannot convert { others: { read: null } } to symbolic' },
	{ input: { others: { read: {} } }, error: 'Cannot convert { others: { read: {} } } to symbolic' },

	// Each permission
	{ input: { others: { execute: true } }, value: 'o+x' },
	{ input: { others: { write: true } }, value: 'o+w' },
	{ input: { others: { read: true } }, value: 'o+r' },
	{ input: { group: { execute: true } }, value: 'g+x' },
	{ input: { group: { write: true } }, value: 'g+w' },
	{ input: { group: { read: true } }, value: 'g+r' },
	{ input: { user: { execute: true } }, value: 'u+x' },
	{ input: { user: { write: true } }, value: 'u+w' },
	{ input: { user: { read: true } }, value: 'u+r' },

	// Extremes
	{ input: {
		special: { setuid: true, setgid: true, sticky: true },
		user: { read: true, write: true, execute: true },
		group: { read: true, write: true, execute: true },
		others: { read: true, write: true, execute: true },
	}, value: 'u=rws,g=rws,o=rwt' },

	// Combining
	{ input: { user: { read: true, write: true } }, value: 'u+rw' },
	{ input: { user: { read: true, write: false } }, value: 'u+r,u-w' },

	// Operators
	{ input: { others: { read: false } }, value: 'o-r' },
	{ input: { others: { read: undefined } }, value: '' },

	// Special permissions
	{ input: { special: { sticky: true } }, value: 'o+t' },
	{ input: { special: { setgid: true } }, value: 'g+s' },
	{ input: { special: { setuid: true } }, value: 'u+s' },

	// `all` category
	{ input: { all: { read: true } }, value: 'u+r,g+r,o+r' },
	{ input: { user: { read: false }, all: { read: true } }, value: 'u-r,g+r,o+r' },
	{ input: { all: { read: true }, special: { setuid: true } }, value: 'u+rs,g+r,o+r' },
	{ input: { all: { read: true, write: false, execute: false } }, value: 'u=r,g=r,o=r' },
	// }}}

	// {{{ Octal
	// Invalid
	{ input: 'NaN', error: 'Cannot convert "NaN" to symbolic' },
	{ input: '0.5', error: 'Cannot convert "0.5" to symbolic' },
	{ input: '10000', error: 'Cannot convert "10000" to symbolic' },
	{ input: '8', error: 'Cannot convert "8" to symbolic' },
	{ input: '~1', error: 'Cannot convert "~1" to symbolic' },

	// Each permission
	{ input: '1', value: 'o=x' },
	{ input: '2', value: 'o=w' },
	{ input: '4', value: 'o=r' },
	{ input: '10', value: 'g=x' },
	{ input: '20', value: 'g=w' },
	{ input: '40', value: 'g=r' },
	{ input: '100', value: 'u=x' },
	{ input: '200', value: 'u=w' },
	{ input: '400', value: 'u=r' },
	{ input: '1000', value: 'o-t' },
	{ input: '2000', value: 'g-s' },
	{ input: '4000', value: 'u-s' },

	// Extremes
	{ input: '0', value: '' },
	{ input: '7777', value: 'u=rws,g=rws,o=rwt' },

	// Combining
	{ input: '11', value: 'g=x,o=x' },

	// Operators
	{ input: '=11', value: 'g=x,o=x' },
	{ input: '+0', value: '' },
	{ input: '+11', value: 'g+x,o+x' },
	{ input: '-0', value: '' },
	{ input: '-11', value: 'g-x,o-x' },
	{ input: '-011', value: 'g-x,o-x' },
	{ input: '-0o11', value: 'g-x,o-x' },

	// Whitespace
	{ input: ' 111 ', value: 'u=x,g=x,o=x' },

	// Prefixes
	{ input: '0111', value: 'u=x,g=x,o=x' },
	{ input: '0o111', value: 'u=x,g=x,o=x' },
	{ input: '\\111', value: 'u=x,g=x,o=x' },
	{ input: '\\0111', value: 'u=x,g=x,o=x' },

	{ input: '0755', value: 'u=rwx,g=rx,o=rx' },
	// }}}

	// {{{ Stat
	// Invalid
	{ input: 'rwwrwxrwx', error: 'Cannot convert "rwwrwxrwx" to symbolic' },
	{ input: '--------j', error: 'Cannot convert "--------j" to symbolic' },
	{ input: '--------+', error: 'Cannot convert "--------+" to symbolic' },
	{ input: 'Br--------', error: 'Cannot convert "Br--------" to symbolic' },
	{ input: '--------s', error: 'Cannot convert "--------s" to symbolic' },
	{ input: '--------S', error: 'Cannot convert "--------S" to symbolic' },
	{ input: '-----t---', error: 'Cannot convert "-----t---" to symbolic' },
	{ input: '-----T---', error: 'Cannot convert "-----T---" to symbolic' },
	{ input: '--t------', error: 'Cannot convert "--t------" to symbolic' },
	{ input: '--T------', error: 'Cannot convert "--T------" to symbolic' },
	{ input: '--------', error: 'Cannot convert "--------" to symbolic' },
	{ input: '-- ---- ---', error: 'Cannot convert "-- ---- ---" to symbolic' },
	{ input: '-----------', error: 'Cannot convert "-----------" to symbolic' },

	// Each permission
	{ input: '--------x', value: 'o=x' },
	{ input: '-------w-', value: 'o=w' },
	{ input: '------r--', value: 'o=r' },
	{ input: '-----x---', value: 'g=x' },
	{ input: '----w----', value: 'g=w' },
	{ input: '---r-----', value: 'g=r' },
	{ input: '--x------', value: 'u=x' },
	{ input: '-w-------', value: 'u=w' },
	{ input: 'r--------', value: 'u=r' },

	// Extremes
	{ input: '---------', value: '' },
	{ input: 'rwxrwxrwx', value: 'u=rwx,g=rwx,o=rwx' },

	// Combining
	{ input: '-------wx', value: 'o=wx' },

	// Special permissions
	{ input: '--------X', value: 'o=X' },
	{ input: '-----X---', value: 'g=X' },
	{ input: '--X------', value: 'u=X' },
	{ input: '--------T', value: 'o-t' },
	{ input: '--------t', value: 'o=t' },
	{ input: '-----s---', value: 'g=s' },
	{ input: '-----S---', value: 'g-s' },
	{ input: '--s------', value: 'u=s' },
	{ input: '--S------', value: 'u-s' },

	// Whitespace
	{ input: ' --------x ', value: 'o=x' },
	{ input: '  ---  ---  --x', value: 'o=x' },

	// File types
	{ input: '-rw-------', error: 'Cannot convert "-rw-------" to symbolic' },
	{ input: 'drw-------', error: 'Cannot convert "drw-------" to symbolic' },
	{ input: 'lr--------', error: 'Cannot convert "lr--------" to symbolic' },
	{ input: 'pr--------', error: 'Cannot convert "pr--------" to symbolic' },
	{ input: 'sr--------', error: 'Cannot convert "sr--------" to symbolic' },
	{ input: 'cr--------', error: 'Cannot convert "cr--------" to symbolic' },
	{ input: 'br--------', error: 'Cannot convert "br--------" to symbolic' },
	{ input: 'Dr--------', error: 'Cannot convert "Dr--------" to symbolic' },

	// Changing order
	{ input: 'rxwrwxrwx', value: 'u=rwx,g=rwx,o=rwx' },

	{ input: 'rwxr-xr-x', value: 'u=rwx,g=rx,o=rx' },
	// }}}

	// {{{ Symbolic
	// Invalid
	{ input: '', error: 'Cannot convert "" to symbolic' },
	{ input: '   ', error: 'Cannot convert "   " to symbolic' },
	{ input: 'abc', error: 'Cannot convert "abc" to symbolic' },
	{ input: 'z+x', error: 'Cannot convert "z+x" to symbolic' },
	{ input: 'a~x', error: 'Cannot convert "a~x" to symbolic' },
	{ input: 'a+j', error: 'Cannot convert "a+j" to symbolic' },
	{ input: 'a+xx', error: 'Cannot convert "a+xx" to symbolic' },

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
	// }}}
];

for(const { input, error, value } of tests) {
	it(`toSymbolic - ${testname(input)}`, () => {
		const result = fse.mode.toSymbolic(input);
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
