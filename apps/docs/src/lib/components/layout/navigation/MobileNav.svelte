<script lang="ts">
	import MenuIcon from '@lucide/svelte/icons/menu';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Sheet from '#lib/components/ui/sheet/index.js';
	import DocsNav from '#lib/components/layout/docs/DocsNav.svelte';
	import { config } from '#lib/config/app.js';
	import { NAV_ITEMS } from '#lib/config/navigation.js';
	import { resolvePathname } from '#lib/utils/paths.js';

	let open = $state(false);
	const close = () => (open = false);
</script>

<Sheet.Root bind:open>
	<Sheet.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="icon" class="md:hidden" aria-label="Open navigation">
				<MenuIcon />
			</Button>
		{/snippet}
	</Sheet.Trigger>
	<Sheet.Content side="left" class="gap-0 overflow-y-auto">
		<Sheet.Header class="border-b">
			<Sheet.Title class="flex items-center gap-2">
				<img src={config.branding.logo} alt="" class="size-5" />
				{config.branding.name}
			</Sheet.Title>
			<Sheet.Description class="sr-only">Every page of the documentation.</Sheet.Description>
		</Sheet.Header>
		<div class="grid gap-6 p-4">
			<nav aria-label="Site">
				<ul class="grid gap-px">
					{#each NAV_ITEMS as item (item.href)}
						<li>
							<a
								href={resolvePathname(item.href)}
								onclick={close}
								class="flex rounded-md px-2 py-1.5 text-sm font-medium hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
							>
								{item.title}
							</a>
						</li>
					{/each}
				</ul>
			</nav>
			<DocsNav onnavigate={close} />
		</div>
	</Sheet.Content>
</Sheet.Root>
