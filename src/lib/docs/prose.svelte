<script lang="ts">
	/**
	 * mdsvex layout for every docs page. Receives the page's frontmatter as props, renders the
	 * title block, and post-processes the rendered Markdown: heading anchors (linkable, and the
	 * source of the table of contents) and copy buttons on fenced code blocks.
	 *
	 * Those run against the DOM because mdsvex hands us its output as markup, not components.
	 * This is the only place in the site that does it.
	 */
	import type { Snippet } from 'svelte';
	import { slugifyAll } from './slug.js';
	import { toc, type Heading } from './toc.svelte.js';

	let {
		title,
		description,
		children
	}: { title?: string; description?: string; children: Snippet } = $props();

	let article = $state<HTMLElement | null>(null);

	$effect(() => {
		if (!article) return;

		const elements = [...article.querySelectorAll<HTMLElement>('h2, h3')];
		const ids = slugifyAll(elements.map((el) => el.textContent?.trim() ?? ''));

		const headings: Heading[] = elements.map((el, i) => {
			el.id = ids[i];
			return {
				id: ids[i],
				text: el.textContent?.trim() ?? '',
				level: el.tagName === 'H2' ? 2 : 3
			};
		});

		toc.headings = headings;

		const cleanups = [
			...elements.map(anchor),
			...[...article.querySelectorAll<HTMLElement>('.docs-md-code')].map(attachCopy)
		];

		return () => {
			for (const cleanup of cleanups) cleanup();
			toc.headings = [];
		};
	});

	const ICON = {
		link: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
		copy: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,
		check: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`
	};

	/** Gives a heading a permalink, so a section can be pointed at rather than described. */
	function anchor(heading: HTMLElement): () => void {
		const link = document.createElement('a');
		link.href = `#${heading.id}`;
		link.className = 'docs-anchor';
		link.tabIndex = -1;
		link.setAttribute('aria-label', `Link to ${heading.textContent?.trim()}`);
		link.innerHTML = ICON.link;

		heading.appendChild(link);
		return () => link.remove();
	}

	function attachCopy(block: HTMLElement): () => void {
		const code = block.querySelector('pre')?.textContent ?? '';

		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'docs-copy';
		button.setAttribute('aria-label', 'Copy to clipboard');
		button.innerHTML = ICON.copy;

		let timer: ReturnType<typeof setTimeout>;
		const onclick = async () => {
			await navigator.clipboard.writeText(code);
			button.innerHTML = ICON.check;
			button.setAttribute('aria-label', 'Copied');
			button.dataset.copied = 'true';
			clearTimeout(timer);
			timer = setTimeout(() => {
				button.innerHTML = ICON.copy;
				button.setAttribute('aria-label', 'Copy to clipboard');
				delete button.dataset.copied;
			}, 2000);
		};

		button.addEventListener('click', onclick);
		// `appendChild`, not `prepend`/`append`: Cloudflare's worker types declare a global `Element`
		// whose HTMLRewriter signatures shadow the DOM ones. The button is absolutely positioned, so
		// where it sits in the child list makes no visual difference.
		block.appendChild(button);

		return () => {
			clearTimeout(timer);
			button.removeEventListener('click', onclick);
			button.remove();
		};
	}
</script>

<svelte:head>
	<title>{title ? `${title} — Coral` : 'Coral'}</title>
	{#if description}<meta name="description" content={description} />{/if}
</svelte:head>

<article bind:this={article} class="docs-prose">
	{#if title}
		<h1>{title}</h1>
	{/if}
	{#if description}
		<p class="lead">{description}</p>
	{/if}
	{@render children()}
</article>
