/**
 * Lays out the changelog page at build time, through svmd's `rehypePlugins` in vite.config.ts.
 *
 * The page stays plain Markdown, one line per version, because that is what `coral-changelog.test.ts`
 * reads and what a contributor writes. This turns each day into a section with a readable date, and
 * each `` - `kit/x` 1.2.0: ... `` line into the component's link, a version badge and, for
 * `new.`, `**Breaking:**` and `removed.`, a badge saying so. Badges are the shadcn primitive: an
 * element named `Badge` is printed by svmd as the component, which the page imports.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';

/** The slice of hast this plugin reads. svmd's tree carries more node types than these. */
type HastNode = {
	type: string;
	tagName?: string;
	value?: string;
	properties?: Record<string, unknown>;
	children?: HastNode[];
};

type Kind = 'new' | 'breaking' | 'removed' | 'unchanged';

const CHANGELOG = path.join('content', 'docs', 'changelog', 'index.md');
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const NAME = /^[a-z]+(?:\/[a-z-]+)+$/;
const AFTER_NAME = /^ (\d+\.\d+\.\d+): |^: removed\. /;

const BADGE: Record<Exclude<Kind, 'unchanged'>, { label: string; variant: string }> = {
	new: { label: 'New', variant: 'default' },
	breaking: { label: 'Breaking', variant: 'destructive' },
	removed: { label: 'Removed', variant: 'outline' }
};

const dateFormat = new Intl.DateTimeFormat('en-US', {
	month: 'short',
	day: 'numeric',
	year: 'numeric',
	timeZone: 'UTC'
});

const element = (
	tagName: string,
	properties: Record<string, unknown>,
	children: HastNode[]
): HastNode => ({ type: 'element', tagName, properties, children });

const text = (value: string): HastNode => ({ type: 'text', value });

const isElement = (node: HastNode | undefined, tagName: string): node is HastNode =>
	node?.type === 'element' && node.tagName === tagName;

function textOf(node: HastNode): string {
	if (node.type === 'text') return node.value ?? '';
	return (node.children ?? []).map(textOf).join('');
}

/** Drops `prefix` from the start of the first text node, and the space after it. */
function stripLeading(children: HastNode[], prefix: RegExp): boolean {
	const first = children[0];
	if (first?.type !== 'text' || !prefix.test(first.value ?? '')) return false;
	first.value = (first.value ?? '').replace(prefix, '').trimStart();
	return true;
}

function trimStart(children: HastNode[]) {
	const first = children[0];
	if (first?.type === 'text') first.value = (first.value ?? '').trimStart();
}

/** `**Breaking:**` opening the line is the badge, not part of the sentence. */
function stripBreaking(children: HastNode[]): boolean {
	const leading = children.findIndex((child) => child.type !== 'text' || child.value?.trim());
	const strong = children[leading];
	if (!isElement(strong, 'strong') || !textOf(strong).startsWith('Breaking')) return false;
	children.splice(0, leading + 1);
	trimStart(children);
	return true;
}

/** Rebuilds one entry, or returns `undefined` for a line that is not `` `name` version: ``. */
function entry(item: HastNode, pages: (name: string) => boolean): HastNode | undefined {
	const [code, after, ...rest] = item.children ?? [];
	if (!isElement(code, 'code') || after?.type !== 'text') return undefined;
	const name = textOf(code);
	const match = AFTER_NAME.exec(after.value ?? '');
	if (!NAME.test(name) || !match) return undefined;

	const version = match[1];
	const body = [text((after.value ?? '').slice(match[0].length)), ...rest];
	let kind: Kind | undefined = version ? undefined : 'removed';
	if (!kind && stripLeading(body, /^new\./)) kind = 'new';
	if (!kind && stripBreaking(body)) kind = 'breaking';
	if (!kind && /^No change in behavior/.test(textOf(body[0]))) kind = 'unchanged';

	const label = element('code', {}, [text(name)]);
	const meta = [
		pages(name)
			? element('a', { href: `/docs/${name}`, className: ['docs-changelog-name'] }, [label])
			: element('span', { className: ['docs-changelog-name'] }, [label])
	];
	if (version) meta.push(element('Badge', { variant: 'secondary' }, [text(version)]));
	if (kind && kind !== 'unchanged') {
		const { label: word, variant } = BADGE[kind];
		meta.push(element('Badge', { variant }, [text(word)]));
	}

	return element('li', { className: ['docs-changelog-entry'], dataKind: kind }, [
		element('div', { className: ['docs-changelog-meta', 'not-prose'] }, meta),
		element('div', {}, body)
	]);
}

/** Swaps the ISO date a contributor writes for one a reader reads, keeping the id it was given. */
function readableDate(heading: HastNode): string | undefined {
	const iso = (heading.children ?? []).find((child) => child.type === 'text');
	const value = iso?.value?.trim() ?? '';
	if (!iso || !DATE.test(value)) return undefined;
	iso.type = 'element';
	iso.tagName = 'time';
	iso.properties = { dateTime: value };
	iso.children = [text(dateFormat.format(new Date(`${value}T00:00:00Z`)))];
	delete iso.value;
	return value;
}

export function rehypeChangelog() {
	return (tree: HastNode, file: { path?: string }) => {
		if (!file.path?.endsWith(CHANGELOG)) return;

		// A component links to its page when it has one: removed components and `lib/` do not.
		const docs = path.resolve(path.dirname(file.path), '..');
		const pages = (name: string) => existsSync(path.join(docs, name, 'index.md'));

		const sections: HastNode[] = [];
		let day: { header: HastNode; body: HastNode[]; count: number } | undefined;
		const close = () => {
			if (!day) return;
			const changes = `${day.count} ${day.count === 1 ? 'change' : 'changes'}`;
			if (day.count) day.header.children?.push(element('p', {}, [text(changes)]));
			sections.push(
				element('section', { className: ['docs-changelog-day'] }, [
					day.header,
					element('div', { className: ['docs-changelog-body'] }, day.body)
				])
			);
		};

		for (const node of tree.children ?? []) {
			if (isElement(node, 'h2') && readableDate(node)) {
				close();
				day = {
					header: element('header', { className: ['docs-changelog-date'] }, [node]),
					body: [],
					count: 0
				};
				continue;
			}
			if (!day) {
				sections.push(node);
				continue;
			}
			if (isElement(node, 'ul')) {
				let built = 0;
				const children = (node.children ?? []).map((child) => {
					const rebuilt = isElement(child, 'li') ? entry(child, pages) : undefined;
					if (rebuilt) built++;
					return rebuilt ?? child;
				});
				if (built) {
					node.children = children;
					node.properties = { ...node.properties, className: ['docs-changelog-list'] };
					day.count += built;
				}
			}
			day.body.push(node);
		}
		close();

		tree.children = sections;
	};
}
