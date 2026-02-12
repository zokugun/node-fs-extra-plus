import { S_IRGRP, S_IROTH, S_IRUSR, S_IWGRP, S_IWOTH, S_IWUSR, S_IXGRP, S_IXOTH, S_IXUSR } from '../constants.js';

export type ClauseKind = 'u' | 'g' | 'o';
export type ClauseOperator = '+' | '-' | '=';
export type PermissionBits = {
	readonly read: number;
	readonly write: number;
	readonly execute: number;
};

export const CLAUSE_REGEX = /^([ugoa]*)([+\-=])([rwxst]*)$/i;
export const CLAUSE_TARGETS = new Set(['u', 'g', 'o', 'a']);
export const CLAUSE_PERMISSIONS = new Set(['r', 'w', 'x', 'X', 's', 't']);
export const CLAUSE_BITS: Record<ClauseKind, PermissionBits> = {
	u: { read: S_IRUSR, write: S_IWUSR, execute: S_IXUSR },
	g: { read: S_IRGRP, write: S_IWGRP, execute: S_IXGRP },
	o: { read: S_IROTH, write: S_IWOTH, execute: S_IXOTH },
};
export const TARGET_PERMISSION_MASK = {
	u: S_IRUSR | S_IWUSR | S_IXUSR,
	g: S_IRGRP | S_IWGRP | S_IXGRP,
	o: S_IROTH | S_IWOTH | S_IXOTH,
} as const;
