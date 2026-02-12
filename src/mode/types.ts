export type NumberMode = number;

// object
export type PermissionRecord = {
	read?: boolean;
	write?: boolean;
	execute?: boolean;
};

export type SpecialRecord = {
	setuid?: boolean;
	setgid?: boolean;
	sticky?: boolean;
};

export type ObjectMode = {
	all?: PermissionRecord;
	user?: PermissionRecord;
	group?: PermissionRecord;
	others?: PermissionRecord;
	special?: SpecialRecord;
};

// octal
type OctalDigit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7';
// type OctalTriplet = `${OctalDigit}${OctalDigit}${OctalDigit}`;		// e.g. "755"
// type OctalQuad = `${OctalDigit}${OctalTriplet}`;					// four-digit modes including special bits
// type OctalDigits = OctalTriplet | OctalQuad;
type OptionalOperator = '+' | '-' | '=' | '';
type OptionalLeading = '' | '0' | '00' | '0o' | '0O';

// export type OctalMode = `${OptionalOperator}${OptionalLeading}${OctalDigits}`;
export type OctalMode = `${OptionalOperator}${OptionalLeading}${OctalDigit}${string}`;

// stat
type RChar = 'r' | '-';
type WChar = 'w' | '-';
type XChar = 's' | 'S' | 't' | 'T' | 'x' | 'X' | '-';
export type FileType = 'd' | 'l' | 'p' | 's' | 'c' | 'b' | 'D' | '-';
type OptionalFileType = FileType | '';

// export type StatMode = `${FileType}${RChar}${WChar}${XChar}${RChar}${WChar}${XChar}${RChar}${WChar}${XChar}` | `${RChar}${WChar}${XChar}${RChar}${WChar}${XChar}${RChar}${WChar}${XChar}`
export type StatMode = `${OptionalFileType}${RChar}${WChar}${XChar}${string}`;

// symbolic
type WhoChar = 'u' | 'g' | 'o' | 'a';
// type Who1 = `${WhoChar}`;
// type Who2 = `${WhoChar}${WhoChar}`;
// type Who3 = `${WhoChar}${WhoChar}${WhoChar}`;
// type Who4 = `${WhoChar}${WhoChar}${WhoChar}${WhoChar}`;
// type WhoAny = Who1 | Who2 | Who3 | Who4;

// type SymPerm = 'r' | 'w' | 'x' | 's' | 't';
// type P1 = `${SymPerm}`;
// type P2 = `${SymPerm}${SymPerm}`;
// type P3 = `${SymPerm}${SymPerm}${SymPerm}`;
// type P4 = `${SymPerm}${SymPerm}${SymPerm}${SymPerm}`;
// type P5 = `${SymPerm}${SymPerm}${SymPerm}${SymPerm}${SymPerm}`;
// type PermsAny = P1 | P2 | P3 | P4 | P5;

// type SymOp = '+' | '-' | '=';

// type Clause = `${WhoAny}${SymOp}${PermsAny}`;
// type Clause2 = `${Clause},${Clause}`;
// type Clause3 = `${Clause2},${Clause}`;
// type Clause4 = `${Clause3},${Clause}`;

// export type SymbolicMode =
// 	| Clause
// 	| Clause2
// 	| Clause3
// 	| Clause4;

export type SymbolicMode = `${WhoChar}${string}` | '';

export type ModeType = 'number' | 'object' | 'octal' | 'stat' | 'symbolic';
export type Mode = NumberMode | ObjectMode | OctalMode | StatMode | SymbolicMode;
