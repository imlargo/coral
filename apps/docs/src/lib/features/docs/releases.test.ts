import { describe, expect, it } from 'vitest';
import { summarizeReleases } from './releases.ts';

const changelog = `Intro text.

## 2026-11-14

- \`kit/gauge\` 1.0.0: new. A reading drawn as an arc.
- \`kit/tags-input\` 1.2.1: Enter while composing.

## 2026-11-01

- \`kit/tags-input\` 1.2.0: new. Was here first.
- \`kit/combobox\` 1.3.0: New \`oncreate\`.

## 2026-09-01

- \`kit/select\` 1.1.0: Too old to count.
`;

describe('summarizeReleases', () => {
	it('reads the newest day', () => {
		expect(summarizeReleases(changelog).latest).toBe('2026-11-14');
	});

	it('marks what arrived and what changed in the month before the newest day', () => {
		expect(summarizeReleases(changelog).badges).toEqual({
			'kit/gauge': 'New',
			'kit/tags-input': 'New',
			'kit/combobox': 'Updated'
		});
	});

	it('reads an empty changelog as nothing recent', () => {
		expect(summarizeReleases('')).toEqual({ latest: undefined, badges: {} });
	});
});
