type ReplacerType = ((key: string, value: any) => any) | Array<number | string> | undefined | null;

export type StringifyJsonOptions = {
	EOL?: '\n' | '\r' | '\r\n';
	finalEOL?: boolean;
	replacer?: ReplacerType;
	spaces?: string | number;
};
