import { promisify } from 'node:util';
import { isNonNullable } from '@zokugun/is-it-type';

type Callback = (err: unknown, ...values: unknown[]) => void;

function toPromiseImpl(fn: (...args: any[]) => unknown) {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const custom = (fn as any)[promisify.custom];

	if(isNonNullable(custom)) {
		if(typeof custom !== 'function') {
			throw new TypeError('The "util.promisify.custom" property must be a function');
		}

		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return custom;
	}

	const wrapped = async function (this: unknown, ...args: unknown[]) {
		return new Promise((resolve, reject) => {
			const callback: Callback = (err, ...values) => {
				if(isNonNullable(err)) {
					reject(err);

					return;
				}

				resolve(values[0]);
			};

			fn.call(this, ...args, callback);
		});
	};

	Object.defineProperty(wrapped, 'name', { value: fn.name, configurable: true });
	Object.defineProperty(wrapped, promisify.custom, { value: wrapped });

	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	return wrapped as any;
}

export const toPromise = Object.assign(toPromiseImpl, { custom: promisify.custom }) as typeof promisify;
