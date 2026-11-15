import { ACCENT_COLORS, BASE_COLORS, type Tokens } from '#lib/features/theme/colors.js';

/** In rem. `0.625` is the value shadcn-svelte installs, and what the site renders by default. */
export const RADII = [0, 0.3, 0.5, 0.625, 0.75, 1] as const;

export type BaseColor = (typeof BASE_COLORS)[number]['name'];
export type AccentColor = (typeof ACCENT_COLORS)[number]['name'];
export type Radius = (typeof RADII)[number];

export interface ThemeChoice {
	base: BaseColor;
	/** `undefined` keeps the base color's own primary. */
	accent?: AccentColor;
	radius: Radius;
}

export const DEFAULT_THEME: ThemeChoice = { base: 'neutral', radius: 0.625 };

export function isDefaultTheme(choice: ThemeChoice): boolean {
	return (
		choice.base === DEFAULT_THEME.base &&
		choice.accent === DEFAULT_THEME.accent &&
		choice.radius === DEFAULT_THEME.radius
	);
}

/** Reads back a choice that came from storage, dropping anything this version no longer offers. */
export function parseThemeChoice(value: unknown): ThemeChoice | undefined {
	if (typeof value !== 'object' || value === null) return undefined;
	const { base, accent, radius } = value as Record<string, unknown>;
	const knownBase = BASE_COLORS.find((preset) => preset.name === base);
	const knownAccent = ACCENT_COLORS.find((preset) => preset.name === accent);
	const knownRadius = RADII.find((r) => r === radius);
	if (!knownBase || knownRadius === undefined) return undefined;
	return { base: knownBase.name, accent: knownAccent?.name, radius: knownRadius };
}

/** The light and dark tokens a choice resolves to, accent over base. */
export function themeTokens(choice: ThemeChoice): { light: Tokens; dark: Tokens } {
	const base = BASE_COLORS.find((preset) => preset.name === choice.base) ?? BASE_COLORS[0];
	const accent = ACCENT_COLORS.find((preset) => preset.name === choice.accent);
	return {
		light: { ...base.light, ...accent?.light, radius: `${choice.radius}rem` },
		dark: { ...base.dark, ...accent?.dark }
	};
}

const block = (selector: string, tokens: Tokens) =>
	`${selector} {\n${Object.entries(tokens)
		.map(([name, value]) => `\t--${name}: ${value};`)
		.join('\n')}\n}`;

/**
 * The CSS a choice comes down to. With the default selectors it is what a project pastes into its
 * own stylesheet; the site passes stronger ones so its copy wins over the theme it already loaded.
 */
export function themeCss(
	choice: ThemeChoice,
	selectors = { light: ':root', dark: '.dark' }
): string {
	const { light, dark } = themeTokens(choice);
	return `${block(selectors.light, light)}\n\n${block(selectors.dark, dark)}\n`;
}
