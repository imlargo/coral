<script lang="ts">
	import DocsSidebar from '$docs/docs-sidebar.svelte';
	import Toc from '$lib/components/coral/kit/toc/toc.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import DocsBreadcrumbs from '$docs/docs-breadcrumbs.svelte';

	let { children } = $props();
</script>

<Sidebar.Provider style="height: calc(100svh - var(--header-height));">
	<DocsSidebar />

	<Sidebar.Inset class="min-w-0">
		<div
			class="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur-sm"
		>
			<Sidebar.Trigger class="-ml-1" />
			<Separator orientation="vertical" class="mr-1 h-4" />
			<DocsBreadcrumbs />
		</div>

		<div class="mx-auto flex w-full max-w-5xl gap-12 px-6 py-10 lg:px-10 xl:max-w-6xl">
			<main class="min-w-0 flex-1">
				{@render children()}
			</main>

			<!-- Sticky under the docs bar, so the outline stays put while the page scrolls. -->
			<aside class="sticky top-[4.5rem] hidden h-fit w-52 shrink-0 xl:block">
				<Toc />
			</aside>
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
