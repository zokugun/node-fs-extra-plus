
import { type PlatformPath } from '@zokugun/fs-path';
import * as path from '@zokugun/fs-path';

const defaultExport: typeof path & { PlatformPath: PlatformPath } = {
	PlatformPath: undefined as unknown as PlatformPath,
	...path,
};

export * from '@zokugun/fs-path';

export {
	defaultExport as default,
};
