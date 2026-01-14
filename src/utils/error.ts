export class FsError extends Error {
	constructor(message: string, asserter?: Function) {
		super(message);
		this.name = 'FsError';
		Object.setPrototypeOf(this, FsError.prototype);
		Error.captureStackTrace?.(this, asserter ?? this.constructor);
	}
}

export function isFsError(err: any): err is FsError {
	return err instanceof FsError;
}
