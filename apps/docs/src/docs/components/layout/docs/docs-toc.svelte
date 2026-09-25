<script lang="ts">
	import Toc from '$lib/components/coral/kit/toc/toc.svelte';
</script>

<aside
	class="sticky top-[calc(var(--header-height)+2rem)] hidden max-h-[calc(100svh-var(--header-height)-4rem)] w-48 shrink-0 self-start overflow-y-auto xl:block"
>
	<Toc />
</aside>
