/**
 * Build-time syntax highlighting.
 *
 * Shared by two consumers so the site only ever has one code theme: mdsvex fenced blocks
 * (wired in `svelte.config.js`) and demo sources (wired in `vite-plugin-coral-demos.js`).
 * Runs in Node at build time - shiki is never shipped to the browser.
 *
 * The highlighter is created lazily on first use rather than with a top-level `await`: this
 * module is reachable from both config files, and a config graph that suspends on TLA deadlocks
 * the bundler.
 */

import { createHighlighter } from 'shiki';

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

/** @type {Promise<import('shiki').Highlighter> | undefined} */
let pending;

function getHighlighter() {
	pending ??= createHighlighter({ themes: [LIGHT, DARK], langs: LANGS });
	return pending;
}

/**
 * Renders `code` as themed HTML carrying both light and dark colors as CSS variables.
 * `layout.css` picks the pair, so the code block follows the theme with no client-side work.
 *
 * @param {string} code
 * @param {string | undefined | null} lang
 * @returns {Promise<string>}
 */
export async function highlight(code, lang) {
	const highlighter = await getHighlighter();
	const language = lang && LANGS.includes(lang) ? lang : 'text';

	return highlighter.codeToHtml(code.replace(/\n$/, ''), {
		lang: language,
		themes: { light: LIGHT, dark: DARK },
		defaultColor: false
	});
}
