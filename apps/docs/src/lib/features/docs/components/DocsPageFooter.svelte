<script lang="ts">
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import SquarePenIcon from '@lucide/svelte/icons/square-pen';
	import { config } from '#lib/config/app.js';
	import { resolvePathname } from '#lib/utils/paths.js';
	import type { SidebarLink } from '#lib/features/docs/types.js';

	let {
		updated,
		prev,
		next,
		path
	}: { updated?: string; prev?: SidebarLink; next?: SidebarLink; path?: string } = $props();

	const editUrl = $derived(path && `${config.links.github}/edit/main/apps/docs${path}`);

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

{#if formattedUpdated || prev || next || editUrl}
	<footer class="mt-12 border-t pt-6">
		{#if formattedUpdated || editUrl}
			<div class="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
				{#if editUrl}
					<a
						href={editUrl}
						rel="external"
						class="inline-flex items-center gap-1.5 underline-offset-4 hover:text-foreground hover:underline"
					>
						<SquarePenIcon class="size-3.5" aria-hidden="true" />
						Edit this page on GitHub
					</a>
				{/if}
				{#if formattedUpdated}
					<p>Last updated on {formattedUpdated}</p>
				{/if}
			</div>
		{/if}

		{#if prev || next}
			<div
				class={['flex items-start justify-between gap-4', (formattedUpdated || editUrl) && 'mt-6']}
			>
				{#if prev}
					<a href={resolvePathname(prev.href)} class="group flex items-center gap-2 text-start">
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
					<a href={resolvePathname(next.href)} class="group ms-auto flex items-center gap-2">
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
