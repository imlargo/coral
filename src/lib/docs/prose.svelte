<script lang="ts">
	/**
	 * mdsvex layout for every docs page. Receives the page's frontmatter as props, renders the
	 * title block, and post-processes the rendered Markdown: heading anchors (for the table of
	 * contents) and copy buttons on fenced code blocks.
	 *
	 * Those two run against the DOM because mdsvex hands us its output as markup, not components.
	 * This is the only place in the site that does it.
	 */
	import type { Snippet } from 'svelte';
	import { toc, type Heading } from './toc.svelte.js';

	let {
		title,
		description,
		children
	}: { title?: string; description?: string; children: Snippet } = $props();

	let article = $state<HTMLElement | null>(null);

	function slugify(text: string): string {
		return text
			.toLowerCase()
			.replace(/[^\p{L}\p{N}]+/gu, '-')
			.replace(/^-|-$/g, '');
	}

	$effect(() => {
		if (!article) return;

		const headings: Heading[] = [];
		// A plain record, not a Set: this is a local counter inside the effect, never reactive state.
		const seen: Record<string, true> = {};

		for (const el of article.querySelectorAll<HTMLElement>('h2, h3')) {
			const text = el.textContent?.trim() ?? '';
			let id = slugify(text);
			for (let n = 2; seen[id]; n++) id = `${slugify(text)}-${n}`;
			seen[id] = true;

			el.id = id;
			headings.push({ id, text, level: el.tagName === 'H2' ? 2 : 3 });
		}

		toc.headings = headings;

		const cleanups = [...article.querySelectorAll<HTMLElement>('.docs-md-code')].map(attachCopy);

		return () => {
			for (const cleanup of cleanups) cleanup();
			toc.headings = [];
		};
	});

	const COPY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
	const CHECK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;

	function attachCopy(block: HTMLElement): () => void {
		const code = block.querySelector('pre')?.textContent ?? '';

		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'docs-copy';
		button.setAttribute('aria-label', 'Copy to clipboard');
		button.innerHTML = COPY_ICON;

		let timer: ReturnType<typeof setTimeout>;
		const onclick = async () => {
			await navigator.clipboard.writeText(code);
			button.innerHTML = CHECK_ICON;
			button.setAttribute('aria-label', 'Copied');
			clearTimeout(timer);
			timer = setTimeout(() => {
				button.innerHTML = COPY_ICON;
				button.setAttribute('aria-label', 'Copy to clipboard');
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
