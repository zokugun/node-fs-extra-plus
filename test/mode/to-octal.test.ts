import { expect, it } from 'vitest';
import fse from '../../src/index.js';
import { testname } from './utils/testname.js';

const tests = [
	// {{{ Number
	// Invalid
	{ input: Number.NaN, error: 'Cannot convert NaN to octal' },
	{ input: Number.POSITIVE_INFINITY, value: '=0o0000' },
	{ input: Number.EPSILON, value: '=0o0000' },
	{ input: Number.MAX_SAFE_INTEGER, value: '=0o7777' },
	{ input: Number.MAX_VALUE, value: '=0o0000' },
	{ input: -1, error: 'Cannot convert -1 to octal' },
	{ input: 0.5, value: '=0o0000' },
	{ input: 0o20_0000, value: '=0o0000' },

	// Each permission
	{ input: 0o1, value: '=0o0001' },
	{ input: 0o2, value: '=0o0002' },
	{ input: 0o4, value: '=0o0004' },
	{ input: 0o10, value: '=0o0010' },
	{ input: 0o20, value: '=0o0020' },
	{ input: 0o40, value: '=0o0040' },
	{ input: 0o100, value: '=0o0100' },
	{ input: 0o200, value: '=0o0200' },
	{ input: 0o400, value: '=0o0400' },
	{ input: 0o1000, value: '=0o1000' },
	{ input: 0o2000, value: '=0o2000' },
	{ input: 0o4000, value: '=0o4000' },

	// Extremes
	{ input: 0o0, value: '=0o0000' },
	{ input: 0o7777, value: '=0o7777' },

	// Combining
	{ input: 0o3, value: '=0o0003' },

	// `stat` bits
	{ input: 0o1_0000, error: 'Cannot convert 0o10000 to octal' },
	{ input: 0o17_7777, value: '=0o7777' },

	{ input: 0o755, value: '=0o0755' },
	{ input: 0o4_0755, error: 'Cannot convert 0o40755 to octal' },
	// }}}

	// {{{ Object
	// Invalid
	{ input: undefined, error: 'Cannot convert undefined to octal' },
	{ input: null, error: 'Cannot convert null to octal' },
	{ input: false, error: 'Cannot convert false to octal' },
	{ input: [], error: 'Cannot convert [] to octal' },
	{ input: { user: null }, error: 'Cannot convert { user: null } to octal' },
	{ input: { user: [] }, error: 'Cannot convert { user: [] } to octal' },
	{ input: { users: {} }, error: 'Cannot convert { users: {} } to octal' },
	{ input: { user: { readd: true } }, error: 'Cannot convert { user: { readd: true } } to octal' },
	{ input: { user: { setuid: true } }, error: 'Cannot convert { user: { setuid: true } } to octal' },
	{ input: { user: { setgid: true } }, error: 'Cannot convert { user: { setgid: true } } to octal' },
	{ input: { user: { sticky: true } }, error: 'Cannot convert { user: { sticky: true } } to octal' },
	{ input: { special: { read: true } }, error: 'Cannot convert { special: { read: true } } to octal' },
	{ input: { special: { write: true } }, error: 'Cannot convert { special: { write: true } } to octal' },
	{ input: { special: { execute: true } }, error: 'Cannot convert { special: { execute: true } } to octal' },
	{ input: { others: { read: null } }, error: 'Cannot convert { others: { read: null } } to octal' },
	{ input: { others: { read: {} } }, error: 'Cannot convert { others: { read: {} } } to octal' },

	// Each permission
	{ input: { others: { execute: true } }, value: '+0o0001' },
	{ input: { others: { write: true } }, value: '+0o0002' },
	{ input: { others: { read: true } }, value: '+0o0004' },
	{ input: { group: { execute: true } }, value: '+0o0010' },
	{ input: { group: { write: true } }, value: '+0o0020' },
	{ input: { group: { read: true } }, value: '+0o0040' },
	{ input: { user: { execute: true } }, value: '+0o0100' },
	{ input: { user: { write: true } }, value: '+0o0200' },
	{ input: { user: { read: true } }, value: '+0o0400' },

	// Extremes
	{ input: {
		special: { setuid: true, setgid: true, sticky: true },
		user: { read: true, write: true, execute: true },
		group: { read: true, write: true, execute: true },
		others: { read: true, write: true, execute: true },
	}, value: '=0o7777' },

	// Combining
	{ input: { user: { read: true, write: true } }, value: '+0o0600' },
	{ input: { user: { read: true, write: false } }, error: 'Cannot convert { user: { read: true, write: false } } to octal' },

	// Operators
	{ input: { others: { read: false } }, value: '-0o0004' },
	{ input: { others: { read: undefined } }, value: '+0o0000' },

	// Special permissions
	{ input: { special: { sticky: true } }, value: '+0o1001' },
	{ input: { special: { setgid: true } }, value: '+0o2010' },
	{ input: { special: { setuid: true } }, value: '+0o4100' },

	// `all` category
	{ input: { all: { read: true } }, value: '+0o0444' },
	{ input: { user: { read: false }, all: { read: true } }, error: 'Cannot convert { user: { read: false }, all: { read: true } } to octal' },
	{ input: { all: { read: true }, special: { setuid: true } }, value: '+0o4544' },
	{ input: { all: { read: true, write: false, execute: false } }, value: '=0o0444' },
	// }}}

	// {{{ Octal
	// Invalid
	{ input: 'NaN', error: 'Cannot convert "NaN" to octal' },
	{ input: '0.5', error: 'Cannot convert "0.5" to octal' },
	{ input: '10000', error: 'Cannot convert "10000" to octal' },
	{ input: '8', error: 'Cannot convert "8" to octal' },
	{ input: '~1', error: 'Cannot convert "~1" to octal' },

	// Each permission
	{ input: '1', value: '=0o0001' },
	{ input: '2', value: '=0o0002' },
	{ input: '4', value: '=0o0004' },
	{ input: '10', value: '=0o0010' },
	{ input: '20', value: '=0o0020' },
	{ input: '40', value: '=0o0040' },
	{ input: '100', value: '=0o0100' },
	{ input: '200', value: '=0o0200' },
	{ input: '400', value: '=0o0400' },
	{ input: '1000', value: '=0o1000' },
	{ input: '2000', value: '=0o2000' },
	{ input: '4000', value: '=0o4000' },

	// Extremes
	{ input: '0', value: '=0o0000' },
	{ input: '7777', value: '=0o7777' },

	// Combining
	{ input: '11', value: '=0o0011' },

	// Operators
	{ input: '=11', value: '=0o0011' },
	{ input: '+0', value: '+0o0000' },
	{ input: '+11', value: '+0o0011' },
	{ input: '-0', value: '-0o0000' },
	{ input: '-11', value: '-0o0011' },
	{ input: '-011', value: '-0o0011' },
	{ input: '-0o11', value: '-0o0011' },

	// Whitespace
	{ input: ' 111 ', value: '=0o0111' },

	// Prefixes
	{ input: '0111', value: '=0o0111' },
	{ input: '0o111', value: '=0o0111' },
	{ input: '\\111', value: '=0o0111' },
	{ input: '\\0111', value: '=0o0111' },

	{ input: '0755', value: '=0o0755' },
	// }}}

	// {{{ Stat
	// Invalid
	{ input: 'rwwrwxrwx', error: 'Cannot convert "rwwrwxrwx" to octal' },
	{ input: '--------j', error: 'Cannot convert "--------j" to octal' },
	{ input: '--------+', error: 'Cannot convert "--------+" to octal' },
	{ input: 'Br--------', error: 'Cannot convert "Br--------" to octal' },
	{ input: '--------s', error: 'Cannot convert "--------s" to octal' },
	{ input: '--------S', error: 'Cannot convert "--------S" to octal' },
	{ input: '-----t---', error: 'Cannot convert "-----t---" to octal' },
	{ input: '-----T---', error: 'Cannot convert "-----T---" to octal' },
	{ input: '--t------', error: 'Cannot convert "--t------" to octal' },
	{ input: '--T------', error: 'Cannot convert "--T------" to octal' },
	{ input: '--------', error: 'Cannot convert "--------" to octal' },
	{ input: '-- ---- ---', error: 'Cannot convert "-- ---- ---" to octal' },
	{ input: '-----------', error: 'Cannot convert "-----------" to octal' },

	// Each permission
	{ input: '--------x', value: '=0o0001' },
	{ input: '-------w-', value: '=0o0002' },
	{ input: '------r--', value: '=0o0004' },
	{ input: '-----x---', value: '=0o0010' },
	{ input: '----w----', value: '=0o0020' },
	{ input: '---r-----', value: '=0o0040' },
	{ input: '--x------', value: '=0o0100' },
	{ input: '-w-------', value: '=0o0200' },
	{ input: 'r--------', value: '=0o0400' },

	// Extremes
	{ input: '---------', value: '=0o0000' },
	{ input: 'rwxrwxrwx', value: '=0o0777' },

	// Combining
	{ input: '-------wx', value: '=0o0003' },

	// Special permissions
	{ input: '--------X', error: 'Cannot convert "--------X" to octal' },
	{ input: '-----X---', error: 'Cannot convert "-----X---" to octal' },
	{ input: '--X------', error: 'Cannot convert "--X------" to octal' },
	{ input: '--------T', value: '=0o1000' },
	{ input: '--------t', value: '=0o1001' },
	{ input: '-----s---', value: '=0o2010' },
	{ input: '-----S---', value: '=0o2000' },
	{ input: '--s------', value: '=0o4100' },
	{ input: '--S------', value: '=0o4000' },

	// Whitespace
	{ input: ' --------x ', value: '=0o0001' },
	{ input: '  ---  ---  --x', value: '=0o0001' },

	// File types
	{ input: '-rw-------', error: 'Cannot convert "-rw-------" to octal' },
	{ input: 'drw-------', error: 'Cannot convert "drw-------" to octal' },
	{ input: 'lr--------', error: 'Cannot convert "lr--------" to octal' },
	{ input: 'pr--------', error: 'Cannot convert "pr--------" to octal' },
	{ input: 'sr--------', error: 'Cannot convert "sr--------" to octal' },
	{ input: 'cr--------', error: 'Cannot convert "cr--------" to octal' },
	{ input: 'br--------', error: 'Cannot convert "br--------" to octal' },
	{ input: 'Dr--------', error: 'Cannot convert "Dr--------" to octal' },

	// Changing order
	{ input: 'rxwrwxrwx', value: '=0o0777' },

	{ input: 'rwxr-xr-x', value: '=0o0755' },
	// }}}

	// {{{ Symbolic
	// Invalid
	{ input: '', error: 'Cannot convert "" to octal' },
	{ input: '   ', error: 'Cannot convert "   " to octal' },
	{ input: 'abc', error: 'Cannot convert "abc" to octal' },
	{ input: 'z+x', error: 'Cannot convert "z+x" to octal' },
	{ input: 'a~x', error: 'Cannot convert "a~x" to octal' },
	{ input: 'a+j', error: 'Cannot convert "a+j" to octal' },
	{ input: 'a+xx', error: 'Cannot convert "a+xx" to octal' },

	// Each permission
	{ input: 'o+x', value: '+0o0001' },
	{ input: 'o+w', value: '+0o0002' },
	{ input: 'o+r', value: '+0o0004' },
	{ input: 'g+x', value: '+0o0010' },
	{ input: 'g+w', value: '+0o0020' },
	{ input: 'g+r', value: '+0o0040' },
	{ input: 'u+x', value: '+0o0100' },
	{ input: 'u+w', value: '+0o0200' },
	{ input: 'u+r', value: '+0o0400' },

	// Extremes
	{ input: 'a+', value: '+0o0000' },
	{ input: 'a-', value: '+0o0000' },
	{ input: 'a=', value: '+0o0000' },
	{ input: 'a=rwx', value: '=0o0777' },

	// No category
	{ input: '+', value: '+0o0000' },
	{ input: '-', value: '+0o0000' },
	{ input: '=', value: '+0o0000' },
	{ input: '+x', value: '+0o0111' },
	{ input: '-x', value: '-0o0111' },
	{ input: '=x', value: '=0o0111' },

	// Combining
	{ input: 'a=rw', value: '=0o0666' },

	// Operators
	{ input: 'a-x', value: '-0o0111' },
	{ input: 'a=x', value: '=0o0111' },

	// Special permissions
	{ input: 'o+t', value: '+0o1001' },
	{ input: 'g+s', value: '+0o2010' },
	{ input: 'u+s', value: '+0o4100' },
	{ input: 'o+s', value: '+0o0000' },
	{ input: 'g+t', value: '+0o0000' },
	{ input: 'u+t', value: '+0o0000' },
	{ input: 'a+ts', value: '+0o7111' },
	{ input: 'a+X', error: 'Cannot convert "a+X" to octal' },

	// Whitespace
	{ input: ' a+x ', value: '+0o0111' },
	{ input: 'u+x , u+r', value: '+0o0500' },

	// `all` category
	{ input: 'a+x', value: '+0o0111' },
	{ input: 'a+w', value: '+0o0222' },
	{ input: 'a+r', value: '+0o0444' },

	// Grouping categories
	{ input: 'go=x', value: '=0o0011' },
	{ input: 'gog=x', value: '=0o0011' },
	{ input: 'ag=x', value: '=0o0111' },
	{ input: 'g=x,o=x', value: '=0o0011' },

	// Combining plus and minus
	{ input: 'o+x,o-x', value: '-0o0001' },
	{ input: 'o-x,o+x', value: '+0o0001' },
	{ input: 'o+x,o+x', value: '+0o0001' },
	{ input: 'o-x,o-x', value: '-0o0001' },
	{ input: 'o=x,o-x', value: '-0o0001' },
	{ input: 'o=x,o+x', value: '+0o0001' },
	{ input: 'a+x,o-x', error: 'Cannot convert "a+x,o-x" to octal' },

	// Combining different categories and permissions
	{ input: 'o+x,g-x', error: 'Cannot convert "o+x,g-x" to octal' },
	{ input: 'o+x,o-r', error: 'Cannot convert "o+x,o-r" to octal' },

	{ input: 'u+rwx,g+rx,o+rx', value: '+0o0755' },
	// }}}
];

for(const { input, error, value } of tests) {
	it(`toOctal - ${testname(input)}`, () => {
		const result = fse.mode.toOctal(input);
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
