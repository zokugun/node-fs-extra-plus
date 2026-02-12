import { ok, type Result } from '@zokugun/xtry';
import { type MasterMode } from '../master-mode.js';
import { normalizeOctal } from '../normalize-octal.js';
import { type OctalMode } from '../types.js';

export function octalToMaster(value: OctalMode): Result<MasterMode, string> {
	const normalization = normalizeOctal(value);
	if(normalization.fails) {
		return normalization;
	}

	const normalized = normalization.value.split('');
	const result: MasterMode = {
		updating: normalized[0] !== '=',
		special: false,
		typed: false,
	};
	const user = Number.parseInt(normalized[4], 8);
	const group = Number.parseInt(normalized[5], 8);
	const others = Number.parseInt(normalized[6], 8);
	const special = Number.parseInt(normalized[3], 8);

	if(result.updating) {
		const operator = normalized[0] as '+' | '-';

		if(user !== 0) {
			result.user = {};

			if(user & 4) {
				result.user.read = { operator, operand: true };
			}

			if(user & 2) {
				result.user.write = { operator, operand: true };
			}

			if(user & 1) {
				result.user.execute = { operator, operand: 'x' };
			}
		}

		if(group !== 0) {
			result.group = {};

			if(group & 4) {
				result.group.read = { operator, operand: true };
			}

			if(group & 2) {
				result.group.write = { operator, operand: true };
			}

			if(group & 1) {
				result.group.execute = { operator, operand: 'x' };
			}
		}

		if(others !== 0) {
			result.others = {};

			if(others & 4) {
				result.others.read = { operator, operand: true };
			}

			if(others & 2) {
				result.others.write = { operator, operand: true };
			}

			if(others & 1) {
				result.others.execute = { operator, operand: 'x' };
			}
		}

		if(special !== 0) {
			result.special = true;

			if(special & 1) {
				result.others ??= {};
				result.others.execute = { operator, operand: 's' };
			}

			if(special & 2) {
				result.group ??= {};
				result.group.execute = { operator, operand: 's' };
			}

			if(special & 4) {
				result.user ??= {};
				result.user.execute = { operator, operand: 's' };
			}
		}
	}
	else {
		result.special = special !== 0;

		result.user = {
			read: { operator: '=', operand: Boolean(user & 4) },
			write: { operator: '=', operand: Boolean(user & 2) },
		};

		result.group = {
			read: { operator: '=', operand: Boolean(group & 4) },
			write: { operator: '=', operand: Boolean(group & 2) },
		};

		result.others = {
			read: { operator: '=', operand: Boolean(others & 4) },
			write: { operator: '=', operand: Boolean(others & 2) },
		};

		if(special & 4) {
			result.user.execute = { operator: (user & 1) ? '=' : '-', operand: 's' };
		}
		else {
			result.user.execute = { operator: '=', operand: (user & 1) ? 'x' : '-' };
		}

		if(special & 2) {
			result.group.execute = { operator: (group & 1) ? '=' : '-', operand: 's' };
		}
		else {
			result.group.execute = { operator: '=', operand: (group & 1) ? 'x' : '-' };
		}

		if(special & 1) {
			result.others.execute = { operator: (others & 1) ? '=' : '-', operand: 's' };
		}
		else {
			result.others.execute = { operator: '=', operand: (others & 1) ? 'x' : '-' };
		}
	}

	return ok(result);
}
