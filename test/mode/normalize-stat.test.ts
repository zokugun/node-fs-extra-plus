import { expect, it } from 'vitest';
import fse from '../../src/index.js';
import { testname } from './utils/testname.js';

const tests = [
	// Invalid
	{ input: 'rwwrwxrwx', error: 'Cannot normalize stat: "rwwrwxrwx"' },
	{ input: '--------j', error: 'Cannot normalize stat: "--------j"' },
	{ input: '--------+', error: 'Cannot normalize stat: "--------+"' },
	{ input: 'Br--------', error: 'Cannot normalize stat: "Br--------"' },
	{ input: '--------s', error: 'Cannot normalize stat: "--------s"' },
	{ input: '--------S', error: 'Cannot normalize stat: "--------S"' },
	{ input: '-----t---', error: 'Cannot normalize stat: "-----t---"' },
	{ input: '-----T---', error: 'Cannot normalize stat: "-----T---"' },
	{ input: '--t------', error: 'Cannot normalize stat: "--t------"' },
	{ input: '--T------', error: 'Cannot normalize stat: "--T------"' },
	{ input: '--------', error: 'Cannot normalize stat: "--------"' },
	{ input: '-- ---- ---', error: 'Cannot normalize stat: "-- ---- ---"' },
	{ input: '-----------', error: 'Cannot normalize stat: "-----------"' },

	// Each permission
	{ input: '--------x', value: '--------x' },
	{ input: '-------w-', value: '-------w-' },
	{ input: '------r--', value: '------r--' },
	{ input: '-----x---', value: '-----x---' },
	{ input: '----w----', value: '----w----' },
	{ input: '---r-----', value: '---r-----' },
	{ input: '--x------', value: '--x------' },
	{ input: '-w-------', value: '-w-------' },
	{ input: 'r--------', value: 'r--------' },

	// Extremes
	{ input: '---------', value: '---------' },
	{ input: 'rwxrwxrwx', value: 'rwxrwxrwx' },

	// Combining
	{ input: '-------wx', value: '-------wx' },

	// Special permissions
	{ input: '--------X', value: '--------X' },
	{ input: '-----X---', value: '-----X---' },
	{ input: '--X------', value: '--X------' },
	{ input: '--------T', value: '--------T' },
	{ input: '--------t', value: '--------t' },
	{ input: '-----s---', value: '-----s---' },
	{ input: '-----S---', value: '-----S---' },
	{ input: '--s------', value: '--s------' },
	{ input: '--S------', value: '--S------' },

	// Whitespace
	{ input: ' --------x ', value: '--------x' },
	{ input: '  ---  ---  --x', value: '--------x' },

	// File types
	{ input: 'drw-------', value: 'drw-------' },
	{ input: 'lr--------', value: 'lr--------' },
	{ input: 'pr--------', value: 'pr--------' },
	{ input: 'sr--------', value: 'sr--------' },
	{ input: 'cr--------', value: 'cr--------' },
	{ input: 'br--------', value: 'br--------' },
	{ input: 'Dr--------', value: 'Dr--------' },

	// Changing order
	{ input: 'rxwrwxrwx', value: 'rwxrwxrwx' },

	{ input: 'rwxr-xr-x', value: 'rwxr-xr-x' },
];

for(const { input, error, value } of tests) {
	it(`normalizeStat - ${testname(input)}`, () => {
		const result = fse.mode.normalizeStat(input);
		if(error) {
			expect(result.fails).to.be.true;
			expect(result.error).to.equals(error);
		}
		else {
			expect(result.fails).to.be.false;
			expect(result.value).to.equals(value);
		}
	});
}
