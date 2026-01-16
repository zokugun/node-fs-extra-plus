import path from 'node:path';
import { err, OK } from '@zokugun/xtry/async';
import { copy } from '../copy/async.js';
import { rename } from '../fs/async.js';
import { mkdirs } from '../make-dir/async.js';
import { pathExists } from '../path-exists/async.js';
import { remove } from '../remove/async.js';
import { FsError } from '../types/fs-error.js';
import { type FsVoidResult } from '../types/fs-void-result.js';
import { checkParentPathsAsync } from '../utils/check-parent-paths-async.js';
import { checkPathsAsync } from '../utils/check-paths-async.js';

type MoveOptions = {
	dereference?: boolean;
	overwrite?: boolean;
	clobber?: boolean;
};

export async function move(source: string, destination: string, options: MoveOptions = {}): Promise<FsVoidResult> {
	const overwrite = Boolean(options.overwrite ?? options.clobber);

	const checkPathsResult = await checkPathsAsync(source, destination, 'move', options);
	if(checkPathsResult.fails) {
		return checkPathsResult;
	}

	const { srcStat, isChangingCase = false } = checkPathsResult.value;

	const checkParentResult = await checkParentPathsAsync(source, srcStat, destination, 'move');
	if(checkParentResult.fails) {
		return checkParentResult;
	}

	// If the parent of dest is not root, make sure it exists before proceeding
	const destinationParent = path.dirname(destination);
	const parsedParentPath = path.parse(destinationParent);
	if(parsedParentPath.root !== destinationParent) {
		const mdResult = await mkdirs(destinationParent);
		if(mdResult.fails) {
			return mdResult;
		}
	}

	if(!isChangingCase) {
		if(overwrite) {
			const result = await remove(destination);
			if(result.fails) {
				return result;
			}
		}
		else {
			const xstResult = await pathExists(destination);
			if(xstResult.value) {
				return err(new FsError('dest already exists.'));
			}
		}
	}

	// Try w/ rename first, and try copy + remove if EXDEV
	const rnResult = await rename(source, destination);
	if(rnResult.fails) {
		if(rnResult.error.code !== 'EXDEV') {
			return rnResult;
		}

		// move across devices
		const options = {
			overwrite,
			errorOnExist: true,
			preserveTimestamps: true,
		};

		const cpResult = await copy(source, destination, options);
		if(cpResult.fails) {
			return cpResult;
		}

		return remove(source);
	}

	return OK;
}
