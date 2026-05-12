import os from 'node:os';

let $home: string | undefined;

export function getHome(): string {
	$home ??= os.homedir();

	return $home;
}
