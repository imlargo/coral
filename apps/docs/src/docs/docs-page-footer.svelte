<script lang="ts">
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import { page } from '$app/state';
	import { pages } from './nav.js';

	const index = $derived(pages.findIndex(({ href }) => href === page.url.pathname));
	const previous = $derived(index > 0 ? pages[index - 1] : null);
	const next = $derived(index >= 0 && index < pages.length - 1 ? pages[index + 1] : null);
</script>

{#if previous || next}
	<footer class="mt-12 border-t pt-6">
		<div class="flex items-start justify-between gap-4">
			{#if previous}
				<a href={previous.href} class="group flex items-center gap-2 text-start">
					<ChevronLeftIcon
						class="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5"
					/>
					<span>
						<span class="block text-xs text-muted-foreground">Previous</span>
						<span class="block text-sm font-medium">{previous.title}</span>
					</span>
				</a>
			{:else}
				<span></span>
			{/if}

			{#if next}
				<a href={next.href} class="group ms-auto flex items-center gap-2">
					<span class="text-end">
						<span class="block text-xs text-muted-foreground">Next</span>
						<span class="block text-sm font-medium">{next.title}</span>
					</span>
					<ChevronRightIcon
						class="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
					/>
				</a>
			{:else}
				<span></span>
			{/if}
		</div>
	</footer>
{/if}
