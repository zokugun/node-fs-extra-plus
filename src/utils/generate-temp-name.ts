import crypto from 'node:crypto';

export function generateTempName(): string {
	return crypto.randomBytes(8).toString('hex');
}
