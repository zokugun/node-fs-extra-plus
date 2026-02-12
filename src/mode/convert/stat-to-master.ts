import { ok, type Result } from '@zokugun/xtry';
import { type MasterMode } from '../master-mode.js';
import { normalizeStat } from '../normalize-stat.js';
import { type FileType, type StatMode } from '../types.js';

export function statToMaster(value: StatMode): Result<MasterMode, string> {
	const normalization = normalizeStat(value);
	if(normalization.fails) {
		return normalization;
	}

	const normalized = normalization.value.split('');
	const result: MasterMode = {
		updating: false,
		special: false,
		typed: false,
	};

	if(normalized.length === 10) {
		const fileType = normalized.shift();

		result.typed = true;
		result.fileType = fileType === '-' ? 'r' : fileType as Exclude<FileType, '-'>;
	}

	result.user = {
		read: { operator: '=', operand: normalized[0] === 'r' },
		write: { operator: '=', operand: normalized[1] === 'w' },
		execute: { operator: '=', operand: normalized[2] as 's' | 'x' | '-' },
	};
	result.group = {
		read: { operator: '=', operand: normalized[3] === 'r' },
		write: { operator: '=', operand: normalized[4] === 'w' },
		execute: { operator: '=', operand: normalized[5] as 's' | 'x' | '-' },
	};
	result.others = {
		read: { operator: '=', operand: normalized[6] === 'r' },
		write: { operator: '=', operand: normalized[7] === 'w' },
		execute: { operator: '=', operand: (normalized[8] === 't' ? 's' : normalized[8]) as 's' | 'x' | '-' },
	};
	result.special = normalized[2] === 's' || normalized[5] === 's' || normalized[8] === 't';

	if(normalized[2] === 'S') {
		result.special = true;
		result.user.execute = { operator: '-', operand: 's' };
	}

	if(normalized[5] === 'S') {
		result.special = true;
		result.group.execute = { operator: '-', operand: 's' };
	}

	if(normalized[8] === 'T') {
		result.special = true;
		result.others.execute = { operator: '-', operand: 's' };
	}

	return ok(result);
}
