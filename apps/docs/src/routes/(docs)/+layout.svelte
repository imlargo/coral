<script lang="ts">
	import DocsSidebar from '#lib/components/layout/docs/DocsSidebar.svelte';
	import DocsToc from '#lib/components/layout/docs/DocsToc.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<!-- The page scrolls as a whole, under a sticky navbar; the sidebar and the table of contents stay
     pinned beside it, each scrolling on its own only when it is taller than the viewport. -->
<div class="flex">
	<DocsSidebar />
	<main class="flex min-w-0 flex-1 gap-10 px-4 py-8 sm:px-8 lg:py-12">
		<div class="mx-auto w-full max-w-3xl min-w-0">
			{@render children?.()}
		</div>
		<DocsToc />
	</main>
</div>
