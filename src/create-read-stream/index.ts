import { type PathLike, ReadStream } from 'node:fs';
import { type ReadStreamOptions } from '../types/stream.js';

type ReadStreamConstructor = new (path: PathLike, options?: BufferEncoding | ReadStreamOptions) => ReadStream;

// eslint-disable-next-line @typescript-eslint/naming-convention
const ReadStreamCtor = ReadStream as unknown as ReadStreamConstructor;

export function createReadStream(path: PathLike, options?: BufferEncoding | ReadStreamOptions): ReadStream {
	return new ReadStreamCtor(path, options);
}
