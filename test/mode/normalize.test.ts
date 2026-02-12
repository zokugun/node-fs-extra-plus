import { expect, it } from 'vitest';
import fse from '../../src/index.js';
import { testname } from './utils/testname.js';

const tests = [
	// {{{ Number
	// Invalid
	{ input: Number.NaN, error: 'Cannot normalize number: NaN' },
	{ input: Number.POSITIVE_INFINITY, value: 0o0 },
	{ input: Number.EPSILON, value: 0o0 },
	{ input: Number.MAX_SAFE_INTEGER, value: 0o17_7777 },
	{ input: Number.MAX_VALUE, value: 0o0 },
	{ input: -1, error: 'Cannot normalize number: -1' },
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
	{ input: undefined, error: 'Cannot normalize: undefined' },
	{ input: null, error: 'Cannot normalize: null' },
	{ input: false, error: 'Cannot normalize: false' },
	{ input: [], error: 'Cannot normalize: []' },
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
	// }}}

	// {{{ Octal
	{ input: 'NaN', error: 'Cannot normalize: "NaN"' },
	{ input: '0.5', error: 'Cannot normalize: "0.5"' },
	{ input: '10000', error: 'Cannot normalize: "10000"' },
	{ input: '8', error: 'Cannot normalize: "8"' },
	{ input: '~1', error: 'Cannot normalize: "~1"' },

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
	{ input: 'rwwrwxrwx', error: 'Cannot normalize: "rwwrwxrwx"' },
	{ input: '--------j', error: 'Cannot normalize: "--------j"' },
	{ input: '--------+', error: 'Cannot normalize: "--------+"' },
	{ input: 'Br--------', error: 'Cannot normalize: "Br--------"' },
	{ input: '--------s', error: 'Cannot normalize: "--------s"' },
	{ input: '--------S', error: 'Cannot normalize: "--------S"' },
	{ input: '-----t---', error: 'Cannot normalize: "-----t---"' },
	{ input: '-----T---', error: 'Cannot normalize: "-----T---"' },
	{ input: '--t------', error: 'Cannot normalize: "--t------"' },
	{ input: '--T------', error: 'Cannot normalize: "--T------"' },
	{ input: '--------', error: 'Cannot normalize: "--------"' },
	{ input: '-- ---- ---', error: 'Cannot normalize: "-- ---- ---"' },
	{ input: '-----------', error: 'Cannot normalize: "-----------"' },

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
	{ input: '', error: 'Cannot normalize: ""' },
	{ input: '   ', error: 'Cannot normalize: "   "' },
	{ input: 'abc', error: 'Cannot normalize: "abc"' },
	{ input: 'z+x', error: 'Cannot normalize: "z+x"' },
	{ input: 'a~x', error: 'Cannot normalize: "a~x"' },
	{ input: 'a+j', error: 'Cannot normalize: "a+j"' },
	{ input: 'a+xx', error: 'Cannot normalize: "a+xx"' },

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
	it(`normalize - ${testname(input)}`, () => {
		const result = fse.mode.normalize(input);
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
