import { isString } from '@zokugun/is-it-type';
import { type Result } from '@zokugun/xtry';
import { masterToNumber } from '../convert/master-to-number.js';
import { masterToObject } from '../convert/master-to-object.js';
import { masterToOctal } from '../convert/master-to-octal.js';
import { masterToStat } from '../convert/master-to-stat.js';
import { masterToSymbolic } from '../convert/master-to-symbolic.js';
import { isNumber } from '../is-number.js';
import { isOctal } from '../is-octal.js';
import { isStat } from '../is-stat.js';
import { type MasterMode } from '../master-mode.js';
import { type Mode } from '../types.js';

export function masterTo(mode: MasterMode, targetMode: Mode): Result<Mode, string> {
	if(isNumber(targetMode)) {
		return masterToNumber(mode);
	}
	else if(isString(targetMode)) {
		if(isOctal(targetMode)) {
			return masterToOctal(mode);
		}
		else if(isStat(targetMode)) {
			return masterToStat(mode);
		}
		else {
			return masterToSymbolic(mode);
		}
	}
	else {
		return masterToObject(mode);
	}
}
