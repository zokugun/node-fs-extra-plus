import { type Abortable } from 'node:events';
import { type BigIntStats, type Mode, type ObjectEncodingOptions, type ReadOptions, type ReadOptionsWithBuffer, type ReadPosition, type ReadStream, type ReadVResult, type StatOptions, type Stats, type TimeLike, type WriteOptions, type WriteStream, type WriteVResult } from 'node:fs';
import { type CreateReadStreamOptions, type CreateWriteStreamOptions, type FileReadResult, type FileHandle as NodeFileHandle, type ReadableWebStreamOptions } from 'node:fs/promises';
import { type Interface as ReadlineInterface } from 'readline';
import { isRecord } from '@zokugun/is-it-type';
import { xtry, xtrySync } from '@zokugun/xtry/async';
import { type FsResult } from './fs-result.js';
import { type FsVoidResult } from './fs-void-result.js';

type FileWriteResult<T> = { bytesWritten: number; buffer: T };

export class FileHandle {
	private readonly handle: NodeFileHandle;

	constructor(handle: NodeFileHandle) {
		this.handle = handle;
	}

	get fd() {
		return this.handle.fd;
	}

	async appendFile(data: string | Uint8Array, options?: (ObjectEncodingOptions & Abortable) | BufferEncoding | null): Promise<FsVoidResult> {
		return xtry(async () => this.handle.appendFile(data, options));
	}

	async chown(uid: number, gid: number): Promise<FsVoidResult> {
		return xtry(async () => this.handle.chown(uid, gid));
	}

	async chmod(mode: Mode): Promise<FsVoidResult> {
		return xtry(async () => this.handle.chmod(mode));
	}

	async close(): Promise<FsVoidResult> {
		return xtry(async () => this.handle.close());
	}

	createReadStream(options?: CreateReadStreamOptions): FsResult<ReadStream> {
		return xtrySync(() => this.handle.createReadStream(options));
	}

	createWriteStream(options?: CreateWriteStreamOptions): FsResult<WriteStream> {
		return xtrySync(() => this.handle.createWriteStream(options));
	}

	async datasync(): Promise<FsVoidResult> {
		return xtry(async () => this.handle.datasync());
	}

	async sync(): Promise<FsVoidResult> {
		return xtry(async () => this.handle.sync());
	}

	read<T extends NodeJS.ArrayBufferView>(buffer: T, offset?: number | null, length?: number | null, position?: ReadPosition | null): Promise<FsResult<FileReadResult<T>>>;
	read<T extends NodeJS.ArrayBufferView>(buffer: T, options?: ReadOptions): Promise<FsResult<FileReadResult<T>>>;
	read<T extends NodeJS.ArrayBufferView = NonSharedBuffer>(options?: ReadOptionsWithBuffer<T>): Promise<FsResult<FileReadResult<T>>>;
	async read<T extends NodeJS.ArrayBufferView>(buffer: T | ReadOptionsWithBuffer<T>, offset: ReadOptions | number | null = null, length: number | null = null, position: ReadPosition | null = null): Promise<FsResult<FileReadResult<T>>> {
		if(buffer[Symbol.toStringTag] === 'ArrayBuffer') {
			if(isRecord(offset)) {
				return xtry(async () => this.handle.read(buffer as T, offset as ReadOptions));
			}
			else {
				return xtry(async () => this.handle.read(buffer as T, offset as number | null, length, position));
			}
		}
		else {
			return xtry(async () => this.handle.read(buffer as ReadOptionsWithBuffer<T>));
		}
	}

	readableWebStream(options?: ReadableWebStreamOptions): FsResult<ReadableStream> {
		return xtrySync(() => this.handle.readableWebStream(options));
	}

	readFile(options?: ({ encoding?: null | undefined } & Abortable) | null): Promise<FsResult<NonSharedBuffer>>;
	readFile(options: ({ encoding: BufferEncoding } & Abortable) | BufferEncoding): Promise<FsResult<string>>;
	async readFile(options?: (ObjectEncodingOptions & Abortable) | BufferEncoding | null): Promise<FsResult<string | NonSharedBuffer>> {
		return xtry(async () => this.handle.readFile(options));
	}

	readLines(options?: CreateReadStreamOptions): FsResult<ReadlineInterface> {
		return xtrySync(() => this.handle.readLines(options));
	}

	async readv<TBuffers extends readonly NodeJS.ArrayBufferView[]>(buffers: TBuffers, position?: number): Promise<FsResult<ReadVResult<TBuffers>>> {
		return xtry(async () => this.handle.readv(buffers, position));
	}

	stat(options?: StatOptions & { bigint?: false | undefined }): Promise<FsResult<Stats>>;
	stat(options: StatOptions & { bigint: true }): Promise<FsResult<BigIntStats>>;
	stat(options: StatOptions): Promise<FsResult<Stats | BigIntStats>>;
	async stat(options?: StatOptions): Promise<FsResult<Stats | BigIntStats>> {
		return xtry(async () => this.handle.stat(options));
	}

	async truncate(length?: number): Promise<FsVoidResult> {
		return xtry(async () => this.handle.truncate(length));
	}

	async utimes(atime: TimeLike, mtime: TimeLike): Promise<FsVoidResult> {
		return xtry(async () => this.handle.utimes(atime, mtime));
	}

	async writeFile(data: string | Uint8Array, options?: | (ObjectEncodingOptions & Abortable) | BufferEncoding | null): Promise<FsVoidResult> {
		return xtry(async () => this.handle.writeFile(data, options));
	}

	write<TBuffer extends NodeJS.ArrayBufferView>(buffer: TBuffer, offset?: number | null, length?: number | null, position?: number | null): Promise<FsResult<FileWriteResult<TBuffer>>>;
	write<TBuffer extends Uint8Array>(buffer: TBuffer, options?: WriteOptions): Promise<FsResult<FileWriteResult<TBuffer>>>;
	write(data: string, position?: number | null, encoding?: BufferEncoding | null): Promise<FsResult<FileWriteResult<string>>>;
	async write<TBuffer extends NodeJS.ArrayBufferView | Uint8Array>(buffer: TBuffer | string, offset: WriteOptions | number | null = null, length: number | null | BufferEncoding = null, position: number | null = null): Promise<FsResult<FileWriteResult<TBuffer | string>>> {
		if(buffer[Symbol.toStringTag] === 'ArrayBuffer') {
			return xtry(async () => this.handle.write(buffer as TBuffer, offset as number | null, length as number | null, position));
		}
		else if(buffer instanceof Uint8Array) {
			if(offset) {
				return xtry(async () => this.handle.write(buffer, offset as { offset?: number; length?: number; position?: number }));
			}
			else {
				return xtry(async () => this.handle.write(buffer));
			}
		}
		else {
			return xtry(async () => this.handle.write(buffer as string, offset as number | null, length as BufferEncoding | null));
		}
	}

	async writev<TBuffers extends readonly NodeJS.ArrayBufferView[]>(buffers: TBuffers, position?: number): Promise<FsResult<WriteVResult<TBuffers>>> {
		return xtry(async () => this.handle.writev(buffers, position));
	}

	async [Symbol.asyncDispose](): Promise<FsVoidResult> {
		// eslint-disable-next-line no-use-extend-native/no-use-extend-native
		return xtry(async () => this.handle[Symbol.asyncDispose]());
	}
}
