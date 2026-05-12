import os from 'node:os';
import { getHome } from './get-home.js';

let $username: string | undefined;

export function getUserHome(username: string): string | null {
	$username ??= os.userInfo().username;

	if(username === $username) {
		return getHome();
	}
	else {
		return null;
	}
}
