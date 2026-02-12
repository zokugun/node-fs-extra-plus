import { inspect, isDeepStrictEqual } from 'node:util';
import { isArray } from '@zokugun/is-it-type';
import { expect, it } from 'vitest';
import { type MasterMode } from '../../src/mode/master-mode.js';
import { toMaster } from '../../src/mode/to-master.js';
import { testname } from './utils/testname.js';

const tests = [
	// {{{ Number
	// Invalid
	{ input: Number.NaN, error: 'Cannot convert NaN to number' },
	{ input: Number.POSITIVE_INFINITY, value: [false, false, false, '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', null] },
	{ input: Number.EPSILON, value: [false, false, false, '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', null] },
	{ input: Number.MAX_SAFE_INTEGER, value: [false, true, false, '=', true, '=', true, '=', 's', '=', true, '=', true, '=', 's', '=', true, '=', true, '=', 's', null] },
	{ input: Number.MAX_VALUE, value: [false, false, false, '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', null] },
	{ input: -1, error: 'Cannot convert -1 to number' },
	{ input: 0.5, value: [false, false, false, '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', null] },
	{ input: 0o20_0000, value: [false, false, false, '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', null] },

	// Each permission
	{ input: 0o1, value: [false, false, false, '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', '=', false, '=', false, '=', 'x', null] },
	{ input: 0o2, value: [false, false, false, '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', '=', false, '=', true, '=', '-', null] },
	{ input: 0o4, value: [false, false, false, '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', '=', true, '=', false, '=', '-', null] },
	{ input: 0o10, value: [false, false, false, '=', false, '=', false, '=', '-', '=', false, '=', false, '=', 'x', '=', false, '=', false, '=', '-', null] },
	{ input: 0o20, value: [false, false, false, '=', false, '=', false, '=', '-', '=', false, '=', true, '=', '-', '=', false, '=', false, '=', '-', null] },
	{ input: 0o40, value: [false, false, false, '=', false, '=', false, '=', '-', '=', true, '=', false, '=', '-', '=', false, '=', false, '=', '-', null] },
	{ input: 0o100, value: [false, false, false, '=', false, '=', false, '=', 'x', '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', null] },
	{ input: 0o200, value: [false, false, false, '=', false, '=', true, '=', '-', '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', null] },
	{ input: 0o400, value: [false, false, false, '=', true, '=', false, '=', '-', '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', null] },
	{ input: 0o1000, value: [false, true, false, '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', '=', false, '=', false, '-', 's', null] },
	{ input: 0o2000, value: [false, true, false, '=', false, '=', false, '=', '-', '=', false, '=', false, '-', 's', '=', false, '=', false, '=', '-', null] },
	{ input: 0o4000, value: [false, true, false, '=', false, '=', false, '-', 's', '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', null] },

	// Extremes
	{ input: 0o0, value: [false, false, false, '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', null] },
	{ input: 0o7777, value: [false, true, false, '=', true, '=', true, '=', 's', '=', true, '=', true, '=', 's', '=', true, '=', true, '=', 's', null] },

	// Combining
	{ input: 0o3, value: [false, false, false, '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', '=', false, '=', true, '=', 'x', null] },

	// `stat` bits
	{ input: 0o1_0000, value: [false, true, true, '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', 'p'] },
	{ input: 0o17_7777, value: [false, true, false, '=', true, '=', true, '=', 's', '=', true, '=', true, '=', 's', '=', true, '=', true, '=', 's', null] },

	{ input: 0o755, value: [false, false, false, '=', true, '=', true, '=', 'x', '=', true, '=', false, '=', 'x', '=', true, '=', false, '=', 'x', null] },
	{ input: 0o4_0755, value: [false, true, true, '=', true, '=', true, '=', 'x', '=', true, '=', false, '=', 'x', '=', true, '=', false, '=', 'x', 'd'] },
	// }}}

	// {{{ Object
	// Invalid
	{ input: undefined, error: 'Cannot convert undefined to internal mode' },
	{ input: null, error: 'Cannot convert null to internal mode' },
	{ input: false, error: 'Cannot convert false to internal mode' },
	{ input: [], error: 'Cannot convert [] to internal mode' },
	{ input: { user: null }, error: 'Cannot convert { user: null } to internal mode' },
	{ input: { user: [] }, error: 'Cannot convert { user: [] } to internal mode' },
	{ input: { users: {} }, error: 'Cannot convert { users: {} } to internal mode' },
	{ input: { user: { readd: true } }, error: 'Cannot convert { user: { readd: true } } to internal mode' },
	{ input: { user: { setuid: true } }, error: 'Cannot convert { user: { setuid: true } } to internal mode' },
	{ input: { user: { setgid: true } }, error: 'Cannot convert { user: { setgid: true } } to internal mode' },
	{ input: { user: { sticky: true } }, error: 'Cannot convert { user: { sticky: true } } to internal mode' },
	{ input: { special: { read: true } }, error: 'Cannot convert { special: { read: true } } to internal mode' },
	{ input: { special: { write: true } }, error: 'Cannot convert { special: { write: true } } to internal mode' },
	{ input: { special: { execute: true } }, error: 'Cannot convert { special: { execute: true } } to internal mode' },
	{ input: { others: { read: null } }, error: 'Cannot convert { others: { read: null } } to internal mode' },
	{ input: { others: { read: {} } }, error: 'Cannot convert { others: { read: {} } } to internal mode' },

	// Each permission
	{ input: { others: { execute: true } }, value: [true, false, false, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, '+', 'x', null] },
	{ input: { others: { write: true } }, value: [true, false, false, null, null, null, null, null, null, null, null, null, null, null, null, null, null, '+', true, null, null, null] },
	{ input: { others: { read: true } }, value: [true, false, false, null, null, null, null, null, null, null, null, null, null, null, null, '+', true, null, null, null, null, null] },
	{ input: { group: { execute: true } }, value: [true, false, false, null, null, null, null, null, null, null, null, null, null, '+', 'x', null, null, null, null, null, null, null] },
	{ input: { group: { write: true } }, value: [true, false, false, null, null, null, null, null, null, null, null, '+', true, null, null, null, null, null, null, null, null, null] },
	{ input: { group: { read: true } }, value: [true, false, false, null, null, null, null, null, null, '+', true, null, null, null, null, null, null, null, null, null, null, null] },
	{ input: { user: { execute: true } }, value: [true, false, false, null, null, null, null, '+', 'x', null, null, null, null, null, null, null, null, null, null, null, null, null] },
	{ input: { user: { write: true } }, value: [true, false, false, null, null, '+', true, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null] },
	{ input: { user: { read: true } }, value: [true, false, false, '+', true, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null] },

	// Extremes
	{ input: {
		special: { setuid: true, setgid: true, sticky: true },
		user: { read: true, write: true, execute: true },
		group: { read: true, write: true, execute: true },
		others: { read: true, write: true, execute: true },
	}, value: [false, true, false, '=', true, '=', true, '=', 's', '=', true, '=', true, '=', 's', '=', true, '=', true, '=', 's', null] },

	// Combining
	{ input: { user: { read: true, write: true } }, value: [true, false, false, '+', true, '+', true, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null] },
	{ input: { user: { read: true, write: false } }, value: [true, false, false, '+', true, '-', true, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null] },

	// Operators
	{ input: { others: { read: false } }, value: [true, false, false, null, null, null, null, null, null, null, null, null, null, null, null, '-', true, null, null, null, null, null] },
	{ input: { others: { read: undefined } }, value: [true, false, false, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null] },

	// Special permissions
	{ input: { special: { sticky: true } }, value: [true, true, false, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, '+', 's', null] },
	{ input: { special: { setgid: true } }, value: [true, true, false, null, null, null, null, null, null, null, null, null, null, '+', 's', null, null, null, null, null, null, null] },
	{ input: { special: { setuid: true } }, value: [true, true, false, null, null, null, null, '+', 's', null, null, null, null, null, null, null, null, null, null, null, null, null] },

	// `all` category
	{ input: { all: { read: true } }, value: [true, false, false, '+', true, null, null, null, null, '+', true, null, null, null, null, '+', true, null, null, null, null, null] },
	{ input: { user: { read: false }, all: { read: true } }, value: [true, false, false, '-', true, null, null, null, null, '+', true, null, null, null, null, '+', true, null, null, null, null, null] },
	{ input: { all: { read: true }, special: { setuid: true } }, value: [true, true, false, '+', true, null, null, '+', 's', '+', true, null, null, null, null, '+', true, null, null, null, null, null] },
	{ input: { all: { read: true, write: false, execute: false } }, value: [false, false, false, '=', true, '=', false, '=', '-', '=', true, '=', false, '=', '-', '=', true, '=', false, '=', '-', null] },
	// }}}

	// {{{ Octal
	{ input: 'NaN', error: 'Cannot convert "NaN" to internal mode' },
	{ input: '0.5', error: 'Cannot convert "0.5" to internal mode' },
	{ input: '10000', error: 'Cannot convert "10000" to internal mode' },
	{ input: '8', error: 'Cannot convert "8" to internal mode' },
	{ input: '~1', error: 'Cannot convert "~1" to internal mode' },

	// Each permission
	{ input: '1', value: [false, false, false, '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', '=', false, '=', false, '=', 'x', null] },
	{ input: '2', value: [false, false, false, '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', '=', false, '=', true, '=', '-', null] },
	{ input: '4', value: [false, false, false, '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', '=', true, '=', false, '=', '-', null] },
	{ input: '10', value: [false, false, false, '=', false, '=', false, '=', '-', '=', false, '=', false, '=', 'x', '=', false, '=', false, '=', '-', null] },
	{ input: '20', value: [false, false, false, '=', false, '=', false, '=', '-', '=', false, '=', true, '=', '-', '=', false, '=', false, '=', '-', null] },
	{ input: '40', value: [false, false, false, '=', false, '=', false, '=', '-', '=', true, '=', false, '=', '-', '=', false, '=', false, '=', '-', null] },
	{ input: '100', value: [false, false, false, '=', false, '=', false, '=', 'x', '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', null] },
	{ input: '200', value: [false, false, false, '=', false, '=', true, '=', '-', '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', null] },
	{ input: '400', value: [false, false, false, '=', true, '=', false, '=', '-', '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', null] },
	{ input: '1000', value: [false, true, false, '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', '=', false, '=', false, '-', 's', null] },
	{ input: '2000', value: [false, true, false, '=', false, '=', false, '=', '-', '=', false, '=', false, '-', 's', '=', false, '=', false, '=', '-', null] },
	{ input: '4000', value: [false, true, false, '=', false, '=', false, '-', 's', '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', null] },

	// Extremes
	{ input: '0', value: [false, false, false, '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', null] },
	{ input: '7777', value: [false, true, false, '=', true, '=', true, '=', 's', '=', true, '=', true, '=', 's', '=', true, '=', true, '=', 's', null] },

	// Combining
	{ input: '11', value: [false, false, false, '=', false, '=', false, '=', '-', '=', false, '=', false, '=', 'x', '=', false, '=', false, '=', 'x', null] },

	// Operators
	{ input: '=11', value: [false, false, false, '=', false, '=', false, '=', '-', '=', false, '=', false, '=', 'x', '=', false, '=', false, '=', 'x', null] },
	{ input: '+0', value: [true, false, false, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null] },
	{ input: '+11', value: [true, false, false, null, null, null, null, null, null, null, null, null, null, '+', 'x', null, null, null, null, '+', 'x', null] },
	{ input: '-0', value: [true, false, false, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null] },
	{ input: '-11', value: [true, false, false, null, null, null, null, null, null, null, null, null, null, '-', 'x', null, null, null, null, '-', 'x', null] },
	{ input: '-011', value: [true, false, false, null, null, null, null, null, null, null, null, null, null, '-', 'x', null, null, null, null, '-', 'x', null] },
	{ input: '-0o11', value: [true, false, false, null, null, null, null, null, null, null, null, null, null, '-', 'x', null, null, null, null, '-', 'x', null] },

	// Whitespace
	{ input: ' 111 ', value: [false, false, false, '=', false, '=', false, '=', 'x', '=', false, '=', false, '=', 'x', '=', false, '=', false, '=', 'x', null] },

	// Prefixes
	{ input: '0111', value: [false, false, false, '=', false, '=', false, '=', 'x', '=', false, '=', false, '=', 'x', '=', false, '=', false, '=', 'x', null] },
	{ input: '0o111', value: [false, false, false, '=', false, '=', false, '=', 'x', '=', false, '=', false, '=', 'x', '=', false, '=', false, '=', 'x', null] },
	{ input: '\\111', value: [false, false, false, '=', false, '=', false, '=', 'x', '=', false, '=', false, '=', 'x', '=', false, '=', false, '=', 'x', null] },
	{ input: '\\0111', value: [false, false, false, '=', false, '=', false, '=', 'x', '=', false, '=', false, '=', 'x', '=', false, '=', false, '=', 'x', null] },

	{ input: '0755', value: [false, false, false, '=', true, '=', true, '=', 'x', '=', true, '=', false, '=', 'x', '=', true, '=', false, '=', 'x', null] },
	// }}}

	// {{{ Stat
	// Invalid
	{ input: 'rwwrwxrwx', error: 'Cannot convert "rwwrwxrwx" to internal mode' },
	{ input: '--------j', error: 'Cannot convert "--------j" to internal mode' },
	{ input: '--------+', error: 'Cannot convert "--------+" to internal mode' },
	{ input: 'Br--------', error: 'Cannot convert "Br--------" to internal mode' },
	{ input: '--------s', error: 'Cannot convert "--------s" to internal mode' },
	{ input: '--------S', error: 'Cannot convert "--------S" to internal mode' },
	{ input: '-----t---', error: 'Cannot convert "-----t---" to internal mode' },
	{ input: '-----T---', error: 'Cannot convert "-----T---" to internal mode' },
	{ input: '--t------', error: 'Cannot convert "--t------" to internal mode' },
	{ input: '--T------', error: 'Cannot convert "--T------" to internal mode' },
	{ input: '--------', error: 'Cannot convert "--------" to internal mode' },
	{ input: '-- ---- ---', error: 'Cannot convert "-- ---- ---" to internal mode' },
	{ input: '-----------', error: 'Cannot convert "-----------" to internal mode' },

	// Each permission
	{ input: '--------x', value: [false, false, false, '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', '=', false, '=', false, '=', 'x', null] },
	{ input: '-------w-', value: [false, false, false, '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', '=', false, '=', true, '=', '-', null] },
	{ input: '------r--', value: [false, false, false, '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', '=', true, '=', false, '=', '-', null] },
	{ input: '-----x---', value: [false, false, false, '=', false, '=', false, '=', '-', '=', false, '=', false, '=', 'x', '=', false, '=', false, '=', '-', null] },
	{ input: '----w----', value: [false, false, false, '=', false, '=', false, '=', '-', '=', false, '=', true, '=', '-', '=', false, '=', false, '=', '-', null] },
	{ input: '---r-----', value: [false, false, false, '=', false, '=', false, '=', '-', '=', true, '=', false, '=', '-', '=', false, '=', false, '=', '-', null] },
	{ input: '--x------', value: [false, false, false, '=', false, '=', false, '=', 'x', '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', null] },
	{ input: '-w-------', value: [false, false, false, '=', false, '=', true, '=', '-', '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', null] },
	{ input: 'r--------', value: [false, false, false, '=', true, '=', false, '=', '-', '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', null] },

	// Extremes
	{ input: '---------', value: [false, false, false, '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', null] },
	{ input: 'rwxrwxrwx', value: [false, false, false, '=', true, '=', true, '=', 'x', '=', true, '=', true, '=', 'x', '=', true, '=', true, '=', 'x', null] },

	// Combining
	{ input: '-------wx', value: [false, false, false, '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', '=', false, '=', true, '=', 'x', null] },

	// Special permissions
	{ input: '--------X', value: [false, false, false, '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', '=', false, '=', false, '=', 'X', null] },
	{ input: '-----X---', value: [false, false, false, '=', false, '=', false, '=', '-', '=', false, '=', false, '=', 'X', '=', false, '=', false, '=', '-', null] },
	{ input: '--X------', value: [false, false, false, '=', false, '=', false, '=', 'X', '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', null] },
	{ input: '--------T', value: [false, true, false, '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', '=', false, '=', false, '-', 's', null] },
	{ input: '--------t', value: [false, true, false, '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', '=', false, '=', false, '=', 's', null] },
	{ input: '-----s---', value: [false, true, false, '=', false, '=', false, '=', '-', '=', false, '=', false, '=', 's', '=', false, '=', false, '=', '-', null] },
	{ input: '-----S---', value: [false, true, false, '=', false, '=', false, '=', '-', '=', false, '=', false, '-', 's', '=', false, '=', false, '=', '-', null] },
	{ input: '--s------', value: [false, true, false, '=', false, '=', false, '=', 's', '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', null] },
	{ input: '--S------', value: [false, true, false, '=', false, '=', false, '-', 's', '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', null] },

	// Whitespace
	{ input: ' --------x ', value: [false, false, false, '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', '=', false, '=', false, '=', 'x', null] },
	{ input: '--------x', value: [false, false, false, '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', '=', false, '=', false, '=', 'x', null] },

	// File types
	{ input: 'drw-------', value: [false, false, true, '=', true, '=', true, '=', '-', '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', 'd'] },
	{ input: 'lr--------', value: [false, false, true, '=', true, '=', false, '=', '-', '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', 'l'] },
	{ input: 'pr--------', value: [false, false, true, '=', true, '=', false, '=', '-', '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', 'p'] },
	{ input: 'sr--------', value: [false, false, true, '=', true, '=', false, '=', '-', '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', 's'] },
	{ input: 'cr--------', value: [false, false, true, '=', true, '=', false, '=', '-', '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', 'c'] },
	{ input: 'br--------', value: [false, false, true, '=', true, '=', false, '=', '-', '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', 'b'] },
	{ input: 'Dr--------', value: [false, false, true, '=', true, '=', false, '=', '-', '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', 'D'] },
	{ input: '-r--------', value: [false, false, true, '=', true, '=', false, '=', '-', '=', false, '=', false, '=', '-', '=', false, '=', false, '=', '-', 'r'] },

	// Changing order
	{ input: 'rxwrwxrwx', value: [false, false, false, '=', true, '=', true, '=', 'x', '=', true, '=', true, '=', 'x', '=', true, '=', true, '=', 'x', null] },

	{ input: 'rwxr-xr-x', value: [false, false, false, '=', true, '=', true, '=', 'x', '=', true, '=', false, '=', 'x', '=', true, '=', false, '=', 'x', null] },
	// }}}

	// {{{ Symbolic
	// Invalid
	{ input: '', error: 'Cannot convert "" to internal mode' },
	{ input: ' ', error: 'Cannot convert " " to internal mode' },
	{ input: 'abc', error: 'Cannot convert "abc" to internal mode' },
	{ input: 'z+x', error: 'Cannot convert "z+x" to internal mode' },
	{ input: 'a~x', error: 'Cannot convert "a~x" to internal mode' },
	{ input: 'a+j', error: 'Cannot convert "a+j" to internal mode' },
	{ input: 'a+xx', error: 'Cannot convert "a+xx" to internal mode' },

	// Each permission
	{ input: 'o+x', value: [true, false, false, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, '+', 'x', null] },
	{ input: 'o+w', value: [true, false, false, null, null, null, null, null, null, null, null, null, null, null, null, null, null, '+', true, null, null, null] },
	{ input: 'o+r', value: [true, false, false, null, null, null, null, null, null, null, null, null, null, null, null, '+', true, null, null, null, null, null] },
	{ input: 'g+x', value: [true, false, false, null, null, null, null, null, null, null, null, null, null, '+', 'x', null, null, null, null, null, null, null] },
	{ input: 'g+w', value: [true, false, false, null, null, null, null, null, null, null, null, '+', true, null, null, null, null, null, null, null, null, null] },
	{ input: 'g+r', value: [true, false, false, null, null, null, null, null, null, '+', true, null, null, null, null, null, null, null, null, null, null, null] },
	{ input: 'u+x', value: [true, false, false, null, null, null, null, '+', 'x', null, null, null, null, null, null, null, null, null, null, null, null, null] },
	{ input: 'u+w', value: [true, false, false, null, null, '+', true, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null] },
	{ input: 'u+r', value: [true, false, false, '+', true, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null] },

	// Extremes
	{ input: 'a+', value: [true, false, false, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null] },
	{ input: 'a-', value: [true, false, false, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null] },
	{ input: 'a=', value: [true, false, false, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null] },
	{ input: 'a=rwx', value: [false, false, false, '=', true, '=', true, '=', 'x', '=', true, '=', true, '=', 'x', '=', true, '=', true, '=', 'x', null] },

	// No category
	{ input: '+', value: [true, false, false, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null] },
	{ input: '-', value: [true, false, false, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null] },
	{ input: '=', value: [true, false, false, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null] },
	{ input: '+x', value: [true, false, false, null, null, null, null, '+', 'x', null, null, null, null, '+', 'x', null, null, null, null, '+', 'x', null] },
	{ input: '-x', value: [true, false, false, null, null, null, null, '-', 'x', null, null, null, null, '-', 'x', null, null, null, null, '-', 'x', null] },
	{ input: '=x', value: [false, false, false, '=', false, '=', false, '=', 'x', '=', false, '=', false, '=', 'x', '=', false, '=', false, '=', 'x', null] },

	// Combining
	{ input: 'a=rw', value: [false, false, false, '=', true, '=', true, '=', '-', '=', true, '=', true, '=', '-', '=', true, '=', true, '=', '-', null] },

	// Operators
	{ input: 'a-x', value: [true, false, false, null, null, null, null, '-', 'x', null, null, null, null, '-', 'x', null, null, null, null, '-', 'x', null] },
	{ input: 'a=x', value: [false, false, false, '=', false, '=', false, '=', 'x', '=', false, '=', false, '=', 'x', '=', false, '=', false, '=', 'x', null] },

	// Special permissions
	{ input: 'o+t', value: [true, false, false, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, '+', 's', null] },
	{ input: 'g+s', value: [true, false, false, null, null, null, null, null, null, null, null, null, null, '+', 's', null, null, null, null, null, null, null] },
	{ input: 'u+s', value: [true, false, false, null, null, null, null, '+', 's', null, null, null, null, null, null, null, null, null, null, null, null, null] },
	{ input: 'o+s', value: [true, false, false, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null] },
	{ input: 'g+t', value: [true, false, false, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null] },
	{ input: 'u+t', value: [true, false, false, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null] },
	{ input: 'a+ts', value: [true, false, false, null, null, null, null, '+', 's', null, null, null, null, '+', 's', null, null, null, null, '+', 's', null] },
	{ input: 'a+X', value: [true, false, false, null, null, null, null, '+', 'X', null, null, null, null, '+', 'X', null, null, null, null, '+', 'X', null] },

	// Whitespace
	{ input: ' a+x ', value: [true, false, false, null, null, null, null, '+', 'x', null, null, null, null, '+', 'x', null, null, null, null, '+', 'x', null] },
	{ input: 'u+x , u+r', value: [true, false, false, '+', true, null, null, '+', 'x', null, null, null, null, null, null, null, null, null, null, null, null, null] },

	// `all` category
	{ input: 'a+x', value: [true, false, false, null, null, null, null, '+', 'x', null, null, null, null, '+', 'x', null, null, null, null, '+', 'x', null] },
	{ input: 'a+w', value: [true, false, false, null, null, '+', true, null, null, null, null, '+', true, null, null, null, null, '+', true, null, null, null] },
	{ input: 'a+r', value: [true, false, false, '+', true, null, null, null, null, '+', true, null, null, null, null, '+', true, null, null, null, null, null] },

	// Grouping categories
	{ input: 'go=x', value: [false, false, false, '=', false, '=', false, '=', '-', '=', false, '=', false, '=', 'x', '=', false, '=', false, '=', 'x', null] },
	{ input: 'gog=x', value: [false, false, false, '=', false, '=', false, '=', '-', '=', false, '=', false, '=', 'x', '=', false, '=', false, '=', 'x', null] },
	{ input: 'ag=x', value: [false, false, false, '=', false, '=', false, '=', 'x', '=', false, '=', false, '=', 'x', '=', false, '=', false, '=', 'x', null] },
	{ input: 'g=x,o=x', value: [false, false, false, '=', false, '=', false, '=', '-', '=', false, '=', false, '=', 'x', '=', false, '=', false, '=', 'x', null] },

	// Combining plus and minus
	{ input: 'o+x,o-x', value: [true, false, false, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, '-', 'x', null] },
	{ input: 'o-x,o+x', value: [true, false, false, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, '+', 'x', null] },
	{ input: 'o+x,o+x', value: [true, false, false, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, '+', 'x', null] },
	{ input: 'o-x,o-x', value: [true, false, false, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, '-', 'x', null] },
	{ input: 'o=x,o-x', value: [true, false, false, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, '-', 'x', null] },
	{ input: 'o=x,o+x', value: [true, false, false, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, '+', 'x', null] },
	{ input: 'a+x,o-x', value: [true, false, false, null, null, null, null, '+', 'x', null, null, null, null, '+', 'x', null, null, null, null, '-', 'x', null] },

	// Combining different categories and permissions
	{ input: 'o+x,g-x', value: [true, false, false, null, null, null, null, null, null, null, null, null, null, '-', 'x', null, null, null, null, '+', 'x', null] },
	{ input: 'o+x,o-r', value: [true, false, false, null, null, null, null, null, null, null, null, null, null, null, null, '-', true, null, null, '+', 'x', null] },

	{ input: 'u+rwx,g+rx,o+rx', value: [true, false, false, '+', true, '+', true, '+', 'x', '+', true, null, null, '+', 'x', '+', true, null, null, '+', 'x', null] },
	// }}}
];

