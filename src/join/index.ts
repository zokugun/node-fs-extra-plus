import path from 'node:path';

export function join(...paths: string[]): string {
	const joined = path.join(...paths);

	if(joined === '.') {
		return '';
	}
	else {
		return joined;
	}
}
