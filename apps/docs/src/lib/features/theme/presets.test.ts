import { describe, expect, it } from 'vitest';
import { DEFAULT_THEME, parseThemeChoice, themeCss } from './presets.ts';

describe('parseThemeChoice', () => {
	it('keeps a choice the site still offers', () => {
		expect(parseThemeChoice({ base: 'stone', accent: 'blue', radius: 0.5 })).toEqual({
			base: 'stone',
			accent: 'blue',
			radius: 0.5
		});
	});

	it('drops an accent that is no longer offered, and keeps the rest', () => {
		expect(parseThemeChoice({ base: 'zinc', accent: 'chartreuse', radius: 1 })).toEqual({
			base: 'zinc',
			accent: undefined,
			radius: 1
		});
	});

	it('rejects anything without a known base and radius', () => {
		expect(parseThemeChoice({ base: 'plaid', radius: 0.5 })).toBeUndefined();
		expect(parseThemeChoice({ base: 'zinc', radius: 3 })).toBeUndefined();
		expect(parseThemeChoice('neutral')).toBeUndefined();
		expect(parseThemeChoice(null)).toBeUndefined();
	});
});

describe('themeCss', () => {
	it('writes the radius once, in the light block', () => {
		const css = themeCss({ ...DEFAULT_THEME, radius: 0.3 });
		expect(css.match(/--radius:/g)).toHaveLength(1);
		expect(css).toContain('--radius: 0.3rem;');
	});

	it('lays the accent over the base', () => {
		const css = themeCss({ base: 'neutral', accent: 'blue', radius: 0.625 });
		expect(css).toContain('--primary: oklch(0.488 0.243 264.376);');
		expect(css).toContain('--background: oklch(1 0 0);');
	});

	it('uses the selectors it is given', () => {
		const css = themeCss(DEFAULT_THEME, { light: 'html:root', dark: 'html:root.dark' });
		expect(css.startsWith('html:root {')).toBe(true);
		expect(css).toContain('html:root.dark {');
	});
});