for(const { input, error, value } of tests) {
	it(`toMaster - ${testname(input)}`, () => {
		const result = toMaster(input);
		if(error) {
			expect(result.fails).to.be.true;
			expect(result.error).to.equals(error);
		}
		else {
			expect(result.fails).to.be.false;

			const expected = mk(...((isArray(value) ? value : []) as Parameters<typeof mk>));
			if(!isDeepStrictEqual(result.value, expected)) {
				const { updating, special, typed, fileType } = result.value!;
				const output: Array<boolean | string | null> = [updating, special, typed];

				for(const target of ['user', 'group', 'others']) {
					for(const operator of ['read', 'write', 'execute']) {
						output.push((result.value?.[target]?.[operator]?.operator ?? null) as boolean | string | null, (result.value?.[target]?.[operator]?.operand ?? null) as boolean | string | null);
					}
				}

				output.push((fileType ?? null) as string | null);

				console.log(inspect(output, { depth: null, compact: true, breakLength: Infinity }));
			}

			expect(result.value).to.eql(expected);
		}
	});
}

// eslint-disable-next-line max-params
function mk(
	updating: boolean,
	special: boolean,
	typed: boolean,
	userReadOperator: '+' | '-' | '=' | null,
	userReadOperand: boolean | null,
	userWriteOperator: '+' | '-' | '=' | null,
	userWriteOperand: boolean | null,
	userExecuteOperator: '+' | '-' | '=' | null,
	userExecuteOperand: '-' | 's' | 'x' | 'X' | null,
	groupReadOperator: '+' | '-' | '=' | null,
	groupReadOperand: boolean | null,
	groupWriteOperator: '+' | '-' | '=' | null,
	groupWriteOperand: boolean | null,
	groupExecuteOperator: '+' | '-' | '=' | null,
	groupExecuteOperand: '-' | 's' | 'x' | 'X' | null,
	othersReadOperator: '+' | '-' | '=' | null,
	othersReadOperand: boolean | null,
	othersWriteOperator: '+' | '-' | '=' | null,
	othersWriteOperand: boolean | null,
	othersExecuteOperator: '+' | '-' | '=' | null,
	othersExecuteOperand: '-' | 's' | 'x' | 'X' | null,
	fileType: 'd' | 'l' | 'p' | 's' | 'c' | 'b' | 'D' | null,
): MasterMode { // {{{
	const result: MasterMode = {
		updating,
		special,
		typed,
	};

	if(userReadOperator) {
		result.user ??= {};
		result.user.read = { operator: userReadOperator, operand: userReadOperand! };
	}

	if(userWriteOperator) {
		result.user ??= {};
		result.user.write = { operator: userWriteOperator, operand: userWriteOperand! };
	}

	if(userExecuteOperator) {
		result.user ??= {};
		result.user.execute = { operator: userExecuteOperator, operand: userExecuteOperand! };
	}

	if(groupReadOperator) {
		result.group ??= {};
		result.group.read = { operator: groupReadOperator, operand: groupReadOperand! };
	}

	if(groupWriteOperator) {
		result.group ??= {};
		result.group.write = { operator: groupWriteOperator, operand: groupWriteOperand! };
	}

	if(groupExecuteOperator) {
		result.group ??= {};
		result.group.execute = { operator: groupExecuteOperator, operand: groupExecuteOperand! };
	}

	if(othersReadOperator) {
		result.others ??= {};
		result.others.read = { operator: othersReadOperator, operand: othersReadOperand! };
	}

	if(othersWriteOperator) {
		result.others ??= {};
		result.others.write = { operator: othersWriteOperator, operand: othersWriteOperand! };
	}

	if(othersExecuteOperator) {
		result.others ??= {};
		result.others.execute = { operator: othersExecuteOperator, operand: othersExecuteOperand! };
	}

	if(fileType) {
		result.fileType = fileType;
	}

	return result;
} // }}}
