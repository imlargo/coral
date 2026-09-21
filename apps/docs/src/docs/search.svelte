<script lang="ts">
	/**
	 * ⌘K palette over the build-time docs index: every page, and every section inside it. Headings
	 * are indexed too, so "fallback" lands on the exact section rather than the top of a page the
	 * reader then has to scan.
	 */
	import FileTextIcon from '@lucide/svelte/icons/file-text';
	import HashIcon from '@lucide/svelte/icons/hash';
	import SearchIcon from '@lucide/svelte/icons/search';
	import { pages } from 'virtual:coral-docs-index';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import * as Command from '$lib/components/ui/command/index.js';
	import { Kbd } from '$lib/components/ui/kbd/index.js';

	let open = $state(false);

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
			event.preventDefault();
			open = !open;
		}
		// A plain `/` is the other muscle memory for search, but not while typing somewhere.
		const target = event.target as HTMLElement | null;
		const typing = target?.closest('input, textarea, [contenteditable]');
		if (event.key === '/' && !typing && !open) {
			event.preventDefault();
			open = true;
		}
	}

	/**
	 * Targets come from the build-time index, so they are real routes - but they carry a `#section`
	 * fragment, which `resolve()` cannot express yet (sveltejs/kit#14750). Prefixing `base` by hand
	 * is what `resolve()` would have contributed here, so the lint rule has nothing left to catch.
	 */
	async function go(href: string) {
		open = false;
		// eslint-disable-next-line svelte/no-navigation-without-resolve -- base applied above
		await goto(`${base}${href}`);
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<button
	type="button"
	onclick={() => (open = true)}
	class="flex h-8 w-full max-w-64 items-center gap-2 rounded-md border bg-muted/40 px-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
>
	<SearchIcon class="size-4 shrink-0" />
	<span class="truncate">Search docs</span>
	<Kbd class="ml-auto hidden sm:inline-flex">⌘K</Kbd>
</button>

<Command.Dialog bind:open>
	<Command.Input placeholder="Search pages and sections…" />
	<Command.List>
		<Command.Empty>Nothing matches that.</Command.Empty>

		{#each pages as page (page.href)}
			<Command.Group heading={page.title}>
				<Command.Item value="{page.title} {page.description}" onSelect={() => go(page.href)}>
					<FileTextIcon />
					<span>{page.title}</span>
					{#if page.description}
						<span class="truncate text-xs text-muted-foreground">{page.description}</span>
					{/if}
				</Command.Item>

				{#each page.headings as heading (heading.id)}
					<Command.Item
						value="{page.title} {heading.text}"
						onSelect={() => go(`${page.href}#${heading.id}`)}
					>
						<HashIcon />
						<span>{heading.text}</span>
					</Command.Item>
				{/each}
			</Command.Group>
		{/each}
	</Command.List>
</Command.Dialog>
