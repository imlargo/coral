<script lang="ts">
	/**
	 * @coral/kit/shortcut
	 * @version 1.1.0
	 */
	import Shortcut from './shortcut.svelte';

	let {
		disabled = false,
		modal = false,
		onclick,
		onpress
	}: {
		disabled?: boolean;
		modal?: boolean;
		onclick?: () => void;
		onpress?: () => void;
	} = $props();
</script>

<button type="button" {disabled} {onclick}>
	Save <Shortcut keys="ctrl+s" platform="other" activate {onpress} />
</button>

{#if modal}
	<div role="dialog" aria-modal="true" aria-label="Delete project">
		<Shortcut keys="ctrl+d" platform="other" {onpress} />
	</div>
	<!-- Where a menu opened from inside the dialog is portaled: after it, outside it. -->
	<div role="menu" aria-label="Actions">
		<Shortcut keys="ctrl+e" platform="other" {onpress} />
	</div>
{/if}
