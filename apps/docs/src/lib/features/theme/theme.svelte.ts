import { getContext, setContext } from 'svelte';
import {
	DEFAULT_THEME,
	isDefaultTheme,
	parseThemeChoice,
	themeCss,
	type ThemeChoice
} from '#lib/features/theme/presets.js';

/** `app.html` reads these two before the page paints, so a chosen theme never flashes the default. */
const CHOICE_KEY = 'coral-docs-theme';
const CSS_KEY = 'coral-docs-theme-css';
const STYLE_ID = 'coral-docs-theme';

// One element more specific than the `:root` and `.dark` the stylesheet sets, so the order the two
// arrive in never decides which wins.
const SELECTORS = { light: 'html:root', dark: 'html:root.dark' };

export class SiteTheme {
	choice = $state<ThemeChoice>(DEFAULT_THEME);

	constructor() {
		if (typeof localStorage === 'undefined') return;
		try {
			const stored = localStorage.getItem(CHOICE_KEY);
			this.choice = parseThemeChoice(stored && JSON.parse(stored)) ?? DEFAULT_THEME;
		} catch {
			// Storage blocked or holding something unreadable: the default theme is the right answer.
		}
	}

	get isDefault(): boolean {
		return isDefaultTheme(this.choice);
	}

	set(change: Partial<ThemeChoice>) {
		this.choice = { ...this.choice, ...change };
		this.#apply();
	}

	reset() {
		this.choice = DEFAULT_THEME;
		this.#apply();
	}

	#apply() {
		const css = this.isDefault ? '' : themeCss(this.choice, SELECTORS);
		let style = document.getElementById(STYLE_ID);
		if (!css) style?.remove();
		else {
			style ??= document.head.appendChild(
				Object.assign(document.createElement('style'), { id: STYLE_ID })
			);
			style.textContent = css;
		}

		try {
			if (css) {
				localStorage.setItem(CHOICE_KEY, JSON.stringify(this.choice));
				localStorage.setItem(CSS_KEY, css);
			} else {
				localStorage.removeItem(CHOICE_KEY);
				localStorage.removeItem(CSS_KEY);
			}
		} catch {
			// Not remembered across visits, but applied to this one.
		}
	}
}

const KEY = Symbol('site-theme');

export function setSiteTheme(theme: SiteTheme): SiteTheme {
	return setContext(KEY, theme);
}

export function getSiteTheme(): SiteTheme {
	return getContext<SiteTheme>(KEY);
}
