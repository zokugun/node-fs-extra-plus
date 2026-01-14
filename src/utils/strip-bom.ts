export function stripBom(content: string | Buffer): string {
	if(Buffer.isBuffer(content)) {
		content = content.toString('utf8');
	}

	return content.replace(/^\uFEFF/, '');
}
