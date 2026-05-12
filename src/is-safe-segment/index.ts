export function isSafeSegment(name: string): boolean {
	const trimmed = name.trim();

	return trimmed.length > 0
		&& trimmed !== '.'
		&& trimmed !== '..'
		&& !trimmed.includes('/')
		&& !trimmed.includes('\\')
		&& !trimmed.includes('\0');
}
