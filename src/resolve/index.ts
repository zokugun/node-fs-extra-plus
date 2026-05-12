import path from 'node:path';
import process from 'node:process';
import { getHome } from '../utils/get-home.js';
import { getUserHome } from '../utils/get-user-home.js';

const USER_REGEX = /^~([^/\\]+)(.*)$/;

export function resolve(...paths: string[]): string {
	if(paths.length === 0) {
		return process.cwd();
	}
	else if(path.isAbsolute(paths[0])) {
		return path.normalize(path.join(...paths));
	}
	else if(paths[0] === '~' && (paths[0].length === 1 || paths[1] === path.sep)) {
		return path.normalize(path.join(getHome(), ...paths));
	}
	else {
		const match = USER_REGEX.exec(paths[0]);

		if(match) {
			const [, username, rest] = match;
			const userHome = getUserHome(username);

			if(userHome) {
				return path.normalize(path.join(userHome + rest, ...paths));
			}
		}
	}

	paths.unshift();

	return path.normalize(path.join(process.cwd(), ...paths));
}
