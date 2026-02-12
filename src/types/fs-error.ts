export class FsError extends Error {
	public code?: string;
	public path?: string;

	constructor(message: string, asserter?: Function) {
		super(message);
		this.name = 'FsError';
		Object.setPrototypeOf(this, FsError.prototype);
		Error.captureStackTrace?.(this, asserter ?? this.constructor);
	}
}
