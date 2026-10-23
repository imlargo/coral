import { describe, expect, it } from 'vitest';
import { createEngine } from './engine.ts';
import type { SearchSection } from './types.ts';

function section(
	href: string,
	pageTitle: string,
	heading: string,
	text: string,
	group = 'Docs'
): SearchSection {
	return {
		id: heading ? `${href}#${heading.toLowerCase().replace(/\s+/g, '-')}` : href,
		href,
		anchor: heading ? heading.toLowerCase().replace(/\s+/g, '-') : '',
		pageTitle,
		group,
		heading,
		level: heading ? 2 : 0,
		text
	};
}

const corpus: SearchSection[] = [
	section('/docs', 'Introduction', '', 'A template for documentation sites built with Svelte.'),
	section('/docs', 'Introduction', 'Why', 'The goal is to cover the same ground as Starlight.'),
	section(
		'/docs/installation',
		'Installation',
		'',
		'Get the template running locally. Clone the repository first.'
	),
	section('/docs/installation', 'Installation', 'Requirements', 'Node 20 or newer, and pnpm.'),
	section(
		'/docs/installation',
		'Installation',
		'Clone and install',
		'git clone the repository, then run pnpm install.'
	),
	section(
		'/docs/installation',
		'Installation',
		'Development',
		'Start the dev server. Components are added with the CLI, and the installation of each one is a single command.'
	),
	section('/docs/routing', 'Routing', '', 'Pages live under the routes folder.'),
	section(
		'/docs/routing',
		'Routing',
		'Dynamic routes',
		'A folder in brackets is a parameter. Installation of a route guard is optional.'
	),
	section('/docs/instalacion', 'Instalación', '', 'Cómo instalar la plantilla en tu equipo.')
];

const engine = createEngine(corpus);
const hrefs = (query: string) => engine.search(query).map((page) => page.href);

describe('search', () => {
	it('finds nothing for an empty query, or one that is only punctuation', () => {
		expect(engine.search('')).toEqual([]);
		expect(engine.search('   ')).toEqual([]);
		expect(engine.search('?!')).toEqual([]);
	});

	it('finds nothing for a word that is not there', () => {
		expect(hrefs('zzzzzz')).toEqual([]);
	});

	it('ranks the page named after the query above pages that only mention it', () => {
		// "installation" is the title of one page and body text in two others.
		expect(hrefs('installation')[0]).toBe('/docs/installation');
	});

	it('ranks a heading above body text', () => {
		const [first] = engine.search('clone');
		expect(first.href).toBe('/docs/installation');
		expect(first.hits.map((hit) => hit.section.heading)).toContain('Clone and install');
	});

	it('matches a half-typed last word', () => {
		expect(hrefs('inst')).toContain('/docs/installation');
		expect(hrefs('installa')[0]).toBe('/docs/installation');
		expect(hrefs('dynam')).toEqual(['/docs/routing']);
	});

	it('ignores accents, in the query and in the text', () => {
		expect(hrefs('instalacion')).toContain('/docs/instalacion');
		expect(hrefs('instalación')).toContain('/docs/instalacion');
		expect(hrefs('como')).toContain('/docs/instalacion');
	});

	it('drops stop words, so a question is a search for its content', () => {
		expect(engine.search('how to install')).toEqual(engine.search('install'));
	});

	it('still answers a query that is only stop words', () => {
		expect(hrefs('to').length).toBeGreaterThan(0);
	});

	it('wants every word, and prefers the phrase in order', () => {
		const [first] = engine.search('clone and install');
		expect(first.hits[0].section.heading).toBe('Clone and install');
	});

	it('prefers the words in order over the same words apart', () => {
		// Same fields, same words. The scattered one is listed first, so only the phrase bonus can put
		// the other ahead of it.
		const phrased = createEngine([
			section('/a', 'A', 'Install then clone', 'x'),
			section('/b', 'B', 'Clone install steps', 'x')
		]);
		expect(phrased.search('clone install').map((page) => page.href)).toEqual(['/b', '/a']);
	});

	it('puts the best match first even when it is a section, not the page', () => {
		// The page itself matches too, but the heading is the exact answer and is what Enter should open.
		const [first] = engine.search('clone and install');
		expect(first.hits.length).toBeGreaterThan(1);
		expect(first.hits[0].section.level).toBe(2);
	});

	it('falls back to some of the words when no section has all of them', () => {
		// Nothing holds both, so this is not empty: it is the sections holding "clone".
		expect(hrefs('clone zzzzzz')).toEqual(['/docs/installation']);
	});

	it('does not let a page title match every one of its sections', () => {
		// Only the page's own entry is named "Installation"; its sections mention it in the text or not at all.
		const [first] = engine.search('installation');
		const sections = first.hits.map((hit) => hit.section.heading);
		expect(sections[0]).toBe('');
		expect(sections).not.toContain('Requirements');
	});

	it('groups sections by page, leading with the page itself when that is what was asked for', () => {
		const result = engine.search('installation');
		const page = result.find((entry) => entry.href === '/docs/installation');
		expect(page?.hits[0].section.level).toBe(0);
		expect(new Set(result.map((entry) => entry.href)).size).toBe(result.length);
	});

	it('caps pages and hits per page', () => {
		const capped = createEngine(corpus, { maxPages: 1, maxHitsPerPage: 1 });
		const result = capped.search('installation');
		expect(result).toHaveLength(1);
		expect(result[0].hits).toHaveLength(1);
	});

	it('reports the words that matched, whole and folded, for highlighting', () => {
		const [first] = engine.search('installa');
		expect(first.hits[0].matched).toContain('installation');
		const [accented] = engine.search('instalacion').filter((p) => p.href === '/docs/instalacion');
		expect(accented.hits[0].matched).toContain('instalacion');
	});

	it('gives the same answer as it types', () => {
		// As-you-type: every prefix of a word that exists finds it.
		for (const query of ['ro', 'rou', 'rout', 'routi', 'routin', 'routing']) {
			expect(hrefs(query)).toContain('/docs/routing');
		}
	});
});

describe('browse', () => {
	it('lists every page once, grouped, in the order they were indexed', () => {
		const grouped = createEngine([
			section('/a', 'Alpha', '', 'x', 'First'),
			section('/a', 'Alpha', 'Deep', 'x', 'First'),
			section('/b', 'Beta', '', 'x', 'Second'),
			section('/c', 'Gamma', '', 'x', 'First')
		]);

		expect(grouped.browse()).toEqual([
			{
				title: 'First',
				pages: [
					{ href: '/a', title: 'Alpha' },
					{ href: '/c', title: 'Gamma' }
				]
			},
			{ title: 'Second', pages: [{ href: '/b', title: 'Beta' }] }
		]);
	});
});
