/**
 * Build-time syntax highlighting, for fenced code blocks (wired into svmd via `highlight` in
 * vite.config.ts) and for demo sources (`demo-sources.ts`), so the site has one code theme.
 *
 * Renders both a light and a dark theme as CSS variables on every token (`defaultColor: false`),
 * so a block just follows the site's `.dark` class switch with no client-side work. `layout.css`
 * has the two small rules that pick the right variable pair.
 *
 * Not `@svmd/shiki`: that adapter doesn't expose `defaultColor: false`, so its dual-theme output
 * still carries an inline fallback `color`, which would need `!important` to override in dark
 * mode. Calling shiki directly avoids that.
 *
 * Built lazily rather than with a top-level `await`: this file is imported by `vite.config.ts`,
 * and a config graph that suspends on top-level await can deadlock the bundler.
 */
import { createHighlighter, type Highlighter } from 'shiki';
import type { Highlighter as SvmdHighlighter } from '@svmd/core';

// Code blocks run Catppuccin regardless of the shadcn theme around them, which stays neutral.
// Their backgrounds are the flavor's own, so a block reads as a tinted panel against the page.
const LIGHT = 'catppuccin-latte';
const DARK = 'catppuccin-mocha';

/** Languages the docs actually use. Anything else falls back to unhighlighted text. */
const LANGS = [
	'svelte',
	'typescript',
	'javascript',
	'json',
	'jsonc',
	'bash',
	'html',
	'css',
	'diff',
	'markdown'
];

let pending: Promise<Highlighter> | undefined;

function getHighlighter() {
	pending ??= createHighlighter({ themes: [LIGHT, DARK], langs: LANGS });
	return pending;
}

export async function highlight(code: string, lang: string | undefined | null): Promise<string> {
	const highlighter = await getHighlighter();
	const language = lang && LANGS.includes(lang) ? lang : 'text';

	return highlighter.codeToHtml(code.replace(/\n$/, ''), {
		lang: language,
		themes: { light: LIGHT, dark: DARK },
		defaultColor: false
	});
}

/**
 * `not-prose` keeps `@tailwindcss/typography` off a block that brings its own colors, and
 * `.docs-md-code` is what `DocsProse` hangs a copy button off, telling a fenced block apart from a
 * `<Preview>` code tab, which brings its own.
 */
export const highlightCode: SvmdHighlighter = async ({ value, lang }) =>
	`<div class="docs-md-code not-prose group">${await highlight(value, lang)}</div>`;
