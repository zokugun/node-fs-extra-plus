import path from 'node:path';

// return true if destination is a subdirectory of source, otherwise false.
// It only checks the path strings.
export function isSourceSubdir(source: string, destination: string): boolean {
	const sourceSegments = path.resolve(source).split(path.sep).filter(Boolean);
	const destinationSegments = path.resolve(destination).split(path.sep).filter(Boolean);

	return sourceSegments.every((segment, index) => destinationSegments[index] === segment);
}
