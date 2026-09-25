<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { DOCS_SIDEBAR_GROUPS } from '$docs/config/sidebar.js';
	import type { ComponentProps } from 'svelte';

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();

	function isActive(href: string): boolean {
		return page.url.pathname === href;
	}
</script>

<Sidebar.Root {...restProps} bind:ref collapsible="none" class="bg-transparent">
	<!-- The scrollbar thumb stays transparent until the pointer is over the list. -->
	<Sidebar.Content
		class="[scrollbar-width:thin] [scrollbar-color:transparent_transparent] px-4 pt-4 hover:[scrollbar-color:var(--color-border)_transparent]"
	>
		{#each DOCS_SIDEBAR_GROUPS as group (group.title)}
			<Sidebar.Group>
				<Sidebar.GroupLabel>{group.title}</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					{#if group.items.length === 0}
						<p class="px-2 py-1.5 text-sm text-muted-foreground">Coming soon</p>
					{/if}
					<Sidebar.Menu>
						{#each group.items as item (item.href)}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton isActive={isActive(item.href)}>
									{#snippet child({ props })}
										<a href={resolve(item.href as Pathname)} {...props}>{item.title}</a>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		{/each}
	</Sidebar.Content>
	<!-- Temporary footer, a placeholder until there is something real to put here. -->
	<Sidebar.Footer class="px-6 py-4 text-xs text-muted-foreground">
		Coral · open source, MIT
	</Sidebar.Footer>
</Sidebar.Root>
