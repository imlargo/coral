<script lang="ts">
	import { resolvePath } from '#docs/resolve-path.js';
	import * as NavigationMenu from '#lib/components/ui/navigation-menu/index.js';
	import { navigationMenuTriggerStyle } from '#lib/components/ui/navigation-menu/navigation-menu-trigger.svelte';
	import { NAV_ITEMS, isNavGroup } from '#docs/config/navigation.js';
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
											<a href={resolvePath(link.href)}>{link.title}</a>
										{/snippet}
									</NavigationMenu.Link>
								</li>
							{/each}
						</ul>
					</NavigationMenu.Content>
				{:else}
					<NavigationMenu.Link>
						{#snippet child()}
							<a href={resolvePath(entry.href)} class={navigationMenuTriggerStyle()}>
								{entry.title}
							</a>
						{/snippet}
					</NavigationMenu.Link>
				{/if}
			</NavigationMenu.Item>
		{/each}
	</NavigationMenu.List>
</NavigationMenu.Root>
