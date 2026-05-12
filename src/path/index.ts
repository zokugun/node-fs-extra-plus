import path,
{
	basename as segment,
	delimiter,
	extname as extension,
	isAbsolute,
	normalize,
	relative,
	sep as separator,
} from 'node:path';

const matchesGlob = path.matchesGlob ?? undefined;

/* eslint-disable unicorn/prefer-export-from */
export {
	delimiter,
	extension,
	matchesGlob,
	isAbsolute,
	normalize,
	relative,
	segment,
	separator,
};
/* eslint-enable unicorn/prefer-export-from */

// eslint-disable-next-line import/no-anonymous-default-export
export default {
	delimiter,
	extension,
	matchesGlob,
	isAbsolute,
	normalize,
	relative,
	segment,
	separator,
};
