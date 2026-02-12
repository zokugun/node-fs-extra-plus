import { isPositiveIntegerOrZero } from '@zokugun/is-it-type';
import { type NumberMode } from './types.js';

export function isNumber(value: unknown): value is NumberMode {
	return isPositiveIntegerOrZero(value) && (value as number) <= 0o17_7777;
}
