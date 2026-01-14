import { type BigIntStats } from 'node:fs';
import path from 'node:path';
import { err, OK } from '@zokugun/xtry/async';
import { stat } from '../fs/async.js';
import { areIdentical } from './are-identical.js';
import { FsError } from './error.js';
import { type FsVoidResult } from './types.js';

export async function checkParentPathsAsync(source: string, sourceStat: BigIntStats, destination: string, funcName: 'copy' | 'move'): Promise<FsVoidResult> {
	const sourceParent = path.resolve(path.dirname(source));
	const destinationParent = path.resolve(path.dirname(destination));

	if(destinationParent === sourceParent || destinationParent === path.parse(destinationParent).root) {
		return OK;
	}

	const destinationStats = await stat(destinationParent, { bigint: true });
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

	return checkParentPathsAsync(source, sourceStat, destinationParent, funcName);
}
