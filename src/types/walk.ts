import { type Stats } from 'node:fs';

export type WalkItem = {
	path: string;
	stats: Stats;
};

export type WalkOptions = {
	absolute?: boolean;
	depthLimit?: number;
	filter?: (item: WalkItem, index: number) => boolean;
	markDirectories?: boolean;
	onlyDirectories?: boolean;
	onlyFiles?: boolean;
	preserveSymlinks?: boolean;
	sorter?: (a: string, b: string) => number;
	traverseAll?: boolean;
};
