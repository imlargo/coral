<script lang="ts" generics="T">
	/**
	 * @coral/blocks/form-dialog
	 * @version 1.0.0
	 */
	import { tick } from 'svelte';
	import * as Alert from '#lib/components/ui/alert/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import ActionButton from '../../kit/action-button/action-button.svelte';
	import ConfirmDialog from '../../kit/confirm-dialog/confirm-dialog.svelte';
	import ResponsiveDialog from '../../kit/responsive-dialog/responsive-dialog.svelte';
	import ResponsiveDialogBody from '../../kit/responsive-dialog/responsive-dialog-body.svelte';
	import ResponsiveDialogContent from '../../kit/responsive-dialog/responsive-dialog-content.svelte';
	import ResponsiveDialogDescription from '../../kit/responsive-dialog/responsive-dialog-description.svelte';
	import ResponsiveDialogFooter from '../../kit/responsive-dialog/responsive-dialog-footer.svelte';
	import ResponsiveDialogHeader from '../../kit/responsive-dialog/responsive-dialog-header.svelte';
	import ResponsiveDialogTitle from '../../kit/responsive-dialog/responsive-dialog-title.svelte';
	import ResponsiveDialogTrigger from '../../kit/responsive-dialog/responsive-dialog-trigger.svelte';
	import { Action } from '../../lib/action.svelte.js';
	import { getCoralDefaults } from '../../lib/defaults.js';
	import type { FormDialogProps } from './types.js';

	const defaults = getCoralDefaults('blocks/form-dialog');

	let {
		draft,
		open = $bindable(false),
		title,
		description,
		onsubmit,
		onerror,
		oncancel,
		onOpenChange,
		submitLabel = defaults.submitLabel ?? 'Save',
		cancelLabel = defaults.cancelLabel ?? 'Cancel',
		failedMessage = defaults.failedMessage ?? 'Could not save. Check the fields and try again.',
		discardTitle = defaults.discardTitle ?? 'Discard changes?',
		discardDescription = defaults.discardDescription ?? 'What you typed will be lost.',
		discardLabel = defaults.discardLabel ?? 'Discard',
		keepLabel = defaults.keepLabel ?? 'Keep editing',
		class: className,
		trigger,
		children,
		footer,
		...restProps
	}: FormDialogProps<T> = $props();

	const action = new Action();
	const pending = $derived(action.running);
	const dirty = $derived(draft.dirty);

	let form = $state<HTMLFormElement | null>(null);
	let failed = $state(false);
	let asking = $state(false);

	/**
	 * Every opening starts from the record as it is now, so a dialog reused for another record never
	 * shows the previous one's values, and a failed attempt left behind is not shown again.
	 */
	let wasOpen = false;
	$effect(() => {
		if (open && !wasOpen) {
			draft.reset();
			failed = false;
		}
		wasOpen = open;
	});

	/**
	 * Submits what the draft holds, as plain data. Closing waits for the promise; a refusal keeps
	 * the dialog open with the input as typed, says what went wrong beside the fields, and puts
	 * focus on the first field that is marked invalid, which is where fixing it starts.
	 */
	async function submit() {
		if (pending) return;
		failed = false;

		let done: boolean;
		try {
			done = await action.run(() => onsubmit($state.snapshot(draft.current) as T));
		} catch (error) {
			done = false;
			if (!onerror) {
				failed = true;
				throw error;
			}
			onerror(error);
		}

		if (done) {
			open = false;
			return;
		}

		failed = true;
		await tick();
		form?.querySelector<HTMLElement>('[aria-invalid="true"], :invalid')?.focus();
	}

	/** Leaves, unless there is something to lose - then it asks first. */
	function cancel() {
		if (pending) return;
		if (dirty) {
			asking = true;
			return;
		}
		leave();
	}

	function leave() {
		open = false;
		oncancel?.();
	}

	/**
	 * Escape and a click outside go through the same question. They are stopped before the
	 * primitive closes anything, so the dialog does not blink shut and open again around it.
	 */
	function guard(event: Event) {
		if (pending || dirty) {
			event.preventDefault();
			cancel();
		}
	}

	/**
	 * Whatever closed the dialog that the guards above did not see - the drawer dragged shut - lands
	 * here. With changes to lose the dialog is put back and the question asked.
	 */
	function handleOpenChange(next: boolean) {
		if (!next && (pending || dirty)) {
			open = true;
			if (!pending) asking = true;
			return;
		}
		if (!next) oncancel?.();
		onOpenChange?.(next);
	}

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submit();
	}
</script>

<ResponsiveDialog bind:open onOpenChange={handleOpenChange} {...restProps}>
	{#if trigger}
		<ResponsiveDialogTrigger>
			{#snippet child({ props })}
				{@render trigger({ props })}
			{/snippet}
		</ResponsiveDialogTrigger>
	{/if}

	<!-- No corner close: it would bypass the question the footer's cancel asks. -->
	<ResponsiveDialogContent
		class={className}
		showCloseButton={false}
		onEscapeKeydown={guard}
		onInteractOutside={guard}
	>
		<form
			bind:this={form}
			novalidate
			aria-busy={pending ? 'true' : undefined}
			class="contents"
			onsubmit={handleSubmit}
		>
			<ResponsiveDialogHeader>
				<ResponsiveDialogTitle>{title}</ResponsiveDialogTitle>
				{#if description}
					<ResponsiveDialogDescription>{description}</ResponsiveDialogDescription>
				{/if}
			</ResponsiveDialogHeader>

			<ResponsiveDialogBody class="flex flex-col gap-4">
				{#if failed}
					<!-- Beside the fields, not in a toast: it is read where the fixing happens, and
					     `role="alert"` says it out loud the moment it appears. -->
					<Alert.Root variant="destructive">
						<Alert.Description>{failedMessage}</Alert.Description>
					</Alert.Root>
				{/if}

				{@render children({ draft, pending })}
			</ResponsiveDialogBody>

			<ResponsiveDialogFooter>
				{#if footer}
					{@render footer({ draft, pending, dirty, submit, cancel })}
				{:else}
					<Button type="button" variant="outline" disabled={pending} onclick={cancel}>
						{cancelLabel}
					</Button>
					<ActionButton type="submit" {pending}>{submitLabel}</ActionButton>
				{/if}
			</ResponsiveDialogFooter>
		</form>
	</ResponsiveDialogContent>
</ResponsiveDialog>

<!-- Discarding is itself a destructive choice, and gets the dialog every destructive choice gets. -->
<ConfirmDialog
	bind:open={asking}
	title={discardTitle}
	description={discardDescription}
	confirmLabel={discardLabel}
	cancelLabel={keepLabel}
	variant="destructive"
	onconfirm={() => {
		draft.reset();
		leave();
	}}
/>
