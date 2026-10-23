<script lang="ts">
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import DocsSidebar from '#lib/components/layout/docs/DocsSidebar.svelte';
	import DocsToc from '#lib/components/layout/docs/DocsToc.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<!-- The page scrolls as a whole, under a sticky navbar; the sidebar and the table of contents stay
     pinned beside it, each scrolling on its own only when it is taller than the viewport. -->
<Sidebar.Provider class="min-h-[calc(100svh-var(--header-height))]">
	<div class="sticky top-(--header-height) h-[calc(100svh-var(--header-height))] shrink-0">
		<DocsSidebar />
	</div>
	<Sidebar.Inset>
		<div class="flex w-full gap-8 px-8 py-12">
			<div class="min-w-0 flex-1">
				<div class="mx-auto max-w-3xl">
					{@render children?.()}
				</div>
			</div>
			<DocsToc />
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
