<script lang="ts">
	/**
	 * @coral/kit/confirm-dialog
	 * @version 1.0.0
	 */
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { Spinner } from '$lib/components/ui/spinner/index.js';
	import { cn } from '$lib/utils.js';
	import type { ConfirmDialogProps } from './types.js';

	let {
		title,
		description,
		confirmLabel = 'Continue',
		cancelLabel = 'Cancel',
		showCancel = true,
		variant = 'default',
		onconfirm,
		oncancel,
		onOpenChange,
		pending,
		size = 'default',
		open = $bindable(false),
		class: className,
		trigger,
		children,
		...restProps
	}: ConfirmDialogProps = $props();

	let running = $state(false);

	/** The caller's flag wins when it passes one, so two sources never fight over the same button. */
	const busy = $derived(pending ?? running);

	/**
	 * Runs the confirmation and decides whether the dialog has earned the right to close.
	 *
	 * A write can fail. Closing on click - the primitive's own behaviour, and every hand-written
	 * version in the corpus - throws away the one place that failure could be reported. So the
	 * close waits for the promise, and a rejection or an explicit `false` keeps the dialog open.
	 * `busy` guards the entry too: a second click would submit the same destructive action twice.
	 */
	async function confirm() {
		if (busy) return;

		if (!onconfirm) {
			open = false;
			return;
		}

		running = true;
		try {
			if ((await onconfirm()) === false) return;
			open = false;
		} finally {
			running = false;
		}
	}

	/**
	 * `oncancel` hangs off the primitive's own close - the cancel button or Escape, the only things
	 * that mean the reader declined. Confirming closes by assigning `open`, which the primitive does
	 * not report, so the two paths need no "was it a confirm?" flag to stay apart.
	 */
	function handleOpenChange(next: boolean) {
		if (!next) oncancel?.();
		onOpenChange?.(next);
	}
</script>

<AlertDialog.Root bind:open onOpenChange={handleOpenChange} {...restProps}>
	{#if trigger}
		<AlertDialog.Trigger>
			{#snippet child({ props })}
				{@render trigger({ props })}
			{/snippet}
		</AlertDialog.Trigger>
	{/if}

	<!--
		Escape stops closing while a request is open. Letting it through would read as "cancelled" for
		something already on its way to the server - the dialog disappears and the delete lands
		anyway. Clicks outside are ignored by the primitive already, which is why this is an
		alert-dialog and not a dialog.
	-->
	<AlertDialog.Content
		{size}
		class={cn(className)}
		onEscapeKeydown={(event) => {
			if (busy) event.preventDefault();
		}}
	>
		<AlertDialog.Header>
			<AlertDialog.Title>{title}</AlertDialog.Title>
			{#if description}
				<AlertDialog.Description>{description}</AlertDialog.Description>
			{/if}
		</AlertDialog.Header>

		{@render children?.()}

		<AlertDialog.Footer>
			{#if showCancel}
				<!--
					Rendered through `child` because the primitive keeps `disabled` for itself: it stops
					the close handler but never reaches the button, which would leave a control that
					looks pressable and does nothing. The element it hands back already carries the
					theme's button classes, so it only needs the attribute the primitive withheld.
				-->
				<AlertDialog.Cancel disabled={busy}>
					{#snippet child({ props })}
						<button {...props} type="button" disabled={busy}>{cancelLabel}</button>
					{/snippet}
				</AlertDialog.Cancel>
			{/if}

			<!--
				Straight through, no `child`: the primitive's own `variant` is what the theme styles the
				button with, and it forwards `disabled` to the element unchanged. Wrapping it in a
				second button would hand the outer class down to the inner one and quietly repaint a
				destructive action in the default colour.
			-->
			<AlertDialog.Action {variant} disabled={busy} onclick={confirm}>
				{#if busy}
					<Spinner />
				{/if}
				{confirmLabel}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
