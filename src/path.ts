/* eslint-disable import/order */
import { absolute } from './absolute/index.js';
import { isSafeSegment } from './is-safe-segment/index.js';
import { isSafePath } from './is-safe-path/index.js';
import { join } from './join/index.js';
import { parent } from './parent/index.js';
import { delimiter, extension, isAbsolute, matchesGlob, normalize, relative, segment, separator } from './path/index.js';
import { resolve } from './resolve/index.js';
import { untildify } from './untildify/index.js';

/* eslint-disable unicorn/prefer-export-from */
export {
	absolute,
	delimiter,
	extension,
	isAbsolute,
	isSafeSegment,
	isSafePath,
	join,
	matchesGlob,
	normalize,
	parent,
	relative,
	resolve,
	segment,
	separator,
	untildify,
};
/* eslint-enable unicorn/prefer-export-from */

// eslint-disable-next-line import/no-anonymous-default-export
export default {
	absolute,
	delimiter,
	extension,
	isAbsolute,
	isSafeSegment,
	isSafePath,
	join,
	matchesGlob,
	normalize,
	parent,
	relative,
	resolve,
	segment,
	separator,
	untildify,
};
