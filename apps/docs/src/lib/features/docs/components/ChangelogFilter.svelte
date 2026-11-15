<script lang="ts">
	/**
	 * Narrows the changelog to one component, or to breaking changes. The entries are the page's own
	 * Markdown, laid out at build time by `rehype-changelog.ts`, which tags each one with its name and
	 * kind; this only hides what does not match, so the page reads in full without JavaScript.
	 */
	import manifest from '#lib/components/coral/coral.json' with { type: 'json' };
	import Combobox from '#lib/components/coral/kit/combobox/combobox.svelte';
	import { Label } from '#lib/components/ui/label/index.js';
	import { Switch } from '#lib/components/ui/switch/index.js';

	const options = Object.keys(manifest.components)
		.sort()
		.map((name) => ({ value: name, label: name }));

	let name = $state<string>();
	let breaking = $state(false);
	let shown = $state<number>();
	let root = $state<HTMLElement | null>(null);
	const id = $props.id();

	$effect(() => {
		const page = root?.closest('article');
		if (!page) return;

		let count = 0;
		for (const day of page.querySelectorAll<HTMLElement>('.docs-changelog-day')) {
			let visible = 0;
			for (const entry of day.querySelectorAll<HTMLElement>('.docs-changelog-entry')) {
				const match =
					(!name || entry.dataset.name === name) && (!breaking || entry.dataset.kind === 'breaking');
				entry.hidden = !match;
				if (match) visible++;
			}
			day.hidden = visible === 0;
			count += visible;
		}
		shown = name || breaking ? count : undefined;
	});
</script>

<div bind:this={root} class="not-prose my-8 grid gap-3 rounded-lg border p-4">
	<div class="flex flex-wrap items-end gap-x-6 gap-y-3">
		<div class="grid min-w-0 flex-1 basis-60 gap-1.5">
			<Label for="{id}-name">Component</Label>
			<Combobox
				id="{id}-name"
				{options}
				bind:value={name}
				clearable
				placeholder="Every component"
				searchPlaceholder="Search components..."
				class="w-full"
			/>
		</div>
		<div class="flex min-h-8 items-center gap-2">
			<Switch id="{id}-breaking" bind:checked={breaking} />
			<Label for="{id}-breaking">Breaking changes only</Label>
		</div>
	</div>
	<p role="status" class="text-xs text-muted-foreground">
		{#if shown !== undefined}
			{shown === 0 ? 'No entries match.' : `${shown} ${shown === 1 ? 'entry' : 'entries'} shown.`}
		{/if}
	</p>
</div>
