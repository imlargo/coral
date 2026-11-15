import { describe, expect, it } from 'vitest';
import { summarizeReleases } from './releases.ts';

const changelog = `Intro text.

## 2026-11-14

- \`kit/gauge\` 1.0.0: new. A reading drawn as an arc.

## 2026-11-01

- \`kit/combobox\` 1.3.0: New \`oncreate\`.
`;

describe('summarizeReleases', () => {
	it('reads the newest day', () => {
		expect(summarizeReleases(changelog).latest).toBe('2026-11-14');
	});

	it('reads an empty changelog as no release', () => {
		expect(summarizeReleases('')).toEqual({ latest: undefined });
	});
});
