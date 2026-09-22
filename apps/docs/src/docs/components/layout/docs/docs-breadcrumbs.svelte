<script lang="ts">
	import { page } from '$app/state';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import { DOCS_SIDEBAR_GROUPS } from '$docs/config/sidebar.js';

	let { class: className }: { class?: string } = $props();

	// Section + page title for the current route, straight out of the sidebar structure, so the
	// breadcrumb always matches the page's real title instead of a guess derived from its URL.
	//
	// Compared against the raw `href`, not `resolve(href)`: `resolve()` returns a path relative to
	// the *current* page (e.g. `../../docs/kit/avatar` while already on that page), which never
	// string-equals `page.url.pathname`'s absolute form. `docs-sidebar.svelte`'s own active-item
	// check makes the same choice, for the same reason.
	let trail = $derived.by(() => {
		for (const group of DOCS_SIDEBAR_GROUPS) {
			const item = group.items.find((item) => item.href === page.url.pathname);
			if (item) return { group: group.title, page: item.title };
		}
		return null;
	});
</script>

{#if trail}
	<Breadcrumb.Root class={className}>
		<Breadcrumb.List>
			<Breadcrumb.Item>
				<span class="text-muted-foreground">{trail.group}</span>
			</Breadcrumb.Item>
			<Breadcrumb.Separator>
				<span class="pointer-events-none select-none">/</span>
			</Breadcrumb.Separator>
			<Breadcrumb.Item>
				<Breadcrumb.Page>{trail.page}</Breadcrumb.Page>
			</Breadcrumb.Item>
		</Breadcrumb.List>
	</Breadcrumb.Root>
{/if}
