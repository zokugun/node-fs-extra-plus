import { type PathLike } from 'node:fs';
import { fileURLToPath } from 'node:url';

export function toPathString(value: PathLike): string {
	if(value instanceof URL) {
		return fileURLToPath(value);
	}

	return typeof value === 'string' ? value : value.toString();
}
