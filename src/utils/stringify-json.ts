type ReplacerType = ((key: string, value: any) => any) | Array<number | string> | undefined | null;

export type StringifyJsonOptions = {
	EOL?: string;
	finalEOL?: boolean;
	replacer?: ReplacerType;
	spaces?: string | number;
};

export function stringifyJson(object: any, { EOL = '\n', finalEOL = true, replacer = null, spaces }: StringifyJsonOptions = {}): string {
	const endOfFile = finalEOL ? EOL : '';
	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
	const str = JSON.stringify(object, replacer as any, spaces);

	return str.replaceAll('\n', EOL) + endOfFile;
}
