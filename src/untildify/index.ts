import { getHome } from '../utils/get-home.js';
import { getUserHome } from '../utils/get-user-home.js';

const TILDE_REGEX = /^~(?=$|\/|\\)/;
const USER_REGEX = /^~([^/\\]+)(.*)$/;

export function untildify(path: string): string {
	const homedir = getHome();

	if(homedir && TILDE_REGEX.test(path)) {
		return homedir + path.slice(1);
	}

	const match = USER_REGEX.exec(path);

	if(match) {
		const [, username, rest] = match;
		const userHome = getUserHome(username);

		if(userHome) {
			return userHome + rest;
		}
	}

	return path;
}
