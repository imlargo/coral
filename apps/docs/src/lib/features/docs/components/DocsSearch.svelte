<script lang="ts">
	import FileTextIcon from '@lucide/svelte/icons/file-text';
	import HashIcon from '@lucide/svelte/icons/hash';
	import HistoryIcon from '@lucide/svelte/icons/history';
	import { page as current } from '$app/state';
	import SearchIcon from '@lucide/svelte/icons/search';
	import { onMount, untrack } from 'svelte';
	import { resolvePathname } from '#lib/utils/paths.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Command from '#lib/components/ui/command/index.js';
	import { Kbd } from '#lib/components/ui/kbd/index.js';
	import type { SearchEngine } from '#lib/features/docs/search/engine.js';
	import { highlight, snippet, type Segment } from '#lib/features/docs/search/highlight.js';
	import { loadEngine } from '#lib/features/docs/search/load.js';
	import type { SearchSection } from '#lib/features/docs/search/types.js';

	let open = $state(false);
	let query = $state('');
	let engine = $state<SearchEngine | null>(null);
	let failed = $state(false);
	// Known only in the browser, so the hint stays invisible until then instead of flashing the wrong key.
	let shortcut = $state<string | null>(null);

	const term = $derived(query.trim());
	const results = $derived(engine && term ? engine.search(query) : []);
	const hitCount = $derived(results.reduce((total, page) => total + page.hits.length, 0));

	/** The docs pages opened last on this device, newest first. */
	const RECENT_KEY = 'coral-docs-recent';
	const RECENT_MAX = 5;
	let recent = $state<string[]>([]);

	onMount(() => {
		shortcut = /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent) ? '⌘K' : 'Ctrl K';
		try {
			const stored: unknown = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
			if (Array.isArray(stored)) recent = stored.filter((href) => typeof href === 'string');
		} catch {
			// Unreadable or blocked storage: start with no history.
		}
	});

	$effect(() => {
		const path = current.url.pathname;
		if (!path.startsWith('/docs')) return;
		untrack(() => {
			recent = [path, ...recent.filter((href) => href !== path)].slice(0, RECENT_MAX);
			try {
				localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
			} catch {
				// Remembered for this visit only.
			}
		});
	});

	const recentPages = $derived.by(() => {
		if (!engine) return [];
		const titles = new Map(
			engine.browse().flatMap((group) => group.pages.map((p) => [p.href, p.title] as const))
		);
		return recent.flatMap((href) => {
			const title = titles.get(href);
			return title ? [{ href, title }] : [];
		});
	});

	function prepare() {
		if (engine) return;
		failed = false;
		loadEngine().then(
			(loaded) => (engine = loaded),
			() => (failed = true)
		);
	}

	// Opening is what needs the index; the trigger warms it a moment earlier so it is usually ready.
	$effect(() => {
		if (open) prepare();
	});

	$effect(() => {
		if (!open) query = '';
	});

	function isTyping(target: EventTarget | null) {
		return (
			target instanceof HTMLElement &&
			(target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
		);
	}

	function onkeydown(event: KeyboardEvent) {
		if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
			event.preventDefault();
			open = !open;
		} else if (
			event.key === '/' &&
			!open &&
			!event.metaKey &&
			!event.ctrlKey &&
			!event.altKey &&
			!isTyping(event.target)
		) {
			event.preventDefault();
			open = true;
		}
	}

	function hrefFor(section: Pick<SearchSection, 'href' | 'anchor'>) {
		return resolvePathname(section.href) + (section.anchor ? `#${section.anchor}` : '');
	}

	function close() {
		open = false;
	}
</script>

<svelte:window {onkeydown} />

