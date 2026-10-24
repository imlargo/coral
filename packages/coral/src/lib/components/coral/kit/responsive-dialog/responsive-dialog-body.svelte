<script lang="ts">
	/**
	 * @coral/kit/responsive-dialog
	 * @version 1.1.0
	 */
	import { cn } from '#lib/utils.js';
	import { getResponsiveDialog } from './context.js';
	import type { ResponsiveDialogSectionProps } from './types.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: ResponsiveDialogSectionProps = $props();

	const dialog = getResponsiveDialog();
</script>

<!--
	The drawer pads its header and footer but not what sits between them, and caps its own height: a
	form would touch the screen edges, and one taller than the cap could not scroll. The padding is
	the drawer header's own. The dialog already pads its whole content, so there this is a plain
	wrapper.
-->
<div
	bind:this={ref}
	data-slot="responsive-dialog-body"
	class={cn(!dialog.desktop && 'min-h-0 overflow-y-auto px-4', className)}
	{...restProps}
>
	{@render children?.()}
</div>
