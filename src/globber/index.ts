import * as micromatch from 'micromatch';
import * as minimatch from 'minimatch';
import picomatch from 'picomatch';
import { type Globber } from '../types/walk.js';

export function micro(glob: Parameters<typeof micromatch.matcher>[0], options?: Parameters<typeof micromatch.matcher>[1]): Globber {
	return micromatch.matcher(glob, options);
}

export function mini(glob: Parameters<typeof minimatch.filter>[0], options?: Parameters<typeof minimatch.filter>[1]): Globber {
	// eslint-disable-next-line unicorn/no-array-method-this-argument
	return minimatch.filter(glob, options);
}

export function pico(glob: Parameters<typeof picomatch>[0], options?: Parameters<typeof picomatch>[1]): Globber {
	return picomatch(glob, options);
}
