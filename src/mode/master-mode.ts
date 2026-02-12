export type MasterPermission = {
	read?: MasterPermissionRWEntry;
	write?: MasterPermissionRWEntry;
	execute?: MasterPermissionXEntry;
};

export type MasterPermissionRWEntry = {
	operator: '+' | '-' | '=';
	operand: boolean;
};

export type MasterPermissionXEntry = {
	operator: '+' | '-' | '=';
	operand: '-' | 's' | 'x' | 'X';
};

export type MasterPermissionEntry = MasterPermissionRWEntry | MasterPermissionXEntry;

export type MasterMode = {
	updating: boolean;
	special: boolean;
	typed: boolean;
	user?: MasterPermission;
	group?: MasterPermission;
	others?: MasterPermission;
	fileType?: 'b' | 'c' | 'd' | 'D' | 'l' | 'p' | 'r' | 's';
};
