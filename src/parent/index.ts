import path from 'node:path';

export function parent(file: string): string {
	const parent = path.dirname(file);

	if(parent === '.') {
		return '';
	}
	else {
		return parent;
	}
}
