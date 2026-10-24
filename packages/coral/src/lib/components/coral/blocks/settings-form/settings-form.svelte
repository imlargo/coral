<script lang="ts" generics="T">
	/**
	 * @coral/blocks/settings-form
	 * @version 1.0.0
	 */
	import { Button } from '#lib/components/ui/button/index.js';
	import { cn } from '#lib/utils.js';
	import ActionButton from '../../kit/action-button/action-button.svelte';
	import { listen } from '../../kit/shortcut/listen.js';
	import LiveRegion from '../../lib/live-region.svelte';
	import { Action } from '../../lib/action.svelte.js';
	import { Announcer } from '../../lib/announce.svelte.js';
	import { getCoralDefaults } from '../../lib/defaults.js';
	import type { BarContext, SaveStatus, SettingsFormProps } from './types.js';

	const defaults = getCoralDefaults('blocks/settings-form');

	let {
		draft,
		onsave,
		onerror,
		shortcut = defaults.shortcut ?? 'mod+s',
		saveLabel = defaults.saveLabel ?? 'Save changes',
		discardLabel = defaults.discardLabel ?? 'Discard',
		unsavedMessage = defaults.unsavedMessage ?? 'You have unsaved changes.',
		savingMessage = defaults.savingMessage ?? 'Saving...',
		savedMessage = defaults.savedMessage ?? 'Saved.',
		failedMessage = defaults.failedMessage ?? 'Could not save.',
		statusTimeout = defaults.statusTimeout ?? 3000,
		ref = $bindable(null),
		class: className,
		barClass,
		children,
		bar,
		...restProps
	}: SettingsFormProps<T> = $props();

	const action = new Action();
	const announcer = new Announcer();

	let status = $state<SaveStatus>('idle');
	let timer: ReturnType<typeof setTimeout> | undefined;
	$effect(() => () => clearTimeout(timer));

	const dirty = $derived(draft.dirty);
	const pending = $derived(action.running);

	/**
	 * The one line under the fields. An outcome stays until the reader edits again, so "Could not
	 * save" is not replaced by "You have unsaved changes" the moment it appears - the changes were
	 * unsaved before the attempt too, and the reader needs to know why they still are.
	 */
	const message = $derived(
		status === 'saved'
			? savedMessage
			: status === 'failed'
				? failedMessage
				: dirty
					? unsavedMessage
					: ''
	);

	function settle(next: SaveStatus) {
		status = next;
		announcer.say(next === 'saved' ? savedMessage : failedMessage);
		clearTimeout(timer);
		// A failure stays on screen; a success steps aside once it has been read.
		if (next === 'saved') timer = setTimeout(() => (status = 'idle'), statusTimeout);
	}

	/**
	 * Saves what the draft holds now, as plain data. One save at a time: Enter in a field, the
	 * shortcut and the button all land here, and the guard is the action's.
	 */
	async function save() {
		if (pending || !dirty) return;
		status = 'idle';

		try {
			settle(
				(await action.run(() => onsave($state.snapshot(draft.current) as T))) ? 'saved' : 'failed'
			);
		} catch (error) {
			settle('failed');
			if (!onerror) throw error;
			onerror(error);
		}
	}

	function discard() {
		if (pending) return;
		draft.reset();
		status = 'idle';
	}

	// Bound only while there is something to save, so the combo stays the browser's otherwise.
	$effect(() => {
		if (!shortcut || !dirty || pending) return;
		return listen(shortcut, save);
	});

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		save();
	}

	const context = $derived<BarContext<T>>({
		draft,
		pending,
		dirty,
		status,
		message,
		save,
		discard
	});
</script>

<form
	bind:this={ref}
	novalidate
	aria-busy={pending ? 'true' : undefined}
	class={cn('flex flex-col gap-6', className)}
	onsubmit={handleSubmit}
	{...restProps}
>
	{@render children({ draft, pending })}

	{#if bar}
		{@render bar(context)}
	{:else if message || pending}
		<!--
			Shown only while there is something to say: a save button that is always there, always
			enabled, is how nobody can tell whether anything changed. Discard goes before save, so the
			destructive choice is not the one under the hand that just finished typing.
		-->
		<div
			data-status={status}
			class={cn('flex flex-wrap items-center justify-between gap-3', barClass)}
		>
			<p class="text-muted-foreground" data-dirty={dirty || undefined}>{message}</p>
			<div class="flex items-center gap-2">
				<Button type="button" variant="ghost" disabled={!dirty || pending} onclick={discard}>
					{discardLabel}
				</Button>
				<ActionButton
					type="submit"
					{pending}
					pendingLabel={savingMessage}
					disabled={!dirty}
					onclick={(event) => {
						// Through `save`, not the form's own submit: the shortcut and Enter take the same door.
						event.preventDefault();
						save();
					}}
				>
					{saveLabel}
				</ActionButton>
			</div>
		</div>
	{/if}
</form>

<LiveRegion message={announcer.message} />
