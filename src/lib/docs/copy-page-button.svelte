<script lang="ts">
	/** Copies the current page's raw Markdown source - the source `+page.md` is written in, not
	    the rendered HTML - so pasting it into an LLM gives the same content a reader sees. */
	import CheckIcon from '@lucide/svelte/icons/check';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import { page } from '$app/state';
	import { pages } from 'virtual:coral-docs-index';
	import { Button } from '$lib/components/ui/button/index.js';

	const raw = $derived(pages.find((entry) => entry.href === page.url.pathname)?.raw);

	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout>;

	async function copy() {
		if (!raw) return;
		await navigator.clipboard.writeText(raw);
		copied = true;
		clearTimeout(timer);
		timer = setTimeout(() => (copied = false), 2000);
	}
</script>

{#if raw}
	<Button variant="outline" size="sm" onclick={copy}>
		{#if copied}
			<CheckIcon />
			Copied
		{:else}
			<CopyIcon />
			Copy page
		{/if}
	</Button>
{/if}
