import { inspect, isDeepStrictEqual } from 'node:util';
import { isArray, isBoolean } from '@zokugun/is-it-type';
import { expect, it } from 'vitest';
import fse from '../../src/index.js';
import { type ObjectMode } from '../../src/mode/types.js';
import { testname } from './utils/testname.js';

const tests = [
	// {{{ Number
	// Invalid
	{ input: Number.NaN, error: 'Cannot convert NaN to object' },
	{ input: Number.POSITIVE_INFINITY, value: [false, false, false, false, false, false, false, false, false, null, null, null] },
	{ input: Number.EPSILON, value: [false, false, false, false, false, false, false, false, false, null, null, null] },
	{ input: Number.MAX_SAFE_INTEGER, value: [true, true, true, true, true, true, true, true, true, true, true, true] },
	{ input: Number.MAX_VALUE, value: [false, false, false, false, false, false, false, false, false, null, null, null] },
	{ input: -1, error: 'Cannot convert -1 to object' },
	{ input: 0.5, value: [false, false, false, false, false, false, false, false, false, null, null, null] },
	{ input: 0o20_0000, value: [false, false, false, false, false, false, false, false, false, null, null, null] },

	// Each permission
	{ input: 0o1, value: [false, false, false, false, false, false, false, false, true, null, null, null] },
	{ input: 0o2, value: [false, false, false, false, false, false, false, true, false, null, null, null] },
	{ input: 0o4, value: [false, false, false, false, false, false, true, false, false, null, null, null] },
	{ input: 0o10, value: [false, false, false, false, false, true, false, false, false, null, null, null] },
	{ input: 0o20, value: [false, false, false, false, true, false, false, false, false, null, null, null] },
	{ input: 0o40, value: [false, false, false, true, false, false, false, false, false, null, null, null] },
	{ input: 0o100, value: [false, false, true, false, false, false, false, false, false, null, null, null] },
	{ input: 0o200, value: [false, true, false, false, false, false, false, false, false, null, null, null] },
	{ input: 0o400, value: [true, false, false, false, false, false, false, false, false, null, null, null] },
	{ input: 0o1000, value: [false, false, false, false, false, false, false, false, false, null, null, true] },
	{ input: 0o2000, value: [false, false, false, false, false, false, false, false, false, null, true, null] },
	{ input: 0o4000, value: [false, false, false, false, false, false, false, false, false, true, null, null] },

	// Extremes
	{ input: 0o0, value: [false, false, false, false, false, false, false, false, false, null, null, null] },
	{ input: 0o7777, value: [true, true, true, true, true, true, true, true, true, true, true, true] },

	// Combining
	{ input: 0o3, value: [false, false, false, false, false, false, false, true, true, null, null, null] },

	// `stat` bits
	{ input: 0o1_0000, error: 'Cannot convert 0o10000 to object' },
	{ input: 0o17_7777, value: [true, true, true, true, true, true, true, true, true, true, true, true] },

	{ input: 0o755, value: [true, true, true, true, false, true, true, false, true, null, null, null] },
	{ input: 0o4_0755, error: 'Cannot convert 0o40755 to object' },
	// }}}

	// {{{ Object
	// Invalid
	{ input: undefined, error: 'Cannot convert undefined to object' },
	{ input: null, error: 'Cannot convert null to object' },
	{ input: false, error: 'Cannot convert false to object' },
	{ input: [], error: 'Cannot convert [] to object' },
	{ input: { user: null }, error: 'Cannot convert { user: null } to object' },
	{ input: { user: [] }, error: 'Cannot convert { user: [] } to object' },
	{ input: { users: {} }, error: 'Cannot convert { users: {} } to object' },
	{ input: { user: { readd: true } }, error: 'Cannot convert { user: { readd: true } } to object' },
	{ input: { user: { setuid: true } }, error: 'Cannot convert { user: { setuid: true } } to object' },
	{ input: { user: { setgid: true } }, error: 'Cannot convert { user: { setgid: true } } to object' },
	{ input: { user: { sticky: true } }, error: 'Cannot convert { user: { sticky: true } } to object' },
	{ input: { special: { read: true } }, error: 'Cannot convert { special: { read: true } } to object' },
	{ input: { special: { write: true } }, error: 'Cannot convert { special: { write: true } } to object' },
	{ input: { special: { execute: true } }, error: 'Cannot convert { special: { execute: true } } to object' },
	{ input: { others: { read: null } }, error: 'Cannot convert { others: { read: null } } to object' },
	{ input: { others: { read: {} } }, error: 'Cannot convert { others: { read: {} } } to object' },

	// Each permission
	{ input: { others: { execute: true } }, value: [null, null, null, null, null, null, null, null, true, null, null, null] },
	{ input: { others: { write: true } }, value: [null, null, null, null, null, null, null, true, null, null, null, null] },
	{ input: { others: { read: true } }, value: [null, null, null, null, null, null, true, null, null, null, null, null] },
	{ input: { group: { execute: true } }, value: [null, null, null, null, null, true, null, null, null, null, null, null] },
	{ input: { group: { write: true } }, value: [null, null, null, null, true, null, null, null, null, null, null, null] },
	{ input: { group: { read: true } }, value: [null, null, null, true, null, null, null, null, null, null, null, null] },
	{ input: { user: { execute: true } }, value: [null, null, true, null, null, null, null, null, null, null, null, null] },
	{ input: { user: { write: true } }, value: [null, true, null, null, null, null, null, null, null, null, null, null] },
	{ input: { user: { read: true } }, value: [true, null, null, null, null, null, null, null, null, null, null, null] },

	// Extremes
	{ input: {
		special: { setuid: true, setgid: true, sticky: true },
		user: { read: true, write: true, execute: true },
		group: { read: true, write: true, execute: true },
		others: { read: true, write: true, execute: true },
	}, value: [true, true, true, true, true, true, true, true, true, true, true, true] },

	// Combining
	{ input: { user: { read: true, write: true } }, value: [true, true, null, null, null, null, null, null, null, null, null, null] },
	{ input: { user: { read: true, write: false } }, value: [true, false, null, null, null, null, null, null, null, null, null, null] },

	// Operators
	{ input: { others: { read: false } }, value: [null, null, null, null, null, null, false, null, null, null, null, null] },
	{ input: { others: { read: undefined } }, value: [null, null, null, null, null, null, null, null, null, null, null, null] },

	// Special permissions
	{ input: { special: { sticky: true } }, value: [null, null, null, null, null, null, null, null, null, null, null, true] },
	{ input: { special: { setgid: true } }, value: [null, null, null, null, null, null, null, null, null, null, true, null] },
	{ input: { special: { setuid: true } }, value: [null, null, null, null, null, null, null, null, null, true, null, null] },

	// `all` category
	{ input: { all: { read: true } }, value: [true, null, null, true, null, null, true, null, null, null, null, null] },
	{ input: { user: { read: false }, all: { read: true } }, value: [false, null, null, true, null, null, true, null, null, null, null, null] },
	{ input: { all: { read: true }, special: { setuid: true } }, value: [true, null, null, true, null, null, true, null, null, true, null, null] },
	{ input: { all: { read: true, write: false, execute: false } }, value: [true, false, false, true, false, false, true, false, false, null, null, null] },
	// }}}

	// {{{ Octal
	// Invalid
	{ input: 'NaN', error: 'Cannot convert "NaN" to object' },
	{ input: '0.5', error: 'Cannot convert "0.5" to object' },
	{ input: '10000', error: 'Cannot convert "10000" to object' },
	{ input: '8', error: 'Cannot convert "8" to object' },
	{ input: '~1', error: 'Cannot convert "~1" to object' },

	// Each permission
	{ input: '1', value: [false, false, false, false, false, false, false, false, true, null, null, null] },
	{ input: '2', value: [false, false, false, false, false, false, false, true, false, null, null, null] },
	{ input: '4', value: [false, false, false, false, false, false, true, false, false, null, null, null] },
	{ input: '10', value: [false, false, false, false, false, true, false, false, false, null, null, null] },
	{ input: '20', value: [false, false, false, false, true, false, false, false, false, null, null, null] },
	{ input: '40', value: [false, false, false, true, false, false, false, false, false, null, null, null] },
	{ input: '100', value: [false, false, true, false, false, false, false, false, false, null, null, null] },
	{ input: '200', value: [false, true, false, false, false, false, false, false, false, null, null, null] },
	{ input: '400', value: [true, false, false, false, false, false, false, false, false, null, null, null] },
	{ input: '1000', value: [false, false, false, false, false, false, false, false, false, null, null, true] },
	{ input: '2000', value: [false, false, false, false, false, false, false, false, false, null, true, null] },
	{ input: '4000', value: [false, false, false, false, false, false, false, false, false, true, null, null] },

	// Extremes
	{ input: '0', value: [false, false, false, false, false, false, false, false, false, null, null, null] },
	{ input: '7777', value: [true, true, true, true, true, true, true, true, true, true, true, true] },

	// Combining
	{ input: '11', value: [false, false, false, false, false, true, false, false, true, null, null, null] },

	// Operators
	{ input: '=11', value: [false, false, false, false, false, true, false, false, true, null, null, null] },
	{ input: '+0', value: [] },
	{ input: '+11', value: [null, null, null, null, null, true, null, null, true, null, null, null] },
	{ input: '-0', value: [] },
	{ input: '-11', value: [null, null, null, null, null, false, null, null, false, null, null, null] },
	{ input: '-011', value: [null, null, null, null, null, false, null, null, false, null, null, null] },
	{ input: '-0o11', value: [null, null, null, null, null, false, null, null, false, null, null, null] },

	// Whitespace
	{ input: ' 111 ', value: [false, false, true, false, false, true, false, false, true, null, null, null] },

	// Prefixes
	{ input: '0111', value: [false, false, true, false, false, true, false, false, true, null, null, null] },
	{ input: '0o111', value: [false, false, true, false, false, true, false, false, true, null, null, null] },
	{ input: '\\111', value: [false, false, true, false, false, true, false, false, true, null, null, null] },
	{ input: '\\0111', value: [false, false, true, false, false, true, false, false, true, null, null, null] },

	{ input: '0755', value: [true, true, true, true, false, true, true, false, true, null, null, null] },
	// }}}

	// {{{ Stat
	// Invalid
	{ input: 'rwwrwxrwx', error: 'Cannot convert "rwwrwxrwx" to object' },
	{ input: '--------j', error: 'Cannot convert "--------j" to object' },
	{ input: '--------+', error: 'Cannot convert "--------+" to object' },
	{ input: 'Br--------', error: 'Cannot convert "Br--------" to object' },
	{ input: '--------s', error: 'Cannot convert "--------s" to object' },
	{ input: '--------S', error: 'Cannot convert "--------S" to object' },
	{ input: '-----t---', error: 'Cannot convert "-----t---" to object' },
	{ input: '-----T---', error: 'Cannot convert "-----T---" to object' },
	{ input: '--t------', error: 'Cannot convert "--t------" to object' },
	{ input: '--T------', error: 'Cannot convert "--T------" to object' },
	{ input: '--------', error: 'Cannot convert "--------" to object' },
	{ input: '-- ---- ---', error: 'Cannot convert "-- ---- ---" to object' },
	{ input: '-----------', error: 'Cannot convert "-----------" to object' },

	// Each permission
	{ input: '--------x', value: [false, false, false, false, false, false, false, false, true, null, null, null] },
	{ input: '-------w-', value: [false, false, false, false, false, false, false, true, false, null, null, null] },
	{ input: '------r--', value: [false, false, false, false, false, false, true, false, false, null, null, null] },
	{ input: '-----x---', value: [false, false, false, false, false, true, false, false, false, null, null, null] },
	{ input: '----w----', value: [false, false, false, false, true, false, false, false, false, null, null, null] },
	{ input: '---r-----', value: [false, false, false, true, false, false, false, false, false, null, null, null] },
	{ input: '--x------', value: [false, false, true, false, false, false, false, false, false, null, null, null] },
	{ input: '-w-------', value: [false, true, false, false, false, false, false, false, false, null, null, null] },
	{ input: 'r--------', value: [true, false, false, false, false, false, false, false, false, null, null, null] },

	// Extremes
	{ input: '---------', value: [false, false, false, false, false, false, false, false, false, null, null, null] },
	{ input: 'rwxrwxrwx', value: [true, true, true, true, true, true, true, true, true, null, null, null] },

	// Combining
	{ input: '-------wx', value: [false, false, false, false, false, false, false, true, true, null, null, null] },

	// Special permissions
	{ input: '--------X', error: 'Cannot convert "--------X" to object' },
	{ input: '-----X---', error: 'Cannot convert "-----X---" to object' },
	{ input: '--X------', error: 'Cannot convert "--X------" to object' },
	{ input: '--------T', value: [false, false, false, false, false, false, false, false, false, null, null, true] },
	{ input: '--------t', value: [false, false, false, false, false, false, false, false, true, null, null, true] },
	{ input: '-----s---', value: [false, false, false, false, false, true, false, false, false, null, true, null] },
	{ input: '-----S---', value: [false, false, false, false, false, false, false, false, false, null, true, null] },
	{ input: '--s------', value: [false, false, true, false, false, false, false, false, false, true, null, null] },
	{ input: '--S------', value: [false, false, false, false, false, false, false, false, false, true, null, null] },

	// Whitespace
	{ input: ' --------x ', value: [false, false, false, false, false, false, false, false, true, null, null, null] },
	{ input: '  ---  ---  --x', value: [false, false, false, false, false, false, false, false, true, null, null, null] },

	// File types
	{ input: '-rw-------', error: 'Cannot convert "-rw-------" to object' },
	{ input: 'drw-------', error: 'Cannot convert "drw-------" to object' },
	{ input: 'lr--------', error: 'Cannot convert "lr--------" to object' },
	{ input: 'pr--------', error: 'Cannot convert "pr--------" to object' },
	{ input: 'sr--------', error: 'Cannot convert "sr--------" to object' },
	{ input: 'cr--------', error: 'Cannot convert "cr--------" to object' },
	{ input: 'br--------', error: 'Cannot convert "br--------" to object' },
	{ input: 'Dr--------', error: 'Cannot convert "Dr--------" to object' },

	// Changing order
	{ input: 'rxwrwxrwx', value: [true, true, true, true, true, true, true, true, true, null, null, null] },

	{ input: 'rwxr-xr-x', value: [true, true, true, true, false, true, true, false, true, null, null, null] },
	// }}}

	// {{{ Symbolic
	// Invalid
	{ input: '', error: 'Cannot convert "" to object' },
	{ input: '   ', error: 'Cannot convert "   " to object' },
	{ input: 'abc', error: 'Cannot convert "abc" to object' },
	{ input: 'z+x', error: 'Cannot convert "z+x" to object' },
	{ input: 'a~x', error: 'Cannot convert "a~x" to object' },
	{ input: 'a+j', error: 'Cannot convert "a+j" to object' },
	{ input: 'a+xx', error: 'Cannot convert "a+xx" to object' },

	// Each permission
	{ input: 'o+x', value: [null, null, null, null, null, null, null, null, true, null, null, null] },
	{ input: 'o+w', value: [null, null, null, null, null, null, null, true, null, null, null, null] },
	{ input: 'o+r', value: [null, null, null, null, null, null, true, null, null, null, null, null] },
	{ input: 'g+x', value: [null, null, null, null, null, true, null, null, null, null, null, null] },
	{ input: 'g+w', value: [null, null, null, null, true, null, null, null, null, null, null, null] },
	{ input: 'g+r', value: [null, null, null, true, null, null, null, null, null, null, null, null] },
	{ input: 'u+x', value: [null, null, true, null, null, null, null, null, null, null, null, null] },
	{ input: 'u+w', value: [null, true, null, null, null, null, null, null, null, null, null, null] },
	{ input: 'u+r', value: [true, null, null, null, null, null, null, null, null, null, null, null] },

	// Extremes
	{ input: 'a+', value: [] },
	{ input: 'a-', value: [] },
	{ input: 'a=', value: [] },
	{ input: 'a=rwx', value: [true, true, true, true, true, true, true, true, true, null, null, null] },

	// No category
	{ input: '+', value: [] },
	{ input: '-', value: [] },
	{ input: '=', value: [] },
	{ input: '+x', value: [null, null, true, null, null, true, null, null, true, null, null, null] },
	{ input: '-x', value: [null, null, false, null, null, false, null, null, false, null, null, null] },
	{ input: '=x', value: [false, false, true, false, false, true, false, false, true, null, null, null] },

	// Combining
	{ input: 'a=rw', value: [true, true, false, true, true, false, true, true, false, null, null, null] },

	// Operators
	{ input: 'a-x', value: [null, null, false, null, null, false, null, null, false, null, null, null] },
	{ input: 'a=x', value: [false, false, true, false, false, true, false, false, true, null, null, null] },

	// Special permissions
	{ input: 'o+t', value: [null, null, null, null, null, null, null, null, true, null, null, true] },
	{ input: 'g+s', value: [null, null, null, null, null, true, null, null, null, null, true, null] },
	{ input: 'u+s', value: [null, null, true, null, null, null, null, null, null, true, null, null] },
	{ input: 'o+s', value: [] },
	{ input: 'g+t', value: [] },
	{ input: 'u+t', value: [] },
	{ input: 'a+ts', value: [null, null, true, null, null, true, null, null, true, true, true, true] },
	{ input: 'a+X', error: 'Cannot convert "a+X" to object' },

	// Whitespace
	{ input: ' a+x ', value: [null, null, true, null, null, true, null, null, true, null, null, null] },
	{ input: 'u+x , u+r', value: [true, null, true, null, null, null, null, null, null, null, null, null] },

	// `all` category
	{ input: 'a+x', value: [null, null, true, null, null, true, null, null, true, null, null, null] },
	{ input: 'a+w', value: [null, true, null, null, true, null, null, true, null, null, null, null] },
	{ input: 'a+r', value: [true, null, null, true, null, null, true, null, null, null, null, null] },

	// Grouping categories
	{ input: 'go=x', value: [false, false, false, false, false, true, false, false, true, null, null, null] },
	{ input: 'gog=x', value: [false, false, false, false, false, true, false, false, true, null, null, null] },
	{ input: 'ag=x', value: [false, false, true, false, false, true, false, false, true, null, null, null] },
	{ input: 'g=x,o=x', value: [false, false, false, false, false, true, false, false, true, null, null, null] },

	// Combining plus and minus
	{ input: 'o+x,o-x', value: [null, null, null, null, null, null, null, null, false, null, null, null] },
	{ input: 'o-x,o+x', value: [null, null, null, null, null, null, null, null, true, null, null, null] },
	{ input: 'o+x,o+x', value: [null, null, null, null, null, null, null, null, true, null, null, null] },
	{ input: 'o-x,o-x', value: [null, null, null, null, null, null, null, null, false, null, null, null] },
	{ input: 'o=x,o-x', value: [null, null, null, null, null, null, null, null, false, null, null, null] },
	{ input: 'o=x,o+x', value: [null, null, null, null, null, null, null, null, true, null, null, null] },
	{ input: 'a+x,o-x', value: [null, null, true, null, null, true, null, null, false, null, null, null] },

	// Combining different categories and permissions
	{ input: 'o+x,g-x', value: [null, null, null, null, null, false, null, null, true, null, null, null] },
	{ input: 'o+x,o-r', value: [null, null, null, null, null, null, false, null, true, null, null, null] },

	{ input: 'u+rwx,g+rx,o+rx', value: [true, true, true, true, null, true, true, null, true, null, null, null] },
	// }}}
];

