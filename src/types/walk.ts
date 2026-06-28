import { type Stats } from 'node:fs';

export type Globber = (path: string) => boolean;

export type WalkItem = {
	path: string;
	stats: Stats;
};

export type WalkOptions = {
	/** Return absolute paths instead of paths relative to the start directory. */
	absolute?: boolean;
	/** Return only path strings instead of full `WalkItem` objects. */
	asPaths?: boolean;
	/** When true, return no results if the directory is missing. */
	emptyIfDirMissing?: boolean;
	/** Collect and return all items as an array (rather than streaming them). */
	collect?: boolean;
	/** Function to include/exclude an item. Return true to include the item. */
	filter?: (item: WalkItem, index: number) => boolean;
	/** Resolve and follow symbolic links while traversing. */
	followSymlinks?: boolean;
	/** Glob pattern(s) or a custom `Globber` function to match paths. */
	glob?: string | string[] | Globber;
	/** Append a trailing slash to directory paths when true. */
	markDirectories?: boolean;
	/** Maximum depth to traverse. Use -1 for unlimited depth. */
	maxDepth?: number;
	/** Stop after this many results have been collected/emitted. */
	maxResults?: number;
	/** Include only directories in the results. */
	onlyDirectories?: boolean;
	/** Include only files in the results. */
	onlyFiles?: boolean;
	/** Return the stats of the symbolic link itself . */
	preserveSymlinks?: boolean;
	/** `AbortSignal` to cancel the traversal early. */
	signal?: AbortSignal;
	/** Custom comparator to sort paths before returning. */
	sorter?: (a: string, b: string) => number;
	/** When true, traverse into directories even if those excluded. */
	traverseAll?: boolean;
};
