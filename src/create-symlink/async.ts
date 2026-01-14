import type fs from 'node:fs';
import path from 'node:path';
import { err, ok, OK, type Result } from '@zokugun/xtry';
import { stat, lstat, exists, symlink } from '../fs/async.js';
import { mkdirs } from '../make-dir/async.js';
import { areIdentical } from '../utils/are-identical.js';
import { FsError } from '../utils/error.js';
import { type FsResult } from '../utils/types.js';

export async function createSymlink(source: string, target: string, type?: fs.symlink.Type | null): Promise<Result<void, NodeJS.ErrnoException | Error>> {
	const stats = await lstat(target);
	if(!stats.fails && stats.value.isSymbolicLink()) {
		const sourceStats = await stat(source);
		if(sourceStats.fails) {
			return sourceStats;
		}

		const tgtStats = await stat(target);
		if(tgtStats.fails) {
			return tgtStats;
		}

		if(areIdentical(sourceStats.value, tgtStats.value)) {
			return OK;
		}
	}

	const relative = await symlinkPaths(source, target);
	if(relative.fails) {
		return relative;
	}

	source = relative.value.toDst;
	type = await symlinkType(relative.value.toCwd, type);

	const dir = path.dirname(target);

	const xstResult = await exists(dir);
	if(xstResult.fails) {
		return xstResult;
	}

	if(xstResult.value) {
		return symlink(source, target, type);
	}

	const result = await mkdirs(dir);
	if(result.fails) {
		return result;
	}

	return symlink(source, target, type);
}

async function symlinkPaths(source: string, target: string): Promise<FsResult<{ toCwd: string; toDst: string }>> {
	if(path.isAbsolute(source)) {
		const result = await exists(source);
		if(result.fails) {
			return result;
		}

		if(result.value) {
			return ok({
				toCwd: source,
				toDst: source,
			});
		}
		else {
			return err(new FsError('absolute srcpath does not exist'));
		}
	}

	const dir = path.dirname(target);
	const relativeToTarget = path.join(dir, source);

	const xstResult = await exists(relativeToTarget);
	if(xstResult.fails) {
		return xstResult;
	}

	if(xstResult.value) {
		return ok({
			toCwd: relativeToTarget,
			toDst: source,
		});
	}

	const result = await exists(source);
	if(result.fails) {
		return result;
	}

	if(result.value) {
		return ok({
			toCwd: source,
			toDst: path.relative(dir, source),
		});
	}
	else {
		return err(new FsError('relative srcpath does not exist'));
	}
}

async function symlinkType(file: string, type: fs.symlink.Type | null | undefined): Promise<fs.symlink.Type> {
	if(type) {
		return type;
	}

	const stats = await lstat(file);
	if(stats.fails) {
		return 'file';
	}

	return stats.value.isDirectory() ? 'dir' : 'file';
}

export const ensureSymlink = createSymlink;
