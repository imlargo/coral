<script lang="ts">
	import CopyButton from '#lib/features/docs/components/CopyButton.svelte';
	import { cn } from '#lib/utils.js';

	let {
		/** Highlighted HTML produced at build time by `code-highlighter.ts`. */
		html,
		/** The same code as plain text - what the copy button puts on the clipboard. */
		text,
		/** Shown in the corner so the reader knows what they are looking at before reading it. */
		lang,
		/** Off where the frame around the block already has a copy button. */
		copy = true,
		class: className
	}: { html: string; text: string; lang?: string; copy?: boolean; class?: string } = $props();
</script>

<div class={cn('relative', className)}>
	{#if copy || lang}
		<div class="absolute top-1.5 right-1.5 z-10 flex items-center gap-1.5">
			{#if lang}
				<span class="hidden font-mono text-xs text-muted-foreground sm:inline">{lang}</span>
			{/if}
			{#if copy}
				<CopyButton {text} />
			{/if}
		</div>
	{/if}
	<div class="docs-code">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- build-time output of our own highlighter -->
		{@html html}
	</div>
</div>
