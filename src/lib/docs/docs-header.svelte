<script lang="ts">
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunIcon from '@lucide/svelte/icons/sun';
	import { toggleMode } from 'mode-watcher';
	import { page } from '$app/state';
	import { nav } from './nav.js';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { SidebarTrigger } from '$lib/components/ui/sidebar/index.js';

	/** Section + page title for the current route, straight out of the sidebar structure. */
	const trail = $derived.by(() => {
		for (const section of nav) {
			const item = section.items.find(({ href }) => href === page.url.pathname);
			if (item) return { section: section.title, page: item.title };
		}
		return null;
	});
</script>

<header
	class="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur"
>
	<SidebarTrigger class="-ml-1" />
	<Separator orientation="vertical" class="mr-2 h-4" />

	{#if trail}
		<Breadcrumb.Root>
			<Breadcrumb.List>
				<Breadcrumb.Item class="hidden sm:block">
					<span class="text-muted-foreground">{trail.section}</span>
				</Breadcrumb.Item>
				<Breadcrumb.Separator class="hidden sm:block" />
				<Breadcrumb.Item>
					<Breadcrumb.Page>{trail.page}</Breadcrumb.Page>
				</Breadcrumb.Item>
			</Breadcrumb.List>
		</Breadcrumb.Root>
	{/if}

	<Button
		variant="ghost"
		size="icon"
		class="ml-auto"
		onclick={toggleMode}
		aria-label="Toggle theme"
	>
		<SunIcon class="dark:hidden" />
		<MoonIcon class="hidden dark:block" />
	</Button>
</header>
