<script lang="ts">
	import SearchXIcon from '@lucide/svelte/icons/search-x';
	import manifest from '#lib/components/coral/coral.json' with { type: 'json' };
	import SearchInput from '#lib/components/coral/kit/search-input/search-input.svelte';
	import { fold } from '#lib/components/coral/lib/fold.js';
	import * as Empty from '#lib/components/ui/empty/index.js';
	import * as Item from '#lib/components/ui/item/index.js';
	import { getCollection } from '#lib/features/docs/content.js';
	import type { DocsFrontmatter } from '#lib/features/docs/types.js';
	import { resolvePathname } from '#lib/utils/paths.js';

	const versions = manifest.components as Record<string, { version: string }>;

	const components = getCollection('docs')
		.flatMap((entry) => {
			const data = entry.data as unknown as DocsFrontmatter;
			if (data.group !== 'Kit') return [];
			return [
				{
					name: entry.slug,
					title: data.title,
					description: data.description ?? '',
					href: `/docs/${entry.slug}`,
					version: versions[entry.slug]?.version,
					// Folded once, here, rather than on every keystroke.
					haystack: fold(`${data.title} ${entry.slug} ${data.description ?? ''}`)
				}
			];
		})
		.sort((a, b) => a.title.localeCompare(b.title));

	let term = $state('');

	const visible = $derived.by(() => {
		const words = fold(term).split(/\s+/).filter(Boolean);
		return components.filter((c) => words.every((word) => c.haystack.includes(word)));
	});
</script>

<div class="not-prose my-8 grid gap-6">
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

	<ul class="grid gap-3 sm:grid-cols-2">
		{#each visible as component (component.name)}
			<li class="flex">
				<Item.Root variant="outline" class="items-start">
					{#snippet child({ props })}
						<a href={resolvePathname(component.href)} {...props}>
							<Item.Content>
								<Item.Title class="flex w-full items-center gap-2">
									{component.title}
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
		{:else}
			<li>
				<Empty.Root class="border">
					<Empty.Header>
						<Empty.Media variant="icon"><SearchXIcon /></Empty.Media>
						<Empty.Title>No component matches “{term}”</Empty.Title>
						<Empty.Description>
							Try a word from what it does, such as <em>upload</em>, <em>date</em> or
							<em>keyboard</em>.
						</Empty.Description>
					</Empty.Header>
				</Empty.Root>
			</li>
		{/each}
	</ul>
</div>
