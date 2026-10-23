/**
 * Gives every heading in a compiled Markdown page an `id`, at build time, through svmd's
 * `rehypePlugins` in vite.config.ts.
 *
 * Without it, ids only appear once the table of contents hydrates and invents them, so a link to
 * `/docs/page#section` - from search, or pasted by a reader - has nothing to land on when the page
 * first loads. The ids come from `createHeadingIds`, which the search index shares.
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

function textOf(node: HastNode): string {
	if (node.type === 'text') return node.value ?? '';
	return (node.children ?? []).map(textOf).join('');
}

export function rehypeHeadingIds() {
	return (tree: HastNode) => {
		const nextId = createHeadingIds();

		const visit = (node: HastNode) => {
			if (node.type === 'element' && node.tagName && HEADING.test(node.tagName)) {
				const id = nextId(textOf(node));
				if (id) node.properties = { ...node.properties, id };
			}
			node.children?.forEach(visit);
		};

		visit(tree);
	};
}
