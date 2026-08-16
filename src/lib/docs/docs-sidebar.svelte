<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { nav } from './nav.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
</script>

<Sidebar.Root variant="inset">
	<Sidebar.Header class="pb-0">
		<a
			href={resolve('/')}
			class="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-sidebar-accent"
		>
			<span aria-hidden="true" class="text-base">🪸</span>
			<span class="font-semibold tracking-tight">Coral</span>
			<Badge variant="secondary" class="ml-auto font-mono text-[0.65rem]">Kora</Badge>
		</a>
	</Sidebar.Header>

	<Sidebar.Content class="gap-0">
		{#each nav as section (section.title)}
			<Sidebar.Group>
				<Sidebar.GroupLabel
					class="text-[0.7rem] font-medium tracking-wider text-muted-foreground uppercase"
				>
					{section.title}
				</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					{#if section.items.length === 0}
						<p class="px-2 py-1 text-xs leading-relaxed text-muted-foreground/70">
							{section.empty}
						</p>
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
		<p class="px-2 text-xs leading-relaxed text-muted-foreground/70">
			Copied into projects, not installed.
		</p>
	</Sidebar.Footer>
</Sidebar.Root>
