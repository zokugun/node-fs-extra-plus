import { type BigIntStats } from 'node:fs';
import path from 'node:path';
import { err, OK } from '@zokugun/xtry/sync';
import { stat } from '../fs/sync.js';
import { FsError } from '../types/fs-error.js';
import { type FsVoidResult } from '../types/fs-void-result.js';
import { areIdentical } from './are-identical.js';

export function checkParentPathsSync(source: string, sourceStat: BigIntStats, destination: string, funcName: 'copy' | 'move'): FsVoidResult {
	const sourceParent = path.resolve(path.dirname(source));
	const destinationParent = path.resolve(path.dirname(destination));

	if(destinationParent === sourceParent || destinationParent === path.parse(destinationParent).root) {
		return OK;
	}

	const destinationStats = stat(destinationParent, { bigint: true });
	if(destinationStats.fails) {
		if(destinationStats.error.code === 'ENOENT') {
			return OK;
		}
		else {
			return destinationStats;
		}
	}

	if(areIdentical(sourceStat, destinationStats.value)) {
		return err(new FsError(`Cannot ${funcName} '${source}' to a subdirectory of itself, '${destination}'.`));
	}

	return checkParentPathsSync(source, sourceStat, destinationParent, funcName);
}
