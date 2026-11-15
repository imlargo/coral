<script lang="ts">
	import { page } from '$app/state';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	// The button's look without its component: `Sidebar.MenuButton` needs a `Sidebar.Provider`, and
	// this list is also drawn in the navbar's sheet on phones, outside any provider.
	import { sidebarMenuButtonVariants } from '#lib/components/ui/sidebar/sidebar-menu-button.svelte';
	import { DOCS_SIDEBAR_GROUPS } from '#lib/features/docs/sidebar.js';
	import { resolvePathname } from '#lib/utils/paths.js';

	let {
		/** Called after a link is followed, so a sheet holding the list can close. */
		onnavigate
	}: { onnavigate?: () => void } = $props();
</script>

<nav aria-label="Documentation">
	{#each DOCS_SIDEBAR_GROUPS as group (group.title)}
		<Sidebar.Group>
			<Sidebar.GroupLabel>{group.title}</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each group.items as item (item.href)}
						{@const active = page.url.pathname === item.href}
						<Sidebar.MenuItem>
							<a
								href={resolvePathname(item.href)}
								aria-current={active ? 'page' : undefined}
								data-active={active || undefined}
								onclick={onnavigate}
								class={sidebarMenuButtonVariants()}
							>
								<span>{item.title}</span>
							</a>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	{/each}
</nav>
