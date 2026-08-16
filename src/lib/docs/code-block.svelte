<script lang="ts">
	import CopyButton from './copy-button.svelte';
	import { cn } from '$lib/utils.js';

	let {
		/** Highlighted HTML produced at build time by `shiki.js`. */
		html,
		/** The same code as plain text — what the copy button puts on the clipboard. */
		text,
		class: className
	}: { html: string; text: string; class?: string } = $props();
</script>

<div class={cn('group relative', className)}>
	<CopyButton
		{text}
		class="absolute top-2 right-2 z-10 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
	/>
	<div class="docs-code overflow-x-auto">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- build-time output of our own highlighter -->
		{@html html}
	</div>
</div>
