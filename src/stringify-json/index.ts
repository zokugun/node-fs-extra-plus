import { type StringifyJsonOptions } from '../types/stringify-json.js';

export function stringifyJson(object: any, { EOL = '\n', finalEOL = true, replacer = null, spaces }: StringifyJsonOptions = {}): string {
	const endOfFile = finalEOL ? EOL : '';

	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
	const content = JSON.stringify(object, replacer as any, spaces);

	return content.replaceAll('\n', EOL) + endOfFile;
}

export const stringifyJSON = stringifyJson;
