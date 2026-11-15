<script lang="ts">
	import { page } from '$app/state';
	import SearchXIcon from '@lucide/svelte/icons/search-x';
	import manifest from '#lib/components/coral/coral.json' with { type: 'json' };
	import SearchInput from '#lib/components/coral/kit/search-input/search-input.svelte';
	import { fold } from '#lib/components/coral/lib/fold.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import * as Empty from '#lib/components/ui/empty/index.js';
	import * as Item from '#lib/components/ui/item/index.js';
	import { COMPONENT_CATEGORIES } from '#lib/features/docs/categories.js';
	import { getCollection } from '#lib/features/docs/content.js';
	import type { DocsFrontmatter } from '#lib/features/docs/types.js';
	import { resolvePathname } from '#lib/utils/paths.js';

	const versions = manifest.components as Record<string, { version: string }>;

	const components = getCollection('docs').flatMap((entry) => {
		const data = entry.data as unknown as DocsFrontmatter;
		if (!data.category) return [];
		return [
			{
				name: entry.slug,
				title: data.title,
				description: data.description ?? '',
				category: data.category,
				href: `/docs/${entry.slug}`,
				version: versions[entry.slug]?.version,
				// Folded once, here, rather than on every keystroke.
				haystack: fold(`${data.title} ${entry.slug} ${data.description ?? ''}`)
			}
		];
	});

	const id = $props.id();
	let term = $state('');
	const badges = $derived(page.data.release?.badges ?? {});

	const visible = $derived.by(() => {
		const words = fold(term).split(/\s+/).filter(Boolean);
		return components.filter((c) => words.every((word) => c.haystack.includes(word)));
	});

	const groups = $derived(
		COMPONENT_CATEGORIES.map((category) => ({
			category,
			items: visible
				.filter((c) => c.category === category)
				.sort((a, b) => a.title.localeCompare(b.title))
		})).filter((group) => group.items.length)
	);
</script>

<div class="not-prose my-8 grid gap-10">
	<div class="grid gap-2">
		<SearchInput
			onsearch={(value) => (term = value)}
			searchDebounce={0}
			placeholder="Filter {components.length} components"
			aria-label="Filter components"
		/>
		<p class="text-xs text-muted-foreground" role="status">
			{#if term}
				{visible.length} of {components.length} match “{term}”
			{:else}
				Accents are folded: <code class="font-mono">cafe</code> finds
				<code class="font-mono">café</code>.
			{/if}
		</p>
	</div>

	{#each groups as group (group.category)}
		<section
			aria-labelledby="{id}-{COMPONENT_CATEGORIES.indexOf(group.category)}"
			class="grid gap-3"
		>
			<h2
				id="{id}-{COMPONENT_CATEGORIES.indexOf(group.category)}"
				class="flex items-baseline gap-2 text-lg font-semibold"
			>
				{group.category}
				<span class="text-sm font-normal text-muted-foreground tabular-nums">
					{group.items.length}
				</span>
			</h2>
			<ul class="grid gap-3 sm:grid-cols-2">
				{#each group.items as component (component.name)}
					{@const badge = badges[component.name]}
					<li class="flex">
						<Item.Root variant="outline" class="items-start">
							{#snippet child({ props })}
								<a href={resolvePathname(component.href)} {...props}>
									<Item.Content>
										<Item.Title class="flex w-full items-center gap-2">
											{component.title}
											{#if badge}
												<Badge variant={badge === 'New' ? 'default' : 'outline'}>{badge}</Badge>
											{/if}
											<span class="ms-auto font-mono text-xs font-normal text-muted-foreground">
												v{component.version}
											</span>
										</Item.Title>
										<Item.Description class="line-clamp-none">
											{component.description}
										</Item.Description>
									</Item.Content>
								</a>
							{/snippet}
						</Item.Root>
					</li>
				{/each}
			</ul>
		</section>
	{:else}
		<Empty.Root class="border">
			<Empty.Header>
				<Empty.Media variant="icon"><SearchXIcon /></Empty.Media>
				<Empty.Title>No component matches “{term}”</Empty.Title>
				<Empty.Description>
					Try a word from what it does, such as <em>upload</em>, <em>date</em> or <em>keyboard</em>.
				</Empty.Description>
			</Empty.Header>
		</Empty.Root>
	{/each}
</div>
