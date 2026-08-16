<script lang="ts">
	import DocsHeader from '$lib/docs/docs-header.svelte';
	import DocsSidebar from '$lib/docs/docs-sidebar.svelte';
	import PageFooter from '$lib/docs/page-footer.svelte';
	import Toc from '$lib/docs/toc.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	let { children } = $props();
</script>

<Sidebar.Provider>
	<DocsSidebar />

	<Sidebar.Inset class="min-w-0">
		<DocsHeader />

		<div class="mx-auto flex w-full max-w-5xl gap-12 px-6 py-10 lg:px-10 xl:max-w-6xl">
			<main id="main-content" class="min-w-0 flex-1">
				{@render children()}
				<PageFooter />
			</main>

			<!-- Sticky under the 3.5rem header, so the outline stays put while the page scrolls. -->
			<aside class="sticky top-[4.5rem] hidden h-fit w-52 shrink-0 xl:block">
				<Toc />
			</aside>
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
