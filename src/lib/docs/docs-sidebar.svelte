<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { nav } from './nav.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
</script>

<Sidebar.Root variant="inset">
	<Sidebar.Header>
		<a href={resolve('/')} class="flex items-center gap-2 px-2 py-1 font-semibold">
			<span aria-hidden="true">🪸</span>
			Coral
		</a>
	</Sidebar.Header>

	<Sidebar.Content>
		{#each nav as section (section.title)}
			<Sidebar.Group>
				<Sidebar.GroupLabel>{section.title}</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					{#if section.items.length === 0}
						<p class="px-2 py-1 text-xs text-muted-foreground">{section.empty}</p>
					{:else}
						<Sidebar.Menu>
							{#each section.items as item (item.href)}
								<Sidebar.MenuItem>
									<Sidebar.MenuButton isActive={page.url.pathname === item.href}>
										{#snippet child({ props })}
											<a href={item.href} {...props}>{item.title}</a>
										{/snippet}
									</Sidebar.MenuButton>
								</Sidebar.MenuItem>
							{/each}
						</Sidebar.Menu>
					{/if}
				</Sidebar.GroupContent>
			</Sidebar.Group>
		{/each}
	</Sidebar.Content>

	<Sidebar.Footer>
		<p class="px-2 text-xs text-muted-foreground">Internal to Kora. Copied, not installed.</p>
	</Sidebar.Footer>
</Sidebar.Root>
