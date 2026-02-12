import { isBoolean, isRecord, isUndefined } from '@zokugun/is-it-type';
import { type ObjectMode } from './types.js';

function isBooleanOrUndefined(value: unknown): boolean {
	return isBoolean(value) || isUndefined(value);
}

function isPermissionRecord(value: unknown): boolean {
	if(!isRecord(value)) {
		return isUndefined(value);
	}

	for(const key in value) {
		if(key === 'read' || key === 'write' || key === 'execute') {
			if(!isBooleanOrUndefined(value[key])) {
				return false;
			}
		}
		else {
			return false;
		}
	}

	return true;
}

function isSpecialRecord(value: unknown): boolean {
	if(!isRecord(value)) {
		return isUndefined(value);
	}

	for(const key in value) {
		if(key === 'setuid' || key === 'setgid' || key === 'sticky') {
			if(!isBooleanOrUndefined(value[key])) {
				return false;
			}
		}
		else {
			return false;
		}
	}

	return true;
}

export function isObject(value: unknown): value is ObjectMode {
	if(!isRecord(value)) {
		return false;
	}

	for(const key in value) {
		if(key === 'user' || key === 'group' || key === 'others' || key === 'all') {
			if(!isPermissionRecord(value[key])) {
				return false;
			}
		}
		else if(key === 'special') {
			if(!isSpecialRecord(value[key])) {
				return false;
			}
		}
		else {
			return false;
		}
	}

	return true;
}
