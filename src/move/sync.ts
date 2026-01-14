import path from 'node:path';
import { err, OK } from '@zokugun/xtry/sync';
import { copy } from '../copy/sync.js';
import { rename } from '../fs/sync.js';
import { mkdirs } from '../make-dir/sync.js';
import { pathExists } from '../path-exists/sync.js';
import { remove } from '../remove/sync.js';
import { checkParentPathsSync } from '../utils/check-parent-paths-sync.js';
import { checkPathsSync } from '../utils/check-paths-sync.js';
import { FsError } from '../utils/error.js';
import { type FsVoidResult } from '../utils/types.js';

type MoveOptions = {
	dereference?: boolean;
	overwrite?: boolean;
	clobber?: boolean;
};

export function move(source: string, destination: string, options: MoveOptions = {}): FsVoidResult {
	const overwrite = Boolean(options.overwrite ?? options.clobber);

	const checkPathsResult = checkPathsSync(source, destination, 'move', options);
	if(checkPathsResult.fails) {
		return checkPathsResult;
	}

	const { srcStat, isChangingCase = false } = checkPathsResult.value;

	const checkParentResult = checkParentPathsSync(source, srcStat, destination, 'move');
	if(checkParentResult.fails) {
		return checkParentResult;
	}

	// If the parent of dest is not root, make sure it exists before proceeding
	const destinationParent = path.dirname(destination);
	const parsedParentPath = path.parse(destinationParent);
	if(parsedParentPath.root !== destinationParent) {
		const mdResult = mkdirs(destinationParent);
		if(mdResult.fails) {
			return mdResult;
		}
	}

	if(!isChangingCase) {
		if(overwrite) {
			const result = remove(destination);
			if(result.fails) {
				return result;
			}
		}
		else {
			const xstResult = pathExists(destination);
			if(xstResult.value) {
				return err(new FsError('dest already exists.'));
			}
		}
	}

	// Try w/ rename first, and try copy + remove if EXDEV
	const rnResult = rename(source, destination);
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

		const cpResult = copy(source, destination, options);
		if(cpResult.fails) {
			return cpResult;
		}

		return remove(source);
	}

	return OK;
}
