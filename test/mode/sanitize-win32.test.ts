import process from 'node:process';
import { afterAll, beforeAll, expect, it, type MockInstance, vi } from 'vitest';
import fse from '../../src/index.js';
import { testname } from './utils/testname.js';

const tests = [
	// {{{ Number
	// Invalid
	{ input: Number.NaN, error: 'Cannot sanitize: NaN' },
	{ input: Number.POSITIVE_INFINITY, value: 0o444 },
	{ input: Number.EPSILON, value: 0o444 },
	{ input: Number.MAX_SAFE_INTEGER, value: 0o666 },
	{ input: Number.MAX_VALUE, value: 0o444 },
	{ input: -1, error: 'Cannot sanitize: -1' },
	{ input: 0.5, value: 0o444 },
	{ input: 0o20_0000, value: 0o444 },

	// Each permission
	{ input: 0o1, value: 0o444 },
	{ input: 0o2, value: 0o666 },
	{ input: 0o4, value: 0o444 },
	{ input: 0o10, value: 0o444 },
	{ input: 0o20, value: 0o666 },
	{ input: 0o40, value: 0o444 },
	{ input: 0o100, value: 0o444 },
	{ input: 0o200, value: 0o666 },
	{ input: 0o400, value: 0o444 },
	{ input: 0o1000, value: 0o444 },
	{ input: 0o2000, value: 0o444 },
	{ input: 0o4000, value: 0o444 },

	// Extremes
	{ input: 0o0, value: 0o444 },
	{ input: 0o7777, value: 0o666 },

	// Combining
	{ input: 0o3, value: 0o666 },

	// `stat` bits
	{ input: 0o1_0000, value: 0o444 },
	{ input: 0o17_7777, value: 0o666 },

	{ input: 0o755, value: 0o666 },
	{ input: 0o4_0755, value: 0o666 },
	// }}}

	// {{{ Object
	// Invalid
	{ input: undefined, error: 'Cannot sanitize: undefined' },
	{ input: null, error: 'Cannot sanitize: null' },
	{ input: false, error: 'Cannot sanitize: false' },
	{ input: [], error: 'Cannot sanitize: []' },
	{ input: { user: null }, error: 'Cannot sanitize: { user: null }' },
	{ input: { user: [] }, error: 'Cannot sanitize: { user: [] }' },
	{ input: { users: {} }, error: 'Cannot sanitize: { users: {} }' },
	{ input: { user: { readd: true } }, error: 'Cannot sanitize: { user: { readd: true } }' },
	{ input: { user: { setuid: true } }, error: 'Cannot sanitize: { user: { setuid: true } }' },
	{ input: { user: { setgid: true } }, error: 'Cannot sanitize: { user: { setgid: true } }' },
	{ input: { user: { sticky: true } }, error: 'Cannot sanitize: { user: { sticky: true } }' },
	{ input: { special: { read: true } }, error: 'Cannot sanitize: { special: { read: true } }' },
	{ input: { special: { write: true } }, error: 'Cannot sanitize: { special: { write: true } }' },
	{ input: { special: { execute: true } }, error: 'Cannot sanitize: { special: { execute: true } }' },
	{ input: { others: { read: null } }, error: 'Cannot sanitize: { others: { read: null } }' },
	{ input: { others: { read: {} } }, error: 'Cannot sanitize: { others: { read: {} } }' },

	// Each permission
	{ input: { others: { execute: true } }, value: {} },
	{ input: { others: { write: true } }, value: { user: { read: true, write: true }, group: { read: true, write: true }, others: { read: true, write: true } } },
	{ input: { others: { read: true } }, value: { user: { read: true }, group: { read: true }, others: { read: true } } },
	{ input: { group: { execute: true } }, value: {} },
	{ input: { group: { write: true } }, value: { user: { read: true, write: true }, group: { read: true, write: true }, others: { read: true, write: true } } },
	{ input: { group: { read: true } }, value: { user: { read: true }, group: { read: true }, others: { read: true } } },
	{ input: { user: { execute: true } }, value: {} },
	{ input: { user: { write: true } }, value: { user: { read: true, write: true }, group: { read: true, write: true }, others: { read: true, write: true } } },
	{ input: { user: { read: true } }, value: { user: { read: true }, group: { read: true }, others: { read: true } } },

	// Extremes
	{ input: {
		special: { setuid: true, setgid: true, sticky: true },
		user: { read: true, write: true, execute: true },
		group: { read: true, write: true, execute: true },
		others: { read: true, write: true, execute: true },
	}, value: {
		user: { read: true, write: true, execute: false },
		group: { read: true, write: true, execute: false },
		others: { read: true, write: true, execute: false },
	} },

	// Combining
	{ input: { user: { read: true, write: true } }, value: { user: { read: true, write: true }, group: { read: true, write: true }, others: { read: true, write: true } } },
	{ input: { user: { read: true, write: false } }, value: { user: { read: true, write: false }, group: { read: true, write: false }, others: { read: true, write: false } } },

	// Operators
	{ input: { others: { read: false } }, value: {} },
	{ input: { others: { read: undefined } }, value: {} },
	{ input: { others: { write: false } }, value: { user: { write: false }, group: { write: false }, others: { write: false } } },

	// Special permissions
	{ input: { special: { sticky: true } }, value: {} },
	{ input: { special: { setgid: true } }, value: {} },
	{ input: { special: { setuid: true } }, value: {} },

	// `all` category
	{ input: { all: { read: true } }, value: { user: { read: true }, group: { read: true }, others: { read: true } } },
	{ input: { user: { read: false }, all: { read: true } }, value: { user: { read: true }, group: { read: true }, others: { read: true } } },
	{ input: { all: { read: true }, special: { setuid: true } }, value: { user: { read: true }, group: { read: true }, others: { read: true } } },
	// }}}

	// {{{ Octal
	{ input: 'NaN', error: 'Cannot sanitize: "NaN"' },
	{ input: '0.5', error: 'Cannot sanitize: "0.5"' },
	{ input: '10000', error: 'Cannot sanitize: "10000"' },
	{ input: '8', error: 'Cannot sanitize: "8"' },
	{ input: '~1', error: 'Cannot sanitize: "~1"' },

	// Each permission
	{ input: '1', value: '=0o0444' },
	{ input: '2', value: '=0o0666' },
	{ input: '4', value: '=0o0444' },
	{ input: '10', value: '=0o0444' },
	{ input: '20', value: '=0o0666' },
	{ input: '40', value: '=0o0444' },
	{ input: '100', value: '=0o0444' },
	{ input: '200', value: '=0o0666' },
	{ input: '400', value: '=0o0444' },
	{ input: '1000', value: '=0o0444' },
	{ input: '2000', value: '=0o0444' },
	{ input: '4000', value: '=0o0444' },

	// Extremes
	{ input: '0', value: '=0o0444' },
	{ input: '7777', value: '=0o0666' },

	// Combining
	{ input: '11', value: '=0o0444' },

	// Operators
	{ input: '=11', value: '=0o0444' },
	{ input: '+0', value: '+0o0000' },
	{ input: '+11', value: '+0o0000' },
	{ input: '-0', value: '+0o0000' },
	{ input: '-11', value: '+0o0000' },
	{ input: '-011', value: '+0o0000' },
	{ input: '-0o11', value: '+0o0000' },
	{ input: '+44', value: '+0o0444' },
	{ input: '-44', value: '+0o0000' },
	{ input: '+22', value: '+0o0666' },
	{ input: '-22', value: '-0o0222' },

	// Whitespace
	{ input: ' 111 ', value: '=0o0444' },

	// Prefixes
	{ input: '0111', value: '=0o0444' },
	{ input: '0o111', value: '=0o0444' },
	{ input: '\\111', value: '=0o0444' },
	{ input: '\\0111', value: '=0o0444' },

	{ input: '0755', value: '=0o0666' },
	// }}}

	// {{{ Stat
	// Invalid
	{ input: 'rwwrwxrwx', error: 'Cannot sanitize: "rwwrwxrwx"' },
	{ input: '--------j', error: 'Cannot sanitize: "--------j"' },
	{ input: '--------+', error: 'Cannot sanitize: "--------+"' },
	{ input: 'Br--------', error: 'Cannot sanitize: "Br--------"' },
	{ input: '--------s', error: 'Cannot sanitize: "--------s"' },
	{ input: '--------S', error: 'Cannot sanitize: "--------S"' },
	{ input: '-----t---', error: 'Cannot sanitize: "-----t---"' },
	{ input: '-----T---', error: 'Cannot sanitize: "-----T---"' },
	{ input: '--t------', error: 'Cannot sanitize: "--t------"' },
	{ input: '--T------', error: 'Cannot sanitize: "--T------"' },
	{ input: '--------', error: 'Cannot sanitize: "--------"' },
	{ input: '-- ---- ---', error: 'Cannot sanitize: "-- ---- ---"' },
	{ input: '-----------', error: 'Cannot sanitize: "-----------"' },

	// Each permission
	{ input: '--------x', value: 'r--r--r--' },
	{ input: '-------w-', value: 'rw-rw-rw-' },
	{ input: '------r--', value: 'r--r--r--' },
	{ input: '-----x---', value: 'r--r--r--' },
	{ input: '----w----', value: 'rw-rw-rw-' },
	{ input: '---r-----', value: 'r--r--r--' },
	{ input: '--x------', value: 'r--r--r--' },
	{ input: '-w-------', value: 'rw-rw-rw-' },
	{ input: 'r--------', value: 'r--r--r--' },

	// Extremes
	{ input: '---------', value: 'r--r--r--' },
	{ input: 'rwxrwxrwx', value: 'rw-rw-rw-' },

	// Combining
	{ input: '-------wx', value: 'rw-rw-rw-' },

	// Special permissions
	{ input: '--------X', value: 'r--r--r--' },
	{ input: '-----X---', value: 'r--r--r--' },
	{ input: '--X------', value: 'r--r--r--' },
	{ input: '--------T', value: 'r--r--r--' },
	{ input: '--------t', value: 'r--r--r--' },
	{ input: '-----s---', value: 'r--r--r--' },
	{ input: '-----S---', value: 'r--r--r--' },
	{ input: '--s------', value: 'r--r--r--' },
	{ input: '--S------', value: 'r--r--r--' },

	// Whitespace
	{ input: ' --------x ', value: 'r--r--r--' },
	{ input: '  ---  ---  --x', value: 'r--r--r--' },

	// File types
	{ input: 'drw-------', value: 'drw-rw-rw-' },
	{ input: 'lr--------', value: 'lr--r--r--' },
	{ input: 'pr--------', value: 'pr--r--r--' },
	{ input: 'sr--------', value: 'sr--r--r--' },
	{ input: 'cr--------', value: 'cr--r--r--' },
	{ input: 'br--------', value: 'br--r--r--' },
	{ input: 'Dr--------', value: 'Dr--r--r--' },

	// Changing order
	{ input: 'rxwrwxrwx', value: 'rw-rw-rw-' },

	{ input: 'rwxr-xr-x', value: 'rw-rw-rw-' },
	// }}}

	// {{{ Symbolic
	// Invalid
	{ input: '', error: 'Cannot sanitize: ""' },
	{ input: '   ', error: 'Cannot sanitize: "   "' },
	{ input: 'abc', error: 'Cannot sanitize: "abc"' },
	{ input: 'z+x', error: 'Cannot sanitize: "z+x"' },
	{ input: 'a~x', error: 'Cannot sanitize: "a~x"' },
	{ input: 'a+j', error: 'Cannot sanitize: "a+j"' },
	{ input: 'a+xx', error: 'Cannot sanitize: "a+xx"' },

	// Each permission
	{ input: 'o+x', value: '' },
	{ input: 'o+w', value: 'u+rw,g+rw,o+rw' },
	{ input: 'o+r', value: 'u+r,g+r,o+r' },
	{ input: 'g+x', value: '' },
	{ input: 'g+w', value: 'u+rw,g+rw,o+rw' },
	{ input: 'g+r', value: 'u+r,g+r,o+r' },
	{ input: 'u+x', value: '' },
	{ input: 'u+w', value: 'u+rw,g+rw,o+rw' },
	{ input: 'u+r', value: 'u+r,g+r,o+r' },

	// Extremes
	{ input: 'a+', value: '' },
	{ input: 'a-', value: '' },
	{ input: 'a=', value: '' },
	{ input: 'a=rwx', value: 'u=rw,g=rw,o=rw' },

	// No category
	{ input: '+', value: '' },
	{ input: '-', value: '' },
	{ input: '=', value: '' },
	{ input: '+x', value: '' },
	{ input: '-x', value: '' },
	{ input: '=x', value: 'u=r,g=r,o=r' },
	{ input: '+r', value: 'u+r,g+r,o+r' },
	{ input: '-r', value: '' },
	{ input: '=r', value: 'u=r,g=r,o=r' },
	{ input: '+w', value: 'u+rw,g+rw,o+rw' },
	{ input: '-w', value: 'u-w,g-w,o-w' },
	{ input: '=w', value: 'u=rw,g=rw,o=rw' },

	// Combining
	{ input: 'a=rw', value: 'u=rw,g=rw,o=rw' },

	// Operators
	{ input: 'a-x', value: '' },
	{ input: 'a=x', value: 'u=r,g=r,o=r' },

	// Special permissions
	{ input: 'o+t', value: '' },
	{ input: 'g+s', value: '' },
	{ input: 'u+s', value: '' },
	{ input: 'o+s', value: '' },
	{ input: 'g+t', value: '' },
	{ input: 'u+t', value: '' },
	{ input: 'a+ts', value: '' },
	{ input: 'a+X', value: '' },

	// Whitespace
	{ input: ' a+x ', value: '' },
	{ input: 'u+x , u+r', value: 'u+r,g+r,o+r' },

	// `all` category
	{ input: 'a+x', value: '' },
	{ input: 'a+w', value: 'u+rw,g+rw,o+rw' },
	{ input: 'a+r', value: 'u+r,g+r,o+r' },

	// Grouping categories
	{ input: 'go=x', value: 'u=r,g=r,o=r' },
	{ input: 'gog=x', value: 'u=r,g=r,o=r' },
	{ input: 'ag=x', value: 'u=r,g=r,o=r' },
	{ input: 'g=x,o=x', value: 'u=r,g=r,o=r' },

	// Combining plus and minus
	{ input: 'o+x,o-x', value: '' },
	{ input: 'o-x,o+x', value: '' },
	{ input: 'o+x,o+x', value: '' },
	{ input: 'o-x,o-x', value: '' },
	{ input: 'o=x,o-x', value: '' },
	{ input: 'o=x,o+x', value: '' },
	{ input: 'a+x,o-x', value: '' },

	// Combining different categories and permissions
	{ input: 'o+x,g-x', value: '' },
	{ input: 'o+x,o-r', value: '' },

	{ input: 'u+rwx,g+rx,o+rx', value: 'u+rw,g+rw,o+rw' },
	// }}}
];

let mockPlatform: MockInstance | undefined;

beforeAll(() => {
	mockPlatform = vi.spyOn(process, 'platform', 'get').mockReturnValue('win32');
});

afterAll(() => {
	mockPlatform?.mockRestore();
});

for(const { input, error, value } of tests) {
	it(`sanitize - win32 - ${testname(input)}`, () => {
		const result = fse.mode.sanitize(input);
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
