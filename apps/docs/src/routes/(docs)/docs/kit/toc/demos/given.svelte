<script lang="ts">
	import Toc from '$lib/components/coral/kit/toc/toc.svelte';
	import type { TocHeading } from '$lib/components/coral/kit/toc/types.js';

	// Headings the page already knows about - from a CMS payload, or a markdown pipeline - so
	// nothing is read back out of the DOM, and the ids are its doing rather than Coral's.
	const headings: TocHeading[] = [
		{ id: 'demo-overview', text: 'Overview', level: 2 },
		{ id: 'demo-authentication', text: 'Authentication', level: 2 },
		{ id: 'demo-api-keys', text: 'API keys', level: 3 },
		{ id: 'demo-rotation', text: 'Rotating a key', level: 3 },
		{ id: 'demo-rate-limits', text: 'Rate limits', level: 2 }
	];

	let article = $state<HTMLElement | null>(null);
</script>

<div class="flex w-full max-w-2xl gap-8">
	<div bind:this={article} class="h-56 flex-1 overflow-y-auto rounded-lg border p-4">
		{#each headings as heading (heading.id)}
			<svelte:element
				this={heading.level === 2 ? 'h2' : 'h3'}
				id={heading.id}
				class="mt-4 font-medium first:mt-0 {heading.level === 3 ? 'text-sm' : 'text-base'}"
			>
				{heading.text}
			</svelte:element>
			<p class="mt-2 mb-6 text-sm text-muted-foreground">Content for «{heading.text}».</p>
		{/each}
	</div>

	<Toc
		{headings}
		root={article}
		offset={8}
		class="w-44 [--coral-toc-indent:1.25rem]"
		label="On this page"
	/>
</div>
