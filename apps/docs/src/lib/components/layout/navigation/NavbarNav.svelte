<script lang="ts">
	import { resolvePathname } from '#lib/utils/paths.js';
	import * as NavigationMenu from '#lib/components/ui/navigation-menu/index.js';
	import { navigationMenuTriggerStyle } from '#lib/components/ui/navigation-menu/navigation-menu-trigger.svelte';
	import { NAV_ITEMS, isNavGroup } from '#lib/config/navigation.js';
</script>

<NavigationMenu.Root>
	<NavigationMenu.List>
		{#each NAV_ITEMS as entry (entry.title)}
			<NavigationMenu.Item>
				{#if isNavGroup(entry)}
					<NavigationMenu.Trigger>{entry.title}</NavigationMenu.Trigger>
					<NavigationMenu.Content>
						<ul class="grid gap-1 p-1">
							{#each entry.items as link (link.href)}
								<li>
									<NavigationMenu.Link>
										{#snippet child()}
											<a href={resolvePathname(link.href)}>{link.title}</a>
										{/snippet}
									</NavigationMenu.Link>
								</li>
							{/each}
						</ul>
					</NavigationMenu.Content>
				{:else}
					<NavigationMenu.Link>
						{#snippet child()}
							<a href={resolvePathname(entry.href)} class={navigationMenuTriggerStyle()}>
								{entry.title}
							</a>
						{/snippet}
					</NavigationMenu.Link>
				{/if}
			</NavigationMenu.Item>
		{/each}
	</NavigationMenu.List>
</NavigationMenu.Root>
