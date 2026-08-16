<script lang="ts">
	import CopyButton from './copy-button.svelte';
	import { cn } from '$lib/utils.js';

	let {
		/** Highlighted HTML produced at build time by `shiki.js`. */
		html,
		/** The same code as plain text — what the copy button puts on the clipboard. */
		text,
		/** Shown in the corner so the reader knows what they are looking at before reading it. */
		lang,
		class: className
	}: { html: string; text: string; lang?: string; class?: string } = $props();
</script>

<div class={cn('relative', className)}>
	<div class="absolute top-1.5 right-1.5 z-10 flex items-center gap-1.5">
		{#if lang}
			<span
				class="hidden font-mono text-[0.7rem] tracking-wide text-muted-foreground uppercase sm:inline"
			>
				{lang}
			</span>
		{/if}
		<CopyButton {text} />
	</div>
	<div class="docs-code">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- build-time output of our own highlighter -->
		{@html html}
	</div>
</div>
