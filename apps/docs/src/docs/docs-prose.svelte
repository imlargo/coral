<script lang="ts">
	/**
	 * Wraps every docs page's Markdown body. Rendered once, from `docs/[...slug]/+page.svelte`,
	 * around whichever page's `<Content />` the route loaded - title and description come from
	 * `+page.ts`, which already read them off `entry.data` to resolve the page in the first place.
	 *
	 * The on-page table of contents is Coral's own `kit/toc`, rendered separately in the docs
	 * layout's aside - it reads headings straight off the document, so nothing here has to collect
	 * or store them. What is still this component's job, against the live DOM: attaching copy
	 * buttons to fenced code blocks. Heading ids and their permalink anchors are `svmd`'s
	 * `rehype-heading-anchors.js`, at build time, before this ever mounts.
	 */
	import type { Snippet } from 'svelte';
	import DocsPageActions from './docs-page-actions.svelte';
	import DocsPageFooter from './docs-page-footer.svelte';

	let {
		title,
		description,
		children
	}: { title?: string; description?: string; children: Snippet } = $props();

	let article = $state<HTMLElement | null>(null);

	$effect(() => {
		if (!article) return;

		const cleanups = [...article.querySelectorAll<HTMLElement>('.docs-md-code')].map(attachCopy);
		return () => {
			for (const cleanup of cleanups) cleanup();
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

<article bind:this={article}>
	<div class="flex flex-wrap items-start justify-between gap-4">
		<div>
			{#if title}
				<h1 class="text-3xl font-semibold tracking-tight text-balance">{title}</h1>
			{/if}
			{#if description}
				<p class="mt-3 text-base text-pretty text-muted-foreground sm:text-lg">{description}</p>
			{/if}
		</div>
		<DocsPageActions />
	</div>

	<div class="docs-prose mt-8">
		{@render children()}
	</div>

	<DocsPageFooter />
</article>
