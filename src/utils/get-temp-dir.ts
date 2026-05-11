import fs from 'node:fs';
import os from 'node:os';

let $tempDir: string | undefined;

export function getTempDirSync(): string {
	$tempDir ??= fs.realpathSync(os.tmpdir());

	return $tempDir;
}

export async function getTempDirAsync(): Promise<string> {
	$tempDir ??= await fs.promises.realpath(os.tmpdir());

	return $tempDir;
}
