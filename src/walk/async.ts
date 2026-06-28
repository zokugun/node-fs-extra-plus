import { type PathLike, type Stats } from 'node:fs';
import path from 'node:path';
import { isFunction } from '@zokugun/is-it-type';
import { err, ok, type Result } from '@zokugun/xtry';
import { lstat, stat, readdir } from '../fs/async.js';
import { pico } from '../globber/index.js';
import { FsError } from '../types/fs-error.js';
import { type WalkItem, type WalkOptions } from '../types/walk.js';
import { toPathString } from '../utils/to-path-string.js';

export async function walk(dir: PathLike, options: WalkOptions & { collect: true; onlyPath: true }): Promise<Result<string[], NodeJS.ErrnoException | FsError>>;
export async function walk(dir: PathLike, options: WalkOptions & { collect: true }): Promise<Result<WalkItem[], NodeJS.ErrnoException | FsError>>;
export async function walk(dir: PathLike, options: WalkOptions & { onlyPath: true }): Promise<Result<AsyncGenerator<Result<string, NodeJS.ErrnoException>>, NodeJS.ErrnoException | FsError>>;
export async function walk(dir: PathLike, options?: WalkOptions): Promise<Result<AsyncGenerator<Result<WalkItem, NodeJS.ErrnoException>>, NodeJS.ErrnoException | FsError>>;
export async function walk(dir: PathLike, options: WalkOptions = {}): Promise<Result<AsyncGenerator<Result<string | WalkItem, NodeJS.ErrnoException>> | string[] | WalkItem[], NodeJS.ErrnoException | FsError>> {
	if(options.maxDepth === -1) {
		options.maxDepth = Number.POSITIVE_INFINITY;
	}

	if(options.maxResults === -1) {
		options.maxResults = Number.POSITIVE_INFINITY;
	}

	const {
		absolute = false,
		asPaths = false,
		collect = false,
		filter,
		followSymlinks = true,
		glob,
		markDirectories = false,
		maxDepth = Number.POSITIVE_INFINITY,
		maxResults = Number.POSITIVE_INFINITY,
		onlyDirectories = false,
		onlyFiles = false,
		preserveSymlinks = false,
		signal,
		sorter,
		traverseAll = false,
	} = options;

	const rootPath = toPathString(dir);
	const basePath = path.resolve(rootPath);
	const statFn = preserveSymlinks ? lstat : stat;

	const rootStats = await statFn(basePath);
	if(rootStats.fails) {
		return rootStats;
	}

	if(!rootStats.value.isDirectory()) {
		const error = new FsError('ENOTDIR: not a directory');
		error.code = 'ENOTDIR';
		error.path = basePath;

		return err(error);
	}

	let matcher: ((path: string) => boolean) | undefined;

	if(glob) {
		if(isFunction(glob)) {
			matcher = glob;
		}
		else {
			matcher = pico(glob);
		}
	}

	const rootItem = toItem(absolute ? basePath : '', rootStats.value);
	let index = 0;

	const isAllowed: (item: WalkItem, index: number) => boolean
		= matcher
			? (filter ? ((item, index) => matcher(item.path) && filter(item, index)) : (({ path }) => matcher(path)))
			: (filter ?? (() => true));

	const shouldInclude: (stats: Stats) => boolean
		= onlyDirectories
			? (onlyFiles ? (() => false) : ((stats) => stats.isDirectory()))
			: (onlyFiles ? ((stats) => stats.isFile()) : (() => true));

	function toItem(currentPath: string, stats: Stats): WalkItem {
		const yieldPath = absolute ? currentPath : path.relative(basePath, currentPath);

		return {
			path: stats.isDirectory() && markDirectories && !yieldPath.endsWith(path.sep) ? `${yieldPath}${path.sep}` : yieldPath,
			stats,
		};
	}

	async function * walkPath(currentPath: string, currentItem: WalkItem, depth: number, includeSelf: boolean): AsyncGenerator<Result<string | WalkItem, NodeJS.ErrnoException>> {
		if(includeSelf && shouldInclude(currentItem.stats)) {
			index += 1;

			if(asPaths) {
				yield ok(currentItem.path);
			}
			else {
				yield ok(currentItem);
			}
		}

		if(!currentItem.stats.isDirectory() || depth > maxDepth || index >= maxResults || (signal?.aborted)) {
			return;
		}

		if(!followSymlinks && currentItem.stats.isSymbolicLink()) {
			return;
		}

		const readResult = await readdir(currentPath);
		if(readResult.fails) {
			yield readResult;

			return;
		}

		const entries = sorter ? readResult.value.sort(sorter) : readResult.value;

		for(const entry of entries) {
			const entryPath = path.join(currentPath, entry);
			const entryStats = await statFn(entryPath);

			if(entryStats.fails) {
				yield entryStats;

				continue;
			}

			const item = toItem(entryPath, entryStats.value);
			const allowed = isAllowed(item, index);

			if(allowed) {
				yield * walkPath(entryPath, item, depth + 1, true);
			}
			else if(traverseAll && entryStats.value.isDirectory()) {
				yield * walkPath(entryPath, item, depth + 1, false);
			}

			if(index >= maxResults || (signal?.aborted)) {
				return;
			}
		}
	}

	const generator = walkPath(basePath, rootItem, 0, false);

	if(collect) {
		const items: Array<string | WalkItem> = [];

		for await (const result of generator) {
			if(result.fails) {
				return err(result.error);
			}

			items.push(result.value);
		}

		return ok(items as any);
	}

	return ok(generator);
}
