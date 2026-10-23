/**
 * Gives every heading in a compiled Markdown page an `id`, at build time, through svmd's
 * `rehypePlugins` in vite.config.ts.
 *
 * Without it, ids only appear once the table of contents hydrates and invents them, so a link to
 * `/docs/page#section` - from search, or pasted by a reader - has nothing to land on when the page
 * first loads. The ids come from `createHeadingIds`, which the search index shares.
 *
 * `h2` and `h3` also get a permalink to themselves, the `.docs-anchor` that `layout.css` reveals on
 * hover. It is left out of the tab order: the heading's id is what a reader links to, and a stop
 * per section would be noise for anyone tabbing through the page.
 */
import { createHeadingIds } from './heading-ids.ts';

/** The slice of hast this plugin reads. svmd's tree carries more node types than these. */
type HastNode = {
	type: string;
	tagName?: string;
	value?: string;
	properties?: Record<string, unknown>;
	children?: HastNode[];
};

const HEADING = /^h[1-6]$/;
const WITH_PERMALINK = new Set(['h2', 'h3']);

/** Lucide's `link`, inlined: the tree is plain hast, with no Svelte component to render one. */
function linkIcon(): HastNode {
	const path = (d: string): HastNode => ({
		type: 'element',
		tagName: 'path',
		properties: { d },
		children: []
	});

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
			strokeLinejoin: 'round',
			ariaHidden: 'true'
		},
		children: [
			path('M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71'),
			path('M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71')
		]
	};
}

function textOf(node: HastNode): string {
	if (node.type === 'text') return node.value ?? '';
	return (node.children ?? []).map(textOf).join('');
}

export function rehypeHeadingIds() {
	return (tree: HastNode) => {
		const nextId = createHeadingIds();

		const visit = (node: HastNode) => {
			if (node.type === 'element' && node.tagName && HEADING.test(node.tagName)) {
				const text = textOf(node);
				const id = nextId(text);
				if (id) node.properties = { ...node.properties, id };
				if (id && WITH_PERMALINK.has(node.tagName)) {
					node.children = [
						...(node.children ?? []),
						{
							type: 'element',
							tagName: 'a',
							properties: {
								href: `#${id}`,
								className: ['docs-anchor'],
								tabIndex: -1,
								ariaLabel: `Link to ${text}`
							},
							children: [linkIcon()]
						}
					];
					// The permalink is not a heading's text, and nothing below it is a heading either.
					return;
				}
			}
			node.children?.forEach(visit);
		};

		visit(tree);
	};
}
