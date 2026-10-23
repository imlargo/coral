import { describe, expect, it } from 'vitest';
import { rehypeHeadingIds } from '../rehype-heading-ids.ts';
import { docsHref, extractSections } from './extract.ts';

const page = (body: string, frontmatter = 'title: Guide\ngroup: Basics\ndescription: A guide.') =>
	`---\n${frontmatter}\n---\n\n${body}`;

describe('docsHref', () => {
	it('maps a file to its route', () => {
		expect(docsHref('installation.md')).toBe('/docs/installation');
		expect(docsHref('guides/routing.md')).toBe('/docs/guides/routing');
	});

	it('treats an index as its folder', () => {
		expect(docsHref('index.md')).toBe('/docs');
		expect(docsHref('guides/index.md')).toBe('/docs/guides');
	});
});

describe('extractSections', () => {
	it("starts with the page's own entry: description first, then text before any heading", () => {
		const [own] = extractSections(page('Some intro.\n\n## First\n\nBody.'), '/docs/guide');

		expect(own).toMatchObject({
			id: '/docs/guide',
			anchor: '',
			pageTitle: 'Guide',
			group: 'Basics',
			heading: '',
			level: 0,
			text: 'A guide. Some intro.'
		});
	});

	it('starts a section at each heading down to h3, and folds deeper ones into it', () => {
		const sections = extractSections(
			page('## One\n\nAlpha.\n\n### Two\n\nBeta.\n\n#### Three\n\nGamma.'),
			'/docs/guide'
		);

		expect(sections.map((s) => [s.heading, s.level, s.anchor])).toEqual([
			['', 0, ''],
			['One', 2, 'one'],
			['Two', 3, 'two']
		]);
		// The h4 is not a section, but its words are still searchable.
		expect(sections[2].text).toBe('Beta. Three Gamma.');
	});

	it('links a section by its own id', () => {
		const sections = extractSections(page('## Clone and install\n\nText.'), '/docs/guide');
		expect(sections[1].id).toBe('/docs/guide#clone-and-install');
	});

	it('numbers repeated headings the way the page does', () => {
		const sections = extractSections(page('## Props\n\nA.\n\n## Props\n\nB.'), '/docs/guide');
		expect(sections.map((s) => s.anchor)).toEqual(['', 'props', 'props-2']);
	});

	it('does not let a heading take the id of the skip-link target', () => {
		const sections = extractSections(page('## Main content\n\nText.'), '/docs/guide');
		expect(sections[1].anchor).toBe('main-content-2');
	});

	it('keeps code, and does not mistake a shell comment for a heading', () => {
		const sections = extractSections(
			page('## Setup\n\n```bash\n# install it\npnpm install\n```\n\nDone.'),
			'/docs/guide'
		);

		expect(sections.map((s) => s.heading)).toEqual(['', 'Setup']);
		expect(sections[1].text).toBe('# install it pnpm install Done.');
	});

	it('does not close a fence early on a shorter one', () => {
		const sections = extractSections(
			page('## A\n\n````md\n```\n## not a heading\n```\n````'),
			'/x'
		);
		expect(sections.map((s) => s.heading)).toEqual(['', 'A']);
	});

	it('strips links, emphasis and tags down to their words', () => {
		const [own] = extractSections(
			page('Read the **guide** at [the site](https://example.com) and <b>more</b>.'),
			'/x'
		);
		expect(own.text).toBe('A guide. Read the guide at the site and more .');
	});

	it('keeps braces written in code, and drops Svelte syntax', () => {
		const [own] = extractSections(
			page('Use `{#if}` blocks. {#if open}\nShown\n{/if}\nHello {name}.'),
			'/x'
		);
		expect(own.text).toBe('A guide. Use {#if} blocks. Shown Hello .');
	});

	it('resolves a link whose label is code', () => {
		const [own] = extractSections(page('See [`goto`](/api#goto) for more.'), '/x');
		expect(own.text).toBe('A guide. See goto for more.');
	});

	it('skips script and style blocks, on one line or many', () => {
		const [own] = extractSections(
			page(
				'<script lang="ts">\n\tlet secret = 1;\n</script>\n\n<style>a { color: red }</style>\n\nVisible.'
			),
			'/x'
		);
		expect(own.text).toBe('A guide. Visible.');
	});

	it('drops list, quote and table markers', () => {
		const [own] = extractSections(
			page('- one\n- [x] two\n1. three\n> quoted\n\n| a | b |\n| - | - |\n| c | d |'),
			'/x'
		);
		expect(own.text).toBe('A guide. one two three quoted a b c d');
	});

	it('names a page by its route when the frontmatter has no title', () => {
		const [own] = extractSections('Just text.', '/docs/loose');
		expect(own).toMatchObject({ pageTitle: '/docs/loose', group: '', text: 'Just text.' });
	});

	it('gives a heading made only of an expression no section', () => {
		const sections = extractSections(page('# {title}\n\nBody.'), '/x');
		expect(sections).toHaveLength(1);
		expect(sections[0].text).toBe('A guide. Body.');
	});
});

describe('heading ids', () => {
	// The search index and the page must agree on every anchor, or a result scrolls to nothing.
	it('are the ones the rehype plugin writes into the page', () => {
		const source = page(
			'## Requirements\n\nA.\n\n## Props\n\nB.\n\n### Props\n\nC.\n\n#### Details\n\nD.\n\n## Details\n\nE.\n\n## Requirements\n\nF.'
		);
		const anchors = extractSections(source, '/x')
			.map((section) => section.anchor)
			.filter(Boolean);

		const heading = (tagName: string, text: string) => ({
			type: 'element',
			tagName,
			properties: {},
			children: [{ type: 'text', value: text }]
		});
		const tree = {
			type: 'root',
			children: [
				heading('h2', 'Requirements'),
				heading('h2', 'Props'),
				heading('h3', 'Props'),
				heading('h4', 'Details'),
				heading('h2', 'Details'),
				heading('h2', 'Requirements')
			]
		};
		rehypeHeadingIds()(tree);

		const written = tree.children.map((node) => (node.properties as { id?: string }).id);
		expect(written).toEqual([
			'requirements',
			'props',
			'props-2',
			'details',
			'details-2',
			'requirements-2'
		]);
		// The h4 is not a section, but it still takes `details`, so the h2 after it is `details-2` on
		// both sides. Skip deep headings in either place and this is where it shows.
		expect(anchors).toEqual(['requirements', 'props', 'props-2', 'details-2', 'requirements-2']);
	});

	it('are left off headings with no text', () => {
		const tree = {
			type: 'root',
			children: [{ type: 'element', tagName: 'h2', properties: {}, children: [] }]
		};
		rehypeHeadingIds()(tree);
		expect(tree.children[0].properties).toEqual({});
	});
});
