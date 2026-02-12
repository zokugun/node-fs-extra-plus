import { isString } from '@zokugun/is-it-type';
import { type StatMode } from './types.js';

const FILE_TYPE_CHARS = new Set(['-', 'b', 'c', 'd', 'l', 'p', 's', 'D']);

type TripletKind = 'user' | 'group' | 'others';

export function isStat(value: unknown): value is StatMode {
	if(!isString(value)) {
		return false;
	}

	const trimmed = value.trim();
	if(trimmed === '') {
		return false;
	}

	if(/\s/.test(trimmed)) {
		const segments = trimmed.split(/\s+/).filter(Boolean);
		if(segments.length === 0) {
			return false;
		}

		let startIndex = 0;
		if(segments[0].length === 1 && segments.length === 4) {
			startIndex = 1;
		}

		for(let i = startIndex; i < segments.length; i += 1) {
			if(segments[i].length !== 3) {
				return false;
			}
		}
	}

	let normalized = trimmed.replaceAll(/\s+/g, '');
	if(normalized.length === 10) {
		if(!FILE_TYPE_CHARS.has(normalized[0])) {
			return false;
		}

		normalized = normalized.slice(1);
	}
	else if(normalized.length !== 9) {
		return false;
	}

	for(let index = 0; index < normalized.length; index += 3) {
		const kind: TripletKind = index === 0 ? 'user' : (index === 3 ? 'group' : 'others');
		const triplet = normalized.slice(index, index + 3);
		if(!isTripletValid(triplet, kind)) {
			return false;
		}
	}

	return true;
}

function isTripletValid(triplet: string, kind: TripletKind): boolean {
	let readUsed = false;
	let writeUsed = false;
	let execUsed = false;

	for(const char of triplet) {
		if(char === '-') {
			continue;
		}

		if(char === 'r') {
			if(readUsed) {
				return false;
			}

			readUsed = true;
			continue;
		}

		if(char === 'w') {
			if(writeUsed) {
				return false;
			}

			writeUsed = true;
			continue;
		}

		if(isExecuteChar(char, kind)) {
			if(execUsed) {
				return false;
			}

			execUsed = true;
			continue;
		}

		return false;
	}

	return true;
}

function isExecuteChar(char: string, kind: TripletKind): boolean {
	if(char === 'x' || char === 'X') {
		return true;
	}

	if(char === 's' || char === 'S') {
		return kind !== 'others';
	}

	if(char === 't' || char === 'T') {
		return kind === 'others';
	}

	return false;
}
