import { type PathLike } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { lookup } from 'mime-types';

export async function openAsBlob(path: PathLike, options: { type?: string } = {}): Promise<Blob> {
	const buffer = await readFile(path);
	// eslint-disable-next-line @typescript-eslint/no-unsafe-call
	const type = (options.type ?? lookup(path) ?? 'application/octet-stream') as string | undefined;

	return new Blob([buffer], { type });
}
