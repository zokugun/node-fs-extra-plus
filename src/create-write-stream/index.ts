import { type PathLike, WriteStream } from 'node:fs';
import { type WriteStreamOptions } from '../types/stream.js';

type WriteStreamConstructor = new (path: PathLike, options?: BufferEncoding | WriteStreamOptions) => WriteStream;

// eslint-disable-next-line @typescript-eslint/naming-convention
const WriteStreamCtor = WriteStream as unknown as WriteStreamConstructor;

export function createWriteStream(path: PathLike, options?: BufferEncoding | WriteStreamOptions): WriteStream {
	return new WriteStreamCtor(path, options);
}
