<script lang="ts">
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<div
	class="mx-auto flex max-w-2xl flex-col items-center gap-6 px-8 py-24 text-center [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:tracking-tight [&_p]:text-lg [&_p]:text-muted-foreground"
>
	{@render children?.()}
</div>
