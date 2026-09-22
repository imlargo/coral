<script lang="ts">
	/**
	 * Wraps every docs page's Markdown body. Rendered once, from `docs/[...slug]/+page.svelte`,
	 * around whichever page's `<Content />` the route loaded - title and description come from
	 * `+page.ts`, which already read them off `entry.data` to resolve the page in the first place.
	 *
	 * Renders the title block. Heading ids and their permalink anchors are no longer this
	 * component's job - `rehype-heading-anchors.js` puts both in at build time, through svmd's
	 * `rehypePlugins`, so they exist before this ever mounts. What is left to do against the live
	 * DOM: read those ids back out for the table of contents, and attach copy buttons to fenced
	 * code blocks - both are things a mount is genuinely required for.
	 */
	import type { Snippet } from 'svelte';
	import { toc, type Heading } from './toc.svelte.js';

	let {
		title,
		description,
		children
	}: { title?: string; description?: string; children: Snippet } = $props();

	let article = $state<HTMLElement | null>(null);

	$effect(() => {
		if (!article) return;

		toc.headings = [...article.querySelectorAll<HTMLElement>('h2[id], h3[id]')].map((el) => ({
			id: el.id,
			text: el.textContent?.trim() ?? '',
			level: el.tagName === 'H2' ? 2 : 3
		})) satisfies Heading[];

		const cleanups = [...article.querySelectorAll<HTMLElement>('.docs-md-code')].map(attachCopy);

		return () => {
			for (const cleanup of cleanups) cleanup();
			toc.headings = [];
		};
	});

	const ICON = {
		copy: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,
		check: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`
	};

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
		// The button is absolutely positioned, so where it sits in the child list makes no visual
		// difference.
		block.appendChild(button);

		return () => {
			clearTimeout(timer);
			button.removeEventListener('click', onclick);
			button.remove();
		};
	}
</script>

<svelte:head>
	<title>{title ? `${title} - Coral` : 'Coral'}</title>
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
