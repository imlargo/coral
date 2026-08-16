<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';

	let { text, class: className }: { text: string; class?: string } = $props();

	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout>;

	async function copy() {
		await navigator.clipboard.writeText(text);
		copied = true;
		clearTimeout(timer);
		timer = setTimeout(() => (copied = false), 2000);
	}
</script>

<!--
	Always rendered, only dimmed. Gating visibility on `:hover` leaves touch devices with no way to
	copy at all, and hands screen-reader users a control that appears out of nowhere.
-->
<Button
	variant="ghost"
	size="icon-xs"
	class={cn(
		'text-muted-foreground opacity-60 transition hover:bg-accent hover:text-foreground hover:opacity-100 focus-visible:opacity-100',
		copied && 'text-foreground opacity-100',
		className
	)}
	aria-label={copied ? 'Copied' : 'Copy to clipboard'}
	onclick={copy}
>
	{#if copied}
		<CheckIcon />
	{:else}
		<CopyIcon />
	{/if}
</Button>
