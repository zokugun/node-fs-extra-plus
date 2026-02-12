import { err, ok, type Result } from '@zokugun/xtry';
import { isObject } from './is-object.js';
import { type ObjectMode, type PermissionRecord, type SpecialRecord } from './types.js';
import { normalizeError } from './utils/normalize-error.js';

type PermissionKey = keyof PermissionRecord;

type SpecialKey = keyof SpecialRecord;

const PERMISSION_KEYS: PermissionKey[] = ['read', 'write', 'execute'];
const SPECIAL_KEYS: SpecialKey[] = ['setuid', 'setgid', 'sticky'];

export function normalizeObject(value: unknown): Result<ObjectMode, string> {
	if(!isObject(value)) {
		return err(normalizeError(value, 'object'));
	}

	const input = value;
	const all = normalizePermissionRecord(input.all);

	let user = cloneRecord(all);
	let group = cloneRecord(all);
	let others = cloneRecord(all);

	user = mergeRecord(user, normalizePermissionRecord(input.user));
	group = mergeRecord(group, normalizePermissionRecord(input.group));
	others = mergeRecord(others, normalizePermissionRecord(input.others));

	const output: ObjectMode = {};

	if(user && Object.keys(user).length > 0) {
		output.user = user;
	}

	if(group && Object.keys(group).length > 0) {
		output.group = group;
	}

	if(others && Object.keys(others).length > 0) {
		output.others = others;
	}

	const special = normalizeSpecialRecord(input.special);
	if(special && Object.keys(special).length > 0) {
		output.special = special;
	}

	return ok(output);
}

function normalizePermissionRecord(record: PermissionRecord | undefined): PermissionRecord | undefined {
	if(!record) {
		return undefined;
	}

	const normalized: PermissionRecord = {};
	for(const key of PERMISSION_KEYS) {
		const value = record[key];
		if(value !== undefined) {
			normalized[key] = value;
		}
	}

	return normalized;
}

function normalizeSpecialRecord(record: SpecialRecord | undefined): SpecialRecord | undefined {
	if(!record) {
		return undefined;
	}

	const normalized: SpecialRecord = {};
	for(const key of SPECIAL_KEYS) {
		const value = record[key];
		if(value !== undefined) {
			normalized[key] = value;
		}
	}

	return normalized;
}

function cloneRecord(record: PermissionRecord | undefined): PermissionRecord | undefined {
	if(!record) {
		return undefined;
	}

	return { ...record };
}

function mergeRecord(base: PermissionRecord | undefined, override: PermissionRecord | undefined): PermissionRecord | undefined {
	if(!base && !override) {
		return undefined;
	}

	const merged: PermissionRecord = {
		...base,
		...override,
	};

	return merged;
}
