// eslint-disable-next-line no-control-regex
const ILLEGAL_REGEX = /[\\/:*?"<>|\u0000-\u001F\u0080-\u009F]|[. ]$/;
const WINDOWS_RESERVED_REGEX = /^(?:con|prn|aux|nul|com\d|lpt\d)(?:\..*)?$/i;

export function isSafePath(path: string): boolean {
	const trimmed = path.trim();

	if(trimmed.length === 0 || path.length > 255) {
		return false;
	}

	if(ILLEGAL_REGEX.test(path) || WINDOWS_RESERVED_REGEX.test(path)) {
		return false;
	}

	if(trimmed === '.' || trimmed === '..') {
		return false;
	}

	return true;
}
