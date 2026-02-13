import { type FileHandle } from 'node:fs/promises';

export type StreamOptions = {
	flags?: string | undefined;
	encoding?: BufferEncoding | undefined;
	fd?: number | FileHandle | undefined;
	mode?: number | undefined;
	autoClose?: boolean | undefined;
	emitClose?: boolean | undefined;
	start?: number | undefined;
	signal?: AbortSignal | null | undefined;
	highWaterMark?: number | undefined;
};
export type FSImplementation = {
	open?: (...args: any[]) => any;
	close?: (...args: any[]) => any;
};
export type CreateReadStreamFSImplementation = FSImplementation & {
	read: (...args: any[]) => any;
};
export type CreateWriteStreamFSImplementation = FSImplementation & {
	write: (...args: any[]) => any;
	writev?: (...args: any[]) => any;
};
export type ReadStreamOptions = StreamOptions & {
	fs?: CreateReadStreamFSImplementation | null | undefined;
	end?: number | undefined;
};
export type WriteStreamOptions = StreamOptions & {
	fs?: CreateWriteStreamFSImplementation | null | undefined;
	flush?: boolean | undefined;
};