{#snippet marked(segments: Segment[])}
	{#each segments as segment, i (i)}
		{#if segment.match}<mark class="rounded-xs bg-primary/15 px-px text-foreground"
				>{segment.text}</mark
			>{:else}{segment.text}{/if}
	{/each}
{/snippet}

<!-- Two triggers for one dialog: a full field where the navbar has room, an icon where it does not. -->
<Button
	variant="outline"
	class="hidden w-56 justify-start gap-2 text-muted-foreground md:inline-flex lg:w-64"
	onclick={() => (open = true)}
	onpointerenter={prepare}
	onfocus={prepare}
>
	<SearchIcon />
	<span class="flex-1 text-start">Search docs</span>
	<Kbd class={shortcut ? undefined : 'invisible'}>{shortcut ?? 'Ctrl K'}</Kbd>
</Button>
<Button
	variant="ghost"
	size="icon"
	class="md:hidden"
	aria-label="Search docs"
	onclick={() => (open = true)}
	onfocus={prepare}
>
	<SearchIcon />
</Button>

<!--
	`shouldFilter` is off because the list is already what the search ranked; the primitive's own
	fuzzy filter would re-score it against text it cannot see. Its vim bindings are off because Ctrl+K
	is "previous item" there, and here it closes the dialog.
-->
<Command.Dialog
	bind:open
	title="Search"
	description="Search the documentation"
	shouldFilter={false}
	vimBindings={false}
	class="sm:max-w-xl"
>
	<Command.Input placeholder="Search the docs..." bind:value={query} />

	<Command.List class="max-h-[min(24rem,60svh)]">
		{#if !term}
			{#if engine}
				{#if recentPages.length}
					<Command.Group heading="Recent" value="recent">
						{#each recentPages as item (item.href)}
							<Command.LinkItem
								href={hrefFor({ href: item.href, anchor: '' })}
								value="recent:{item.href}"
								onSelect={close}
							>
								<HistoryIcon class="text-muted-foreground" />
								{item.title}
							</Command.LinkItem>
						{/each}
					</Command.Group>
				{/if}
				{#each engine.browse() as group (group.title)}
					<Command.Group heading={group.title || undefined} value={group.title || 'pages'}>
						{#each group.pages as page (page.href)}
							<Command.LinkItem
								href={hrefFor({ href: page.href, anchor: '' })}
								value={page.href}
								onSelect={close}
							>
								<FileTextIcon class="text-muted-foreground" />
								{page.title}
							</Command.LinkItem>
						{/each}
					</Command.Group>
				{/each}
			{:else if failed}
				<p class="py-6 text-center text-sm text-destructive">Search could not be loaded.</p>
			{:else}
				<p class="py-6 text-center text-sm text-muted-foreground">Loading…</p>
			{/if}
		{:else if failed}
			<p class="py-6 text-center text-sm text-destructive">
				Search could not be loaded. Close it and open it again to retry.
			</p>
		{:else if !engine}
			<p class="py-6 text-center text-sm text-muted-foreground">Loading…</p>
		{:else if results.length === 0}
			<p class="py-6 text-center text-sm text-muted-foreground">No results for “{term}”.</p>
		{:else}
			{#each results as page (page.href)}
				<Command.Group
					heading={page.group ? `${page.group} / ${page.pageTitle}` : page.pageTitle}
					value={page.href}
				>
					{#each page.hits as hit (hit.section.id)}
						{@const section = hit.section}
						{@const isPage = section.level === 0}
						{@const excerpt = snippet(section.text, hit.matched)}
						<Command.LinkItem
							href={hrefFor(section)}
							value={section.id}
							onSelect={close}
							class="items-start"
						>
							{#if isPage}
								<FileTextIcon class="mt-0.5 text-muted-foreground" />
							{:else}
								<HashIcon class="mt-0.5 text-muted-foreground" />
							{/if}
							<span class="min-w-0 flex-1">
								<span class="block truncate font-medium">
									{@render marked(
										highlight(isPage ? section.pageTitle : section.heading, hit.matched)
									)}
								</span>
								{#if section.text}
									<span class="line-clamp-2 block text-xs text-muted-foreground">
										{@render marked(excerpt)}
									</span>
								{/if}
							</span>
						</Command.LinkItem>
					{/each}
				</Command.Group>
			{/each}
		{/if}
	</Command.List>

	<div role="status" class="sr-only">
		{#if term && engine}
			{hitCount === 0 ? 'No results' : `${hitCount} ${hitCount === 1 ? 'result' : 'results'}`}
		{/if}
	</div>

	<div class="flex items-center gap-4 border-t px-3 py-2 text-xs text-muted-foreground">
		<span class="flex items-center gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd> to navigate</span>
		<span class="flex items-center gap-1"><Kbd>↵</Kbd> to open</span>
		<span class="flex items-center gap-1"><Kbd>esc</Kbd> to close</span>
	</div>
</Command.Dialog>
