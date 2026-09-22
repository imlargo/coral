<script lang="ts">
	import { page } from '$app/state';
	import { nav } from './nav.js';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';

	let { class: className }: { class?: string } = $props();

	/** Section + page title for the current route, straight out of the sidebar structure. */
	const trail = $derived.by(() => {
		for (const section of nav) {
			const item = section.items.find(({ href }) => href === page.url.pathname);
			if (item) return { section: section.title, page: item.title };
		}
		return null;
	});
</script>

{#if trail}
	<Breadcrumb.Root class={className}>
		<Breadcrumb.List class="gap-1.5 sm:gap-2">
			<Breadcrumb.Item class="hidden sm:block">
				<span class="text-muted-foreground">{trail.section}</span>
			</Breadcrumb.Item>
			<Breadcrumb.Separator class="hidden sm:block" />
			<Breadcrumb.Item>
				<Breadcrumb.Page class="font-medium">{trail.page}</Breadcrumb.Page>
			</Breadcrumb.Item>
		</Breadcrumb.List>
	</Breadcrumb.Root>
{/if}
