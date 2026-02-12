import { err, ok, type Result } from '@zokugun/xtry';
import { S_IFBLK, S_IFCHR, S_IFDIR, S_IFDOOR, S_IFIFO, S_IFLNK, S_IFREG, S_IFSOCK, S_IRGRP, S_IROTH, S_IRUSR, S_ISGID, S_ISVTX, S_ISUID, S_IWGRP, S_IWOTH, S_IWUSR, S_IXGRP, S_IXOTH, S_IXUSR } from '../constants.js';
import { type MasterMode } from '../master-mode.js';
import { type NumberMode } from '../types.js';
import { convertError } from '../utils/convert-error.js';

export function masterToNumber(value: MasterMode): Result<NumberMode, string> {
	if(value.updating) {
		return err(convertError(value, 'number'));
	}

	let result = 0;

	if(value.user) {
		if(value.user.read?.operand) {
			result |= S_IRUSR;
		}

		if(value.user.write?.operand) {
			result |= S_IWUSR;
		}

		if(value.user.execute && value.user.execute.operand !== '-') {
			if(value.user.execute.operand === 's') {
				result |= S_ISUID;

				if(value.user.execute.operator !== '-') {
					result |= S_IXUSR;
				}
			}
			else if(value.user.execute.operand === 'X') {
				return err(convertError(value, 'number'));
			}
			else {
				result |= S_IXUSR;
			}
		}
	}

	if(value.group) {
		if(value.group.read?.operand) {
			result |= S_IRGRP;
		}

		if(value.group.write?.operand) {
			result |= S_IWGRP;
		}

		if(value.group.execute && value.group.execute.operand !== '-') {
			if(value.group.execute.operand === 's') {
				result |= S_ISGID;

				if(value.group.execute.operator !== '-') {
					result |= S_IXGRP;
				}
			}
			else if(value.group.execute.operand === 'X') {
				return err(convertError(value, 'number'));
			}
			else {
				result |= S_IXGRP;
			}
		}
	}

	if(value.others) {
		if(value.others.read?.operand) {
			result |= S_IROTH;
		}

		if(value.others.write?.operand) {
			result |= S_IWOTH;
		}

		if(value.others.execute && value.others.execute.operand !== '-') {
			if(value.others.execute.operand === 's') {
				result |= S_ISVTX;

				if(value.others.execute.operator !== '-') {
					result |= S_IXOTH;
				}
			}
			else if(value.others.execute.operand === 'X') {
				return err(convertError(value, 'number'));
			}
			else {
				result |= S_IXOTH;
			}
		}
	}

	if(value.fileType) {
		switch(value.fileType) {
			case 'b': {
				result |= S_IFBLK;
				break;
			}

			case 'c': {
				result |= S_IFCHR;
				break;
			}

			case 'd': {
				result |= S_IFDIR;
				break;
			}

			case 'D': {
				result |= S_IFDOOR;
				break;
			}

			case 'l': {
				result |= S_IFLNK;
				break;
			}

			case 'p': {
				result |= S_IFIFO;
				break;
			}

			case 'r': {
				result |= S_IFREG;
				break;
			}

			case 's': {
				result |= S_IFSOCK;
			}
		}
	}

	return ok(result);
}
