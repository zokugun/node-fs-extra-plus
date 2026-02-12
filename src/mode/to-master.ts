import { isNumber, isString } from '@zokugun/is-it-type';
import { err, type Result } from '@zokugun/xtry';
import { numberToMaster } from './convert/number-to-master.js';
import { objectToMaster } from './convert/object-to-master.js';
import { octalToMaster } from './convert/octal-to-master.js';
import { statToMaster } from './convert/stat-to-master.js';
import { symbolicToMaster } from './convert/symbolic-to-master.js';
import { isObject } from './is-object.js';
import { isOctal } from './is-octal.js';
import { isStat } from './is-stat.js';
import { isSymbolic } from './is-symbolic.js';
import { type MasterMode } from './master-mode.js';
import { convertError } from './utils/convert-error.js';

export function toMaster(mode: unknown): Result<MasterMode, string> {
	if(isNumber(mode)) {
		return numberToMaster(mode);
	}

	if(isString(mode)) {
		const trimmed = mode.trim();
		if(trimmed.length === 0) {
			return err(convertError(mode, 'internal mode'));
		}

		if(isOctal(trimmed)) {
			return octalToMaster(trimmed);
		}

		if(isStat(trimmed)) {
			return statToMaster(trimmed);
		}

		if(isSymbolic(trimmed)) {
			return symbolicToMaster(trimmed);
		}

		return err(convertError(mode, 'internal mode'));
	}

	if(isObject(mode)) {
		return objectToMaster(mode);
	}

	return err(convertError(mode, 'internal mode'));
}
