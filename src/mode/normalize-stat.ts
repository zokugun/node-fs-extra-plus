import { err, ok, type Result } from '@zokugun/xtry';
import { isStat } from './is-stat.js';
import { type StatMode } from './types.js';
import { normalizeError } from './utils/normalize-error.js';

const FILE_TYPE_CHARS = new Set(['-', 'b', 'c', 'd', 'l', 'p', 's', 'D']);

export function normalizeStat(value: unknown): Result<StatMode, string> {
	if(typeof value !== 'string') {
		return err(normalizeError(value, 'stat'));
	}

	const trimmed = value.trim();
	if(trimmed.length === 0) {
		return err(normalizeError(value, 'stat'));
	}

	if(!isStat(trimmed)) {
		return err(normalizeError(value, 'stat'));
	}

	const collapsed = trimmed.replaceAll(/\s+/g, '');
	if(collapsed.length === 10 && FILE_TYPE_CHARS.has(collapsed[0])) {
		const reordered = reorder(collapsed.slice(1, 9));

		return ok(`${collapsed[0]}${reordered}` as StatMode);
	}

	if(collapsed.length === 9) {
		const reordered = reorder(collapsed);

		return ok(reordered as StatMode);
	}

	return err(normalizeError(value, 'stat'));
}

function reorder(value: string): string {
	return reorderTriplet(value.slice(0, 3)) + reorderTriplet(value.slice(3, 6)) + reorderTriplet(value.slice(6, 9));
}

function reorderTriplet(value: string): string {
	const result = ['-', '-', '-'];

	for(const char of value.split('')) {
		if(char === 'r') {
			result[0] = 'r';
		}
		else if(char === 'w') {
			result[1] = 'w';
		}
		else if(char !== '-') {
			result[2] = char;
		}
	}

	return result.join('');
}
