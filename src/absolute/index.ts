import path from 'node:path';
import { resolve } from '../resolve/index.js';

export function absolute(...paths: string[]): string {
	return path.resolve(resolve(...paths));
}
