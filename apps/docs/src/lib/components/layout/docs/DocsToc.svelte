<script lang="ts">
	import { page } from '$app/state';
	import Toc from '#lib/components/coral/kit/toc/toc.svelte';
</script>

<aside
	class="sticky top-[calc(var(--header-height)+2rem)] hidden max-h-[calc(100svh-var(--header-height)-4rem)] w-48 shrink-0 self-start overflow-y-auto xl:block"
>
	<!-- The layout outlives a navigation, so each page gets its own Toc. A docs page hands over the
	     headings svmd read at build time; any other page falls back to reading the rendered one. -->
	{#key page.url.pathname}
		<Toc headings={page.data.toc} />
	{/key}
</aside>
