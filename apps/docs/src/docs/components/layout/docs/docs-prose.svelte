<script lang="ts">
	/**
	 * Everything here is svdocs's own `docs-prose.svelte`, unchanged, plus one addition this repo's
	 * docs need that svdocs's own template has no reason to: a copy button on every fenced code
	 * block in the rendered Markdown body. svmd/shiki wrap each one in `.docs-md-code` at build
	 * time (`svmd-highlight.js`); attaching the button still needs a live mount, the same way
	 * `Preview`'s own `CopyButton` needs one for its Svelte-rendered code tab.
	 */
	import type { Snippet } from 'svelte';
	import { config } from '$docs/config/app.js';
	import type { SidebarLink } from '$docs/config/sidebar.js';
	import DocsBreadcrumbs from './docs-breadcrumbs.svelte';
	import DocsPageActions from './docs-page-actions.svelte';
	import DocsPageFooter from './docs-page-footer.svelte';

	let {
		title,
		description,
		raw,
		updated,
		prev,
		next,
		children
	}: {
		title: string;
		description?: string;
		raw: string;
		updated?: string;
		prev?: SidebarLink;
		next?: SidebarLink;
		children: Snippet;
	} = $props();

	let body = $state<HTMLElement | null>(null);

	$effect(() => {
		if (!body) return;
		const cleanups = [...body.querySelectorAll<HTMLElement>('.docs-md-code')].map(attachCopy);
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
	<title>{title} - {config.branding.name}</title>
	{#if description}
		<meta name="description" content={description} />
	{/if}
</svelte:head>

<article>
	<DocsBreadcrumbs class="mb-5" />
	<div class="flex flex-wrap items-start justify-between gap-4">
		<div>
			<h1 class="text-3xl font-semibold">{title}</h1>
			{#if description}
				<p class="mt-2 text-lg text-muted-foreground">{description}</p>
			{/if}
		</div>
		<DocsPageActions {raw} />
	</div>
	<div bind:this={body} class="prose mt-8 max-w-none dark:prose-invert">
		{@render children()}
	</div>
	<DocsPageFooter {updated} {prev} {next} />
</article>
