import { type PathLike, type Stats } from 'node:fs';
import path from 'node:path';
import { err, ok, type Result } from '@zokugun/xtry';
import { lstat, stat, readdir } from '../fs/async.js';
import { FsError } from '../types/fs-error.js';
import { type WalkItem, type WalkOptions } from '../types/walk.js';
import { toPathString } from '../utils/to-path-string.js';

export async function walk(dir: PathLike, options: WalkOptions = {}): Promise<Result<AsyncGenerator<Result<WalkItem, NodeJS.ErrnoException>>, NodeJS.ErrnoException | FsError>> {
	const {
		absolute = false,
		depthLimit = -1,
		filter = () => true,
		markDirectories = false,
		onlyDirectories = false,
		onlyFiles = false,
		preserveSymlinks = false,
		sorter,
		traverseAll = false,
	} = options;

	const maxDepth = depthLimit === -1 ? Number.POSITIVE_INFINITY : depthLimit;
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

	const rootItem = toItem(absolute ? basePath : '', rootStats.value);
	let index = 0;

	const shouldInclude: (stats: Stats) => boolean
		= onlyDirectories
			? (onlyFiles ? () => false : (stats) => stats.isDirectory())
			: (onlyFiles ? (stats) => stats.isFile() : () => true);

	function toItem(currentPath: string, stats: Stats): WalkItem {
		const yieldPath = absolute ? currentPath : path.relative(basePath, currentPath);

		return {
			path: stats.isDirectory() && markDirectories && !yieldPath.endsWith(path.sep) ? `${yieldPath}${path.sep}` : yieldPath,
			stats,
		};
	}

	async function * walkPath(currentPath: string, currentItem: WalkItem, depth: number, includeSelf: boolean): AsyncGenerator<Result<WalkItem, NodeJS.ErrnoException>> {
		if(includeSelf && shouldInclude(currentItem.stats)) {
			index += 1;

			yield ok(currentItem);
		}

		if(!currentItem.stats.isDirectory() || depth > maxDepth) {
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
			const allowed = filter(item, index);

			if(allowed) {
				yield * walkPath(entryPath, item, depth + 1, true);
			}
			else if(traverseAll && entryStats.value.isDirectory()) {
				yield * walkPath(entryPath, item, depth + 1, false);
			}
		}
	}

	return ok(walkPath(basePath, rootItem, 0, false));
}
