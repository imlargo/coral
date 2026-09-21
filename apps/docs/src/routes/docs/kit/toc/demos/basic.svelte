<script lang="ts">
	import Toc from '$lib/components/coral/kit/toc/toc.svelte';

	// The article scrolls inside its own box here, so the demo does not hijack the page. In a normal
	// page you leave `root` out and the table of contents follows the window.
	let article = $state<HTMLElement | null>(null);
	let active = $state('');

	const sections = [
		[
			'Installation',
			'Copy the folder into your project and add the shadcn primitives its manifest declares. From that moment the code is yours, versioned with the rest of the repository.'
		],
		[
			'Usage',
			'Import the component by its file path - there are no barrels. Pass a container when the article lives inside a panel with its own scrollbar, as it does in this demo.'
		],
		[
			'Props',
			'Everything the wrapped element accepts stays available. What Coral adds is the active-heading calculation and the anchors the markup was missing.'
		],
		[
			'Accessibility',
			'The active link carries aria-current="location", and after a smooth scroll focus lands on the heading rather than back at the top of the page.'
		]
	];
</script>

<div class="flex w-full max-w-2xl gap-8">
	<div
		bind:this={article}
		class="h-64 flex-1 [scroll-padding-top:1rem] overflow-y-auto rounded-lg border p-4 [&_h2]:scroll-mt-0"
	>
		{#each sections as [title, body] (title)}
			<h2 class="mt-4 text-base font-medium first:mt-0">{title}</h2>
			<p class="mt-2 mb-10 text-sm text-muted-foreground">{body}</p>
		{/each}
	</div>

	<div class="w-44 shrink-0">
		<Toc
			container={article}
			root={article}
			offset={24}
			bind:active
			label="On this page"
			minHeadings={1}
		>
			{#snippet heading()}
				<span class="text-xs font-medium tracking-wider text-muted-foreground uppercase">
					On this page
				</span>
			{/snippet}
		</Toc>
		<p class="mt-3 text-xs text-muted-foreground">Active: {active || '—'}</p>
	</div>
</div>
