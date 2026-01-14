import { isFunction } from '@zokugun/is-it-type';

export type CopyFilterSync = (source: string, destination: string) => boolean;
export type CopyFilterAsync = (source: string, destination: string) => Promise<boolean>;

export type CopyOptions<T = CopyFilterSync | CopyFilterAsync> = {
	overwrite?: boolean;
	clobber?: boolean;
	dereference?: boolean;
	preserveTimestamps?: boolean;
	errorOnExist?: boolean;
	filter?: T;
};

export type CopyOptionsInput<T> = CopyOptions<T> | T | undefined;

export function normalizeOptions<T>(input: CopyOptionsInput<T>): CopyOptions<T> {
	if(!input) {
		return { clobber: true, overwrite: true };
	}

	let options: CopyOptions<T> = {};

	if(isFunction(input)) {
		options.filter = input as T;
	}
	else {
		options = { ...input };
	}

	options.clobber = 'clobber' in options ? Boolean(options.clobber) : true; // default to true for now
	options.overwrite = 'overwrite' in options ? Boolean(options.overwrite) : options.clobber; // overwrite falls back to clobber

	return options;
}
