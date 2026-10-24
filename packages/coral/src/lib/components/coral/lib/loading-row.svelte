<script lang="ts">
	/**
	 * @coral/lib/loading-row
	 * @version 1.0.0
	 */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Spinner } from '#lib/components/ui/spinner/index.js';

	let {
		label,
		indicator,
		...restProps
	}: HTMLAttributes<HTMLDivElement> & {
		/** What the row is called while it shows - the caller's `loadingLabel`. */
		label: string;
		/** Replaces the spinner. The row keeps its name either way. */
		indicator?: Snippet;
	} = $props();
</script>

<!--
	The name sits on the row, written after the spread: the row is whatever the list's primitive
	hands over - a progressbar, an option - and those arrive already named in English.
-->
<div {...restProps} aria-label={label}>
	{#if indicator}
		{@render indicator()}
	{:else}
		<div class="flex items-center justify-center py-6">
			<Spinner class="opacity-50" aria-hidden="true" />
		</div>
	{/if}
</div>
