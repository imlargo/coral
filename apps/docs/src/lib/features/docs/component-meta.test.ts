import { describe, expect, it } from 'vitest';
import { componentMeta } from './component-meta.ts';

describe('componentMeta', () => {
	it('follows imports into lib/ transitively', async () => {
		const meta = await componentMeta('kit/number-input');
		// number-input reaches lib/number-field, which reaches lib/number, which reaches lib/intl.
		expect(meta?.lib).toEqual(
			expect.arrayContaining(['lib/defaults', 'lib/intl', 'lib/number', 'lib/number-field'])
		);
	});

	it('lists the files a manual copy needs, and leaves tests out', async () => {
		const meta = await componentMeta('kit/combobox');
		expect(meta?.files).toContain('kit/combobox/combobox.svelte');
		expect(meta?.files).toContain('lib/fold.ts');
		expect(meta?.files.some((file) => /\.test\./.test(file))).toBe(false);
		expect(meta?.item).toBe('kit-combobox');
	});

	it('knows nothing outside the manifest', async () => {
		expect(await componentMeta('kit/nothing')).toBeUndefined();
	});
});
