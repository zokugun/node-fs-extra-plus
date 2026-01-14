import type { BigIntStats, Stats } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { err, OK, OK_TRUE, xdefer, xtry } from '@zokugun/xtry/async';
import * as fs from '../fs/async.js';
import { mkdirs } from '../make-dir/async.js';
import { openDir } from '../open-dir/async.js';
import { pathExists } from '../path-exists/async.js';
import { checkParentPathsAsync } from '../utils/check-parent-paths-async.js';
import { checkPathsAsync } from '../utils/check-paths-async.js';
import { FsError } from '../utils/error.js';
import { isSourceSubdir } from '../utils/is-source-subdir.js';
import { type FsResult, type FsVoidResult } from '../utils/types.js';
import { utimesMillisAsync } from '../utils/utimes-async.js';
import { type CopyFilterAsync, type CopyOptions, type CopyOptionsInput, normalizeOptions } from './options.js';

export async function copy(source: string, destination: string, options?: CopyOptionsInput<CopyFilterAsync>): Promise<FsVoidResult> { // {{{
	const normalizedOptions = normalizeOptions(options);

	const stats = await checkPathsAsync(source, destination, 'copy', normalizedOptions);
	if(stats.fails) {
		return stats;
	}

	const { srcStat, destStat } = stats.value;

	const check = await checkParentPathsAsync(source, srcStat, destination, 'copy');
	if(check.fails) {
		return check;
	}

	const filterResult = await runFilter(source, destination, normalizedOptions);
	if(filterResult.fails) {
		return filterResult;
	}

	if(!filterResult.value) {
		return OK;
	}

	const destinationParent = path.dirname(destination);
	const dirExists = await pathExists(destinationParent);

	if(!dirExists.value) {
		const result = await mkdirs(destinationParent);
		if(result.fails) {
			return result;
		}
	}

	return getStatsAndPerformCopy(destStat, source, destination, normalizedOptions);
} // }}}

async function runFilter(source: string, destination: string, { filter }: CopyOptions<CopyFilterAsync>): Promise<FsResult<boolean>> { // {{{
	if(!filter) {
		return OK_TRUE;
	}

	return xtry(filter(source, destination));
} // }}}

async function getStatsAndPerformCopy(destinationStat: BigIntStats | null, source: string, destination: string, options: CopyOptions<CopyFilterAsync>): Promise<FsVoidResult> { // {{{
	const statFn = options.dereference ? fs.stat : fs.lstat;

	const sourceStats = await statFn(source);
	if(sourceStats.fails) {
		return sourceStats;
	}

	if(sourceStats.value.isDirectory()) {
		return onDir(sourceStats.value, destinationStat, source, destination, options);
	}
	else if(sourceStats.value.isFile() || sourceStats.value.isCharacterDevice() || sourceStats.value.isBlockDevice()) {
		return onFile(sourceStats.value, destinationStat, source, destination, options);
	}
	else if(sourceStats.value.isSymbolicLink()) {
		return onLink(destinationStat, source, destination, options);
	}
	else if(sourceStats.value.isSocket()) {
		return err(new FsError(`Cannot copy a socket file: ${source}`));
	}
	else if(sourceStats.value.isFIFO()) {
		return err(new FsError(`Cannot copy a FIFO pipe: ${source}`));
	}

	return err(new FsError(`Unknown file: ${source}`));
} // }}}

async function onDir(sourceStat: Stats, destinationStat: BigIntStats | null, source: string, destination: string, options: CopyOptions<CopyFilterAsync>): Promise<FsVoidResult> { // {{{
	if(destinationStat) {
		return copyDir(source, destination, options);
	}

	const mkdResult = await mkdirs(destination);
	if(mkdResult.fails) {
		return mkdResult;
	}

	const cpResult = await copyDir(source, destination, options);
	if(cpResult.fails) {
		return cpResult;
	}

	const sdmResult = await fs.chmod(destination, sourceStat.mode);
	if(sdmResult.fails) {
		return sdmResult;
	}

	return OK;
} // }}}

