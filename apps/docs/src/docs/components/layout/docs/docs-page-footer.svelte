<script lang="ts">
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import type { SidebarLink } from '$docs/config/sidebar.js';

	let { updated, prev, next }: { updated?: string; prev?: SidebarLink; next?: SidebarLink } =
		$props();

	// Parsed as a local calendar date rather than `new Date(updated)`: a date-only string parses as
	// UTC midnight, which `toLocaleDateString` in a negative UTC offset then renders as the day
	// before.
	const formattedUpdated = $derived.by(() => {
		if (!updated) return null;
		const [year, month, day] = updated.split('-').map(Number);
		return new Date(year, month - 1, day).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	});
</script>

{#if formattedUpdated || prev || next}
	<footer class="mt-12 border-t pt-6">
		{#if formattedUpdated}
			<p class="text-xs text-muted-foreground">Last updated on {formattedUpdated}</p>
		{/if}

		{#if prev || next}
			<div class={['flex items-start justify-between gap-4', formattedUpdated && 'mt-4']}>
				{#if prev}
					<a href={resolve(prev.href as Pathname)} class="group flex items-center gap-2 text-start">
						<ChevronLeftIcon
							class="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5"
						/>
						<span>
							<span class="block text-xs text-muted-foreground">Previous</span>
							<span class="block text-sm font-medium">{prev.title}</span>
						</span>
					</a>
				{:else}
					<span></span>
				{/if}

				{#if next}
					<a href={resolve(next.href as Pathname)} class="group ms-auto flex items-center gap-2">
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
		{/if}
	</footer>
{/if}
