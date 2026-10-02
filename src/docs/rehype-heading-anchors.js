/**
 * Gives every `h2`/`h3` a stable id and a permalink anchor, at build time - the compiler already
 * has the real heading text, where `prose.svelte`'s old `$effect` had to wait for a mount and
 * re-derive it from `textContent`. Ids come from `slug.js`'s `slugifyAll`, the same function the
 * search index (`vite-plugin-coral-docs.js`) uses on its own extraction of the same headings, so a
 * search result's `#anchor` always lands where svmd actually rendered it.
 *
 * A plain rehype plugin - a function of the tree, wired into svmd's own MDAST -> HAST stage via
 * `rehypePlugins` in `vite.config.ts`. No adapter needed for an ecosystem svmd is already built on.
 */

import { slugifyAll } from './slug.js';

const LEVELS = { h2: 2, h3: 3 };

/** @param {import('hast').Nodes} node @returns {string} */
function text(node) {
	if (node.type === 'text') return node.value;
	if (!('children' in node)) return '';
	return node.children.map(text).join('');
}

/** @param {import('hast').Root} tree @returns {import('hast').Element[]} */
function headingsIn(tree) {
	/** @type {import('hast').Element[]} */
	const found = [];

	/** @param {import('hast').Nodes} node */
	function walk(node) {
		if (node.type === 'element' && node.tagName in LEVELS) found.push(node);
		if ('children' in node) node.children.forEach(walk);
	}

	walk(tree);
	return found;
}

/** @returns {import('hast').Element} */
function linkIcon() {
	return {
		type: 'element',
		tagName: 'svg',
		properties: {
			xmlns: 'http://www.w3.org/2000/svg',
			width: 14,
			height: 14,
			viewBox: '0 0 24 24',
			fill: 'none',
			stroke: 'currentColor',
			strokeWidth: '2',
			strokeLinecap: 'round',
			strokeLinejoin: 'round'
		},
		children: [
			{
				type: 'element',
				tagName: 'path',
				properties: { d: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' },
				children: []
			},
			{
				type: 'element',
				tagName: 'path',
				properties: { d: 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' },
				children: []
			}
		]
	};
}

/** @returns {(tree: import('hast').Root) => void} */
export function rehypeHeadingAnchors() {
	return (tree) => {
		const headings = headingsIn(tree);
		const ids = slugifyAll(headings.map(text));

		headings.forEach((node, i) => {
			node.properties.id = ids[i];
			node.children.push({
				type: 'element',
				tagName: 'a',
				properties: {
					href: `#${ids[i]}`,
					className: ['docs-anchor'],
					tabIndex: -1,
					ariaLabel: `Link to ${text(node)}`
				},
				children: [linkIcon()]
			});
		});
	};
}
