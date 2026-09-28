<script lang="ts">
	/**
	 * @coral/kit/responsive-dialog
	 * @version 1.0.0
	 */
	import { MediaQuery } from 'svelte/reactivity';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import { setResponsiveDialog } from './context.js';
	import type { ResponsiveDialogProps } from './types.js';

	let {
		open = $bindable(false),
		query = '(min-width: 768px)',
		fallback = false,
		onOpenChange,
		children,
		...restProps
	}: ResponsiveDialogProps = $props();

	/**
	 * Rebuilt when the query changes. A `MediaQuery` subscribes to the one list it was created with,
	 * so following a new query means a new instance - which is what deriving it does, and the old
	 * one is let go with its subscription.
	 */
	const media = $derived(new MediaQuery(query, fallback));

	setResponsiveDialog({
		get desktop() {
			return media.current;
		}
	});
</script>

<!--
	Both roots bind the same `open`. Crossing the breakpoint with the dialog open - rotating a tablet,
	resizing a window - unmounts one primitive and mounts the other already open, so the reader keeps
	what they were looking at instead of watching it vanish. Whatever they had typed lives in the
	caller's state, not in the primitive, so it survives the swap too.
-->
{#if media.current}
	<Dialog.Root bind:open {onOpenChange} {...restProps}>
		{@render children?.()}
	</Dialog.Root>
{:else}
	<Drawer.Root bind:open {onOpenChange} {...restProps}>
		{@render children?.()}
	</Drawer.Root>
{/if}
