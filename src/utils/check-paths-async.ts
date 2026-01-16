import { type BigIntStats } from 'node:fs';
import path from 'node:path';
import { err, ok } from '@zokugun/xtry/async';
import { stat, lstat } from '../fs/async.js';
import { FsError } from '../types/fs-error.js';
import { type FsResult } from '../types/fs-result.js';
import { areIdentical } from './are-identical.js';
import { isSourceSubdir } from './is-source-subdir.js';

export async function checkPathsAsync(source: string, destination: string, funcName: 'copy' | 'move', options: { dereference?: boolean }): Promise<FsResult<{ srcStat: BigIntStats; destStat: BigIntStats | null; isChangingCase?: boolean }>> {
	const stats = await getStats(source, destination, options);
	if(stats.fails) {
		return stats;
	}

	const { srcStat, destStat } = stats.value;

	if(destStat) {
		if(areIdentical(srcStat, destStat)) {
			const sourceBaseName = path.basename(source);
			const destinationBaseName = path.basename(destination);

			if(funcName === 'move' && sourceBaseName !== destinationBaseName && sourceBaseName.toLowerCase() === destinationBaseName.toLowerCase()) {
				return ok({ srcStat, destStat, isChangingCase: true });
			}

			return err(new FsError('Source and destination must not be the same.'));
		}

		if(srcStat.isDirectory() && !destStat.isDirectory()) {
			return err(new FsError(`Cannot overwrite non-directory '${destination}' with directory '${source}'.`));
		}

		if(!srcStat.isDirectory() && destStat.isDirectory()) {
			return err(new FsError(`Cannot overwrite directory '${destination}' with non-directory '${source}'.`));
		}
	}

	if(srcStat.isDirectory() && isSourceSubdir(source, destination)) {
		return err(new FsError(`Cannot ${funcName} '${source}' to a subdirectory of itself, '${destination}'.`));
	}

	return ok({ srcStat, destStat });
}

async function getStats(source: string, destination: string, options: { dereference?: boolean }): Promise<FsResult<{ srcStat: BigIntStats; destStat: BigIntStats | null }>> {
	const statFn = options.dereference ? stat : lstat;

	const sourceStats = await statFn(source, { bigint: true });
	if(sourceStats.fails) {
		return sourceStats;
	}

	const destinationStats = await statFn(destination, { bigint: true });
	if(destinationStats.fails) {
		if(destinationStats.error.code === 'ENOENT') {
			return ok({ srcStat: sourceStats.value, destStat: null });
		}
		else {
			return destinationStats;
		}
	}

	return ok({ srcStat: sourceStats.value, destStat: destinationStats.value });
}
