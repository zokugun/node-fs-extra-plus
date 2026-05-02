export function stripBom(content: string | Buffer): string {
	if(Buffer.isBuffer(content)) {
		content = content.toString('utf8');
	}

	if(content.codePointAt(0) === 0xFE_FF) {
		return content.slice(1);
	}

	return content;
}

export const stripBOM = stripBom;
