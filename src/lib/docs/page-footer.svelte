<script lang="ts">
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import { page } from '$app/state';
	import { pages } from './nav.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';

	const index = $derived(pages.findIndex(({ href }) => href === page.url.pathname));
	const previous = $derived(index > 0 ? pages[index - 1] : null);
	const next = $derived(index >= 0 && index < pages.length - 1 ? pages[index + 1] : null);
</script>

{#if previous || next}
	<nav aria-label="Pagination" class="mt-12 flex items-center justify-between gap-4 border-t pt-6">
		{#if previous}
			<a href={previous.href} class={buttonVariants({ variant: 'outline' })}>
				<ArrowLeftIcon />
				{previous.title}
			</a>
		{:else}
			<span></span>
		{/if}

		{#if next}
			<a href={next.href} class={buttonVariants({ variant: 'outline' })}>
				{next.title}
				<ArrowRightIcon />
			</a>
		{/if}
	</nav>
{/if}
