<script lang="ts">
	import DocsNav from '#lib/components/layout/docs/DocsNav.svelte';
</script>

<!-- Pinned beside the page under the navbar, scrolling on its own only when it is taller than the
     viewport. Below `md` the same list lives in the navbar's sheet instead. -->
<aside
	class="sticky top-(--header-height) hidden h-[calc(100svh-var(--header-height))] w-64 shrink-0 [scrollbar-width:thin] [scrollbar-color:transparent_transparent] overflow-y-auto border-e px-4 py-6 hover:[scrollbar-color:var(--color-border)_transparent] md:block"
>
	<DocsNav />
</aside>
