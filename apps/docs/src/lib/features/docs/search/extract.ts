/**
 * Turns a docs page's Markdown into the sections the search index is built from. Runs at build
 * time, in Node, from `vite-plugin.ts` - never in the browser.
 *
 * It reads the source rather than the compiled page, so it is a line scanner and not a Markdown
 * parser. That is enough for what a search needs: which heading a piece of text sits under, and
 * that text with the syntax stripped. It understands ATX headings (`## Title`), fenced code,
 * `<script>`/`<style>` blocks and the inline syntax below. Setext headings and HTML headings are
 * not seen, which the heading ids share: `rehype-heading-ids.ts` numbers the same headings.
 */
import { parse } from 'yaml';
import { createHeadingIds } from '../heading-ids.ts';
import type { SearchSection } from './types.ts';

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const ATX_HEADING = /^ {0,3}(#{1,6})[ \t]+(.*?)(?:[ \t]+#+)?[ \t]*$/;
const FENCE_OPEN = /^ {0,3}(`{3,}|~{3,})/;
const FENCE_CLOSE = /^ {0,3}(`{3,}|~{3,})[ \t]*$/;
const RAW_BLOCK = /^\s*<(script|style)\b/i;

/** Headings deeper than this are folded into the section above them instead of starting their own. */
const MAX_SECTION_LEVEL = 3;

/** `installation.md` is `/docs/installation`; an `index.md` is its folder. Mirrors `@svmd/content`'s slugs. */
export function docsHref(relativePath: string): string {
	const segments = relativePath.replace(/\\/g, '/').replace(/\.md$/, '').split('/');
	if (segments.at(-1) === 'index') segments.pop();
	return ['/docs', ...segments].join('/');
}

/** Links, images, tags, `{expressions}` and emphasis, reduced to the words inside them. */
function stripProse(text: string): string {
	return text
		.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
		.replace(/\[([^\]]+)\]\[[^\]]*\]/g, '$1')
		.replace(/<[^>\n]*>/g, ' ')
		.replace(/\{[^{}]*\}/g, ' ')
		.replace(/\*{1,3}(?=\S)(.+?)(?<=\S)\*{1,3}/g, '$1')
		.replace(/(^|\W)_{1,3}(?=\S)(.+?)(?<=\S)_{1,3}(?=\W|$)/g, '$1$2')
		.replace(/~~(.+?)~~/g, '$1');
}

/**
 * Inline text with its syntax removed. Code spans are kept verbatim and set aside first, so that
 * `{#if}` written in backticks stays searchable while a real `{#if x}` block tag is dropped, and so
 * a link whose label is code (``[`goto`](/x)``) still resolves to its label.
 */
function cleanInline(line: string): string {
	const spans: string[] = [];
	const shielded = line.replace(/`([^`]+)`/g, (_, code: string) => {
		spans.push(code);
		// One private-use character per span: not a letter, so nothing above can mistake it for a word.
		return String.fromCharCode(0xe000 + spans.length - 1);
	});

	return stripProse(shielded).replace(/[-]/g, (mark) => spans[mark.charCodeAt(0) - 0xe000] ?? '');
}

/** One line of body text, without list, quote and table markers. Empty for rules and table dividers. */
function cleanLine(line: string): string {
	if (/^\s*[-*_](?:\s*[-*_]){2,}\s*$/.test(line)) return '';
	if (line.includes('|') && /^[\s|:-]+$/.test(line)) return '';

	return cleanInline(
		line
			.replace(/^ {0,3}(?:>[ \t]?)+/, '')
			.replace(/^\s*(?:[-*+]|\d{1,9}[.)])\s+(?:\[[ xX]\]\s+)?/, '')
			.replace(/\|/g, ' ')
	);
}

function frontmatterOf(source: string): { data: Record<string, unknown>; body: string } {
	const match = FRONTMATTER.exec(source);
	if (!match) return { data: {}, body: source };

	const parsed: unknown = parse(match[1]);
	const data = parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
	return { data, body: source.slice(match[0].length) };
}

type Draft = { anchor: string; heading: string; level: number; parts: string[] };

export function extractSections(source: string, href: string): SearchSection[] {
	const { data, body } = frontmatterOf(source);
	const pageTitle = typeof data.title === 'string' ? data.title : href;
	const group = typeof data.group === 'string' ? data.group : '';
	const description = typeof data.description === 'string' ? data.description : '';

	// The page's own entry: its description, then whatever comes before the first heading.
	const drafts: Draft[] = [
		{ anchor: '', heading: '', level: 0, parts: description ? [description] : [] }
	];
	const nextId = createHeadingIds();

	let fence: { char: string; size: number } | null = null;
	let rawBlock: string | null = null;

	for (const line of body.split(/\r?\n/)) {
		const current = drafts[drafts.length - 1];

		if (rawBlock) {
			if (new RegExp(`</${rawBlock}\\s*>`, 'i').test(line)) rawBlock = null;
			continue;
		}

		if (fence) {
			const close = FENCE_CLOSE.exec(line);
			if (close && close[1][0] === fence.char && close[1].length >= fence.size) fence = null;
			else current.parts.push(line.trim());
			continue;
		}

		const open = FENCE_OPEN.exec(line);
		if (open) {
			fence = { char: open[1][0], size: open[1].length };
			continue;
		}

		const raw = RAW_BLOCK.exec(line);
		if (raw) {
			const tag = raw[1].toLowerCase();
			if (!new RegExp(`</${tag}\\s*>`, 'i').test(line)) rawBlock = tag;
			continue;
		}

		const heading = ATX_HEADING.exec(line);
		if (heading) {
			const level = heading[1].length;
			const text = cleanInline(heading[2]).replace(/\s+/g, ' ').trim();
			// Every heading takes an id, deep or not, or the numbering drifts from the page's.
			const anchor = nextId(text);

			if (level <= MAX_SECTION_LEVEL && anchor) {
				drafts.push({ anchor, heading: text, level, parts: [] });
			} else if (text) {
				current.parts.push(text);
			}
			continue;
		}

		const cleaned = cleanLine(line);
		if (cleaned.trim()) current.parts.push(cleaned);
	}

	return drafts.map((draft) => ({
		id: draft.anchor ? `${href}#${draft.anchor}` : href,
		href,
		anchor: draft.anchor,
		pageTitle,
		group,
		heading: draft.heading,
		level: draft.level,
		text: draft.parts.join(' ').replace(/\s+/g, ' ').trim()
	}));
}
