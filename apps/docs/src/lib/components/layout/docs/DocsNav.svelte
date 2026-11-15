<script lang="ts">
	import { page } from '$app/state';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { DOCS_SIDEBAR_GROUPS } from '#lib/features/docs/sidebar.js';
	import { resolvePathname } from '#lib/utils/paths.js';

	let {
		/** Called after a link is followed, so a sheet holding the list can close. */
		onnavigate
	}: { onnavigate?: () => void } = $props();

	const id = $props.id();
	const badges = $derived(page.data.release?.badges ?? {});

	// A component's href is its manifest name under `/docs/`, which is how the changelog names it.
	const badgeFor = (href: string) => badges[href.replace(/^\/docs\//, '')];
</script>

<nav aria-label="Documentation" class="grid gap-6">
	{#each DOCS_SIDEBAR_GROUPS as group, index (group.title)}
		<section aria-labelledby="{id}-{index}">
			<h2
				id="{id}-{index}"
				class="flex items-center gap-2 px-2 pb-1 text-xs font-medium text-muted-foreground"
			>
				{group.title}
				{#if group.count}
					<span class="tabular-nums opacity-70">{group.count}</span>
				{/if}
			</h2>
			<ul class="grid gap-px">
				{#each group.items as item (item.href)}
					{@const badge = badgeFor(item.href)}
					<li>
						<a
							href={resolvePathname(item.href)}
							aria-current={page.url.pathname === item.href ? 'page' : undefined}
							onclick={onnavigate}
							class="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-ring aria-[current=page]:bg-accent aria-[current=page]:font-medium aria-[current=page]:text-accent-foreground"
						>
							<span class="truncate">{item.title}</span>
							{#if badge}
								<Badge variant={badge === 'New' ? 'default' : 'outline'} class="ms-auto">
									{badge}
								</Badge>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		</section>
	{/each}
</nav>
