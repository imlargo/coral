<script lang="ts">
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import DocsSidebar from '#lib/components/layout/docs/DocsSidebar.svelte';
	import DocsToc from '#lib/components/layout/docs/DocsToc.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<Sidebar.Provider style="height: calc(100svh - var(--header-height));">
	<DocsSidebar />
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
