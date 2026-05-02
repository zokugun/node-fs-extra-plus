import os from 'node:os';

const TILDE_REGEX = /^~(?=$|\/|\\)/;
const USER_REGEX = /^~([^/\\]+)(.*)$/;

let $homedir: string | undefined;
let $username: string | undefined;

export function untildify(path: string): string {
	$homedir ??= os.homedir();

	if($homedir && TILDE_REGEX.test(path)) {
		return $homedir + path.slice(1);
	}

	const match = USER_REGEX.exec(path);

	if(match) {
		$username ??= os.userInfo().username;

		const [, username, rest] = match;

		if(username === $username) {
			return $homedir + rest;
		}
	}

	return path;
}
