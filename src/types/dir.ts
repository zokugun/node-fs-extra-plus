import type { Dir as NodeDir, Dirent } from 'node:fs';
import { xtryAsync, xtrySync } from '@zokugun/xtry';
import { type FsResult } from './fs-result.js';
import { type FsVoidResult } from './fs-void-result.js';

export class Dir implements AsyncIterable<Dirent> {
	private readonly dir: NodeDir;

	constructor(dir: NodeDir) {
		this.dir = dir;
	}

	public [Symbol.asyncIterator](): AsyncIterableIterator<Dirent> {
		return this.dir[Symbol.asyncIterator]();
	}

	public async close(): Promise<FsVoidResult> {
		return xtryAsync(async () => this.dir.close());
	}

	public closeSync(): FsVoidResult {
		return xtrySync(() => this.dir.closeSync());
	}

	public async read(): Promise<FsResult<Dirent | null>> {
		return xtryAsync(async () => this.dir.read());
	}

	public readSync(): FsResult<Dirent | null> {
		return xtrySync(() => this.dir.readSync());
	}

	async [Symbol.asyncDispose](): Promise<void> {
		// eslint-disable-next-line no-use-extend-native/no-use-extend-native
		return this.dir[Symbol.asyncDispose]();
	}

	[Symbol.dispose](): void {
		// eslint-disable-next-line no-use-extend-native/no-use-extend-native
		return this.dir[Symbol.dispose]();
	}
}