for(const { input, error, value } of tests) {
	it(`toObject - ${testname(input)}`, () => {
		const result = fse.mode.toObject(input);
		if(error) {
			expect(result.fails).to.be.true;
			expect(result.error).to.equals(error);
		}
		else {
			expect(result.fails).to.be.false;

			const expected = mk(...((isArray(value) ? value : []) as Parameters<typeof mk>));
			if(!isDeepStrictEqual(result.value, expected)) {
				const output: Array<boolean | null> = [];

				for(const target of ['user', 'group', 'others']) {
					for(const operator of ['read', 'write', 'execute']) {
						output.push((result.value?.[target]?.[operator] as boolean ?? null) as boolean | null);
					}
				}

				output.push(result.value?.special?.setuid ?? null, result.value?.special?.setgid ?? null, result.value?.special?.sticky ?? null);

				console.log(inspect(output, { depth: null, compact: true, breakLength: Infinity }));
			}

			expect(result.value).to.eql(expected);
		}
	});
}

function mk(
	userRead: boolean | null,
	userWrite: boolean | null,
	userExecute: boolean | null,
	groupRead: boolean | null,
	groupWrite: boolean | null,
	groupExecute: boolean | null,
	othersRead: boolean | null,
	othersWrite: boolean | null,
	othersExecute: boolean | null,
	specialSetuid: boolean | null,
	specialSetgid: boolean | null,
	specialSticky: boolean | null,
): ObjectMode { // {{{
	const result: ObjectMode = {};

	if(isBoolean(userRead)) {
		result.user ??= {};
		result.user.read = userRead;
	}

	if(isBoolean(userWrite)) {
		result.user ??= {};
		result.user.write = userWrite;
	}

	if(isBoolean(userExecute)) {
		result.user ??= {};
		result.user.execute = userExecute;
	}

	if(isBoolean(groupRead)) {
		result.group ??= {};
		result.group.read = groupRead;
	}

	if(isBoolean(groupWrite)) {
		result.group ??= {};
		result.group.write = groupWrite;
	}

	if(isBoolean(groupExecute)) {
		result.group ??= {};
		result.group.execute = groupExecute;
	}

	if(isBoolean(othersRead)) {
		result.others ??= {};
		result.others.read = othersRead;
	}

	if(isBoolean(othersWrite)) {
		result.others ??= {};
		result.others.write = othersWrite;
	}

	if(isBoolean(othersExecute)) {
		result.others ??= {};
		result.others.execute = othersExecute;
	}

	if(isBoolean(specialSetuid)) {
		result.special ??= {};
		result.special.setuid = specialSetuid;
	}

	if(isBoolean(specialSetgid)) {
		result.special ??= {};
		result.special.setgid = specialSetgid;
	}

	if(isBoolean(specialSticky)) {
		result.special ??= {};
		result.special.sticky = specialSticky;
	}

	return result;
} // }}}