async function copyDir(source: string, destination: string, options: CopyOptions<CopyFilterAsync>): Promise<FsVoidResult> { // {{{
	const dirResult = await openDir(source);
	if(dirResult.fails) {
		return dirResult;
	}

	const dir = dirResult.value;
	const close = xdefer(dir.close, dir);

	// eslint-disable-next-line no-constant-condition
	while(true) {
		const dirent = dir.readSync();
		if(dirent.fails) {
			return close(dirent);
		}

		if(dirent.value === null) {
			break;
		}

		const { name } = dirent.value;
		const sourceItem = path.join(source, name);
		const destinationItem = path.join(destination, name);

		const filterResult = await runFilter(sourceItem, destinationItem, options);
		if(filterResult.fails) {
			return filterResult;
		}

		if(!filterResult.value) {
			continue;
		}

		const checkResult = await checkPathsAsync(sourceItem, destinationItem, 'copy', options);
		if(checkResult.fails) {
			return close(checkResult);
		}

		const result = await getStatsAndPerformCopy(checkResult.value.destStat, sourceItem, destinationItem, options);
		if(result.fails) {
			return close(result);
		}
	}

	return close(OK);
} // }}}

async function onFile(sourceStat: Stats, destinationStat: BigIntStats | null, source: string, destination: string, options: CopyOptions): Promise<FsVoidResult> { // {{{
	if(!destinationStat) {
		return copyFile(sourceStat, source, destination, options);
	}

	if(options.overwrite) {
		const result = await fs.unlink(destination);
		if(result.fails) {
			return result;
		}

		return copyFile(sourceStat, source, destination, options);
	}

	if(options.errorOnExist) {
		return err(new FsError(`'${destination}' already exists`));
	}

	return OK;
} // }}}

async function copyFile(sourceStat: Stats, source: string, destination: string, options: CopyOptions): Promise<FsVoidResult> { // {{{
	const cpResult = await fs.copyFile(source, destination);
	if(cpResult.fails) {
		return cpResult;
	}

	if(options.preserveTimestamps) {
		// Make sure the file is writable before setting the timestamp
		// otherwise open fails with EPERM when invoked with 'r+'
		// (through utimes call)
		if(fileIsNotWritable(sourceStat.mode)) {
			const result = await makeFileWritable(destination, sourceStat.mode);
			if(result.fails) {
				return result;
			}
		}

		// Set timestamps and mode correspondingly

		// Note that The initial srcStat.atime cannot be trusted
		// because it is modified by the read(2) system call
		// (See https://nodejs.org/api/fs.html#fs_stat_time_values)
		const statResult = await fs.stat(source);
		if(statResult.fails) {
			return statResult;
		}

		const { atime, mtime } = statResult.value;

		const utResult = await utimesMillisAsync(destination, atime, mtime);
		if(utResult.fails) {
			return utResult;
		}
	}

	return fs.chmod(destination, sourceStat.mode);
} // }}}

function fileIsNotWritable(sourceMode: number): boolean { // {{{
	return (sourceMode & 0o200) === 0;
} // }}}

async function makeFileWritable(destination: string, sourceMode: number): Promise<FsVoidResult> { // {{{
	return fs.chmod(destination, sourceMode | 0o200);
} // }}}

async function onLink(destinationStat: BigIntStats | null, source: string, destination: string, options: CopyOptions): Promise<FsVoidResult> { // {{{
	let resolveResult = await fs.readlink(source);
	if(resolveResult.fails) {
		return resolveResult;
	}

	const resolvedSource = options.dereference ? path.resolve(process.cwd(), resolveResult.value) : resolveResult.value;

	if(!destinationStat) {
		return fs.symlink(resolvedSource, destination);
	}

	let resolvedDestination: string;

	resolveResult = await fs.readlink(destination);
	if(resolveResult.fails) {
		if(resolveResult.error.code === 'EINVAL' || resolveResult.error.code === 'UNKNOWN') {
			return fs.symlink(resolvedSource, destination);
		}

		return resolveResult;
	}
	else {
		resolvedDestination = resolveResult.value;
	}

	if(options.dereference) {
		resolvedDestination = path.resolve(process.cwd(), resolvedDestination);
	}

	// If both symlinks resolve to the same target, they are still distinct symlinks
	// that can be copied/overwritten. Only check subdirectory constraints when
	// the resolved paths are different.
	if(resolvedSource !== resolvedDestination) {
		if(isSourceSubdir(resolvedSource, resolvedDestination)) {
			return err(new FsError(`Cannot copy '${resolvedSource}' to a subdirectory of itself, '${resolvedDestination}'.`));
		}

		// do not copy if src is a subdir of dest since unlinking
		// dest in this case would result in removing src contents
		// and therefore a broken symlink would be created.
		if(isSourceSubdir(resolvedDestination, resolvedSource)) {
			return err(new FsError(`Cannot overwrite '${resolvedDestination}' with '${resolvedSource}'.`));
		}
	}

	// copy the link
	const ulResult = await fs.unlink(destination);
	if(ulResult.fails) {
		return ulResult;
	}

	return fs.symlink(resolvedSource, destination);
} // }}}
