<script lang="ts">
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import { page } from '$app/state';
	import { pages } from './nav.js';

	const index = $derived(pages.findIndex(({ href }) => href === page.url.pathname));
	const previous = $derived(index > 0 ? pages[index - 1] : null);
	const next = $derived(index >= 0 && index < pages.length - 1 ? pages[index + 1] : null);

	const card =
		'group flex flex-col gap-1 rounded-lg border p-4 transition-colors hover:border-foreground/20 hover:bg-muted/40';
	const label = 'flex items-center gap-1.5 text-xs text-muted-foreground';
</script>

{#if previous || next}
	<nav aria-label="Pagination" class="mt-16 grid gap-3 border-t pt-8 sm:grid-cols-2">
		{#if previous}
			<a href={previous.href} class={card}>
				<span class={label}>
					<ArrowLeftIcon class="size-3.5 transition-transform group-hover:-translate-x-0.5" />
					Previous
				</span>
				<span class="font-medium">{previous.title}</span>
			</a>
		{:else}
			<span class="hidden sm:block"></span>
		{/if}

		{#if next}
			<a href={next.href} class="{card} sm:items-end sm:text-right">
				<span class={label}>
					Next
					<ArrowRightIcon class="size-3.5 transition-transform group-hover:translate-x-0.5" />
				</span>
				<span class="font-medium">{next.title}</span>
			</a>
		{/if}
	</nav>
{/if}
