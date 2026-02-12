import { err, ok, type Result } from '@zokugun/xtry';
import { S_IRGRP, S_IROTH, S_IRUSR, S_IWGRP, S_IWOTH, S_IWUSR, S_IXGRP, S_IXOTH, S_IXUSR, S_ISGID, S_ISUID, S_ISVTX, S_IFIFO, S_IFCHR, S_IFDIR, S_IFREG, S_IFLNK, S_IFBLK, S_IFSOCK, S_IFDOOR } from '../constants.js';
import { type MasterMode } from '../master-mode.js';
import { convertError } from '../utils/convert-error.js';

export function numberToMaster(value: number): Result<MasterMode, string> {
	if(Number.isNaN(value) || value < 0) {
		return err(convertError(value, 'number'));
	}

	const normalized = value & 0o17_7777;
	const typed = normalized > 0o7777;
	const result: MasterMode = {
		updating: false,
		special: normalized > 0o777,
		typed,
		user: {
			read: { operator: '=', operand: Boolean(normalized & S_IRUSR) },
			write: { operator: '=', operand: Boolean(normalized & S_IWUSR) },
		},
		group: {
			read: { operator: '=', operand: Boolean(normalized & S_IRGRP) },
			write: { operator: '=', operand: Boolean(normalized & S_IWGRP) },
		},
		others: {
			read: { operator: '=', operand: Boolean(normalized & S_IROTH) },
			write: { operator: '=', operand: Boolean(normalized & S_IWOTH) },
		},
	};

	if(normalized & S_ISUID) {
		result.user!.execute = { operator: (normalized & S_IXUSR) ? '=' : '-', operand: 's' };
	}
	else {
		result.user!.execute = { operator: '=', operand: (normalized & S_IXUSR) ? 'x' : '-' };
	}

	if(normalized & S_ISGID) {
		result.group!.execute = { operator: (normalized & S_IXGRP) ? '=' : '-', operand: 's' };
	}
	else {
		result.group!.execute = { operator: '=', operand: (normalized & S_IXGRP) ? 'x' : '-' };
	}

	if(normalized & S_ISVTX) {
		result.others!.execute = { operator: (normalized & S_IXOTH) ? '=' : '-', operand: 's' };
	}
	else {
		result.others!.execute = { operator: '=', operand: (normalized & S_IXOTH) ? 'x' : '-' };
	}

	if(typed) {
		if(normalized > 0o17_0000) {
			result.typed = false;
		}
		else if(normalized & S_IFIFO) {
			result.fileType = 'p';
		}
		else if(normalized & S_IFCHR) {
			result.fileType = 'c';
		}
		else if(normalized & S_IFDIR) {
			result.fileType = 'd';
		}
		else if(normalized & S_IFBLK) {
			result.fileType = 'b';
		}
		else if(normalized & S_IFREG) {
			result.fileType = 'r';
		}
		else if(normalized & S_IFLNK) {
			result.fileType = 'l';
		}
		else if(normalized & S_IFSOCK) {
			result.fileType = 's';
		}
		else if(normalized & S_IFDOOR) {
			result.fileType = 'D';
		}
	}

	return ok(result);
}
