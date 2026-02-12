import { S_IRGRP, S_IROTH, S_IRUSR, S_IWGRP, S_IWOTH, S_IWUSR, S_IXGRP, S_IXOTH, S_IXUSR } from '../constants.js';

export const STAT_TEMPLATE = [
	{ index: 0, bit: S_IRUSR, char: 'r' },
	{ index: 1, bit: S_IWUSR, char: 'w' },
	{ index: 2, bit: S_IXUSR, char: 'x' },
	{ index: 3, bit: S_IRGRP, char: 'r' },
	{ index: 4, bit: S_IWGRP, char: 'w' },
	{ index: 5, bit: S_IXGRP, char: 'x' },
	{ index: 6, bit: S_IROTH, char: 'r' },
	{ index: 7, bit: S_IWOTH, char: 'w' },
	{ index: 8, bit: S_IXOTH, char: 'x' },
] as const;
