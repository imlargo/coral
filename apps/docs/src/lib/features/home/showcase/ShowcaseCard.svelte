<script lang="ts">
	import type { Snippet } from 'svelte';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import * as Card from '#lib/components/ui/card/index.js';
	import { resolvePathname } from '#lib/utils/paths.js';

	let {
		title,
		description,
		/** What to try, in a few words: the behavior this card exists to show. */
		hint,
		/** The components the card is built from, as manifest names: `kit/combobox`. */
		components,
		children
	}: {
		title: string;
		description: string;
		hint: string;
		components: string[];
		children: Snippet;
	} = $props();
</script>

<Card.Root class="break-inside-avoid">
	<Card.Header>
		<Card.Title>{title}</Card.Title>
		<Card.Description>{description}</Card.Description>
	</Card.Header>
	<Card.Content class="grid gap-4">
		{@render children()}
	</Card.Content>
	<Card.Footer class="flex flex-col items-start gap-2 border-t text-xs text-muted-foreground">
		<p>{hint}</p>
		<ul class="flex flex-wrap gap-x-3 gap-y-1">
			{#each components as name (name)}
				<li>
					<a
						href={resolvePathname(`/docs/${name}`)}
						class="inline-flex items-center gap-1 font-medium text-foreground underline-offset-4 hover:underline"
					>
						{name.replace(/^kit\//, '')}
						<ArrowRightIcon class="size-3" aria-hidden="true" />
					</a>
				</li>
			{/each}
		</ul>
	</Card.Footer>
</Card.Root>
