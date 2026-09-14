/**
 * Adapts the shared Shiki highlighter (`shiki.js`) to svmd's `Highlighter` contract
 * (`{ value, lang } -> string`), and wraps the result the same way the old mdsvex wiring did -
 * `prose.svelte` hangs its copy button off `.docs-md-code`, telling it apart from a `<Preview>`
 * code tab, which brings its own.
 */

import { highlight } from './shiki.js';

/** @type {import('@svmd/core').Highlighter} */
export async function svmdHighlight({ value, lang }) {
	return `<div class="docs-md-code group">${await highlight(value, lang)}</div>`;
}
