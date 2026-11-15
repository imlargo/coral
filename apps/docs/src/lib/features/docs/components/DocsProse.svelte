<script lang="ts">
	/**
	 * svdocs's page frame, plus a copy button on every fenced code block in the rendered Markdown.
	 * `code-highlighter.ts` wraps each one in `.docs-md-code` at build time; attaching the button
	 * still needs a live mount, the same way `Preview`'s own `CopyButton` needs one for its code tab.
	 */
	import type { Snippet } from 'svelte';
	import { config } from '#lib/config/app.js';
	import type { SidebarLink } from '#lib/features/docs/types.js';
	import DocsBreadcrumbs from '#lib/features/docs/components/DocsBreadcrumbs.svelte';
	import DocsPageActions from '#lib/features/docs/components/DocsPageActions.svelte';
	import DocsPageFooter from '#lib/features/docs/components/DocsPageFooter.svelte';
	import DocsPagerButtons from '#lib/features/docs/components/DocsPagerButtons.svelte';

	let {
		title,
		description,
		raw,
		updated,
		path,
		prev,
		next,
		meta,
		children
	}: {
		title: string;
		description?: string;
		raw: string;
		updated?: string;
		prev?: SidebarLink;
		next?: SidebarLink;
		/** The page's source file, as the content glob keys it: `/src/content/docs/...`. */
		path?: string;
		/** Drawn under the description: a component's version, source and primitives. */
		meta?: Snippet;
		children: Snippet;
	} = $props();

	let body = $state<HTMLElement | null>(null);

	$effect(() => {
		// Read so a client-side navigation, which keeps this component and swaps its content,
		// attaches buttons to the new page's blocks too.
		void raw;
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
		<div class="min-w-0 flex-1 basis-80">
			<h1 class="text-3xl font-semibold tracking-tight text-balance">{title}</h1>
			{#if description}
				<p class="mt-2 text-lg text-pretty text-muted-foreground">{description}</p>
			{/if}
			{@render meta?.()}
		</div>
		<div class="flex items-center gap-2">
			<DocsPageActions {raw} />
			<DocsPagerButtons {prev} {next} />
		</div>
	</div>
	<div bind:this={body} class="prose mt-8 max-w-none dark:prose-invert">
		{@render children()}
	</div>
	<DocsPageFooter {updated} {prev} {next} {path} />
</article>
