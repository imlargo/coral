<script lang="ts">
	/**
	 * @coral/blocks/form-dialog
	 * @version 1.0.0
	 */
	import FormDialog from './form-dialog.svelte';
	import { Draft } from '../../lib/draft.svelte.js';

	type Member = { email: string; role: string };

	let {
		record = $bindable({ email: '', role: 'viewer' }),
		open = $bindable(false),
		onsubmit,
		onerror,
		oncancel,
		query = '(min-width: 1px)'
	}: {
		record?: Member;
		open?: boolean;
		onsubmit: (value: Member) => unknown;
		onerror?: (error: unknown) => void;
		oncancel?: () => void;
		query?: string;
	} = $props();

	const draft = new Draft(() => record);
</script>

<FormDialog
	{draft}
	bind:open
	{query}
	title="Invite a teammate"
	description="They will get an email."
	{onsubmit}
	{onerror}
	{oncancel}
>
	{#snippet trigger({ props })}
		<button {...props} type="button">Invite</button>
	{/snippet}
	{#snippet children({ draft })}
		<label>
			Email
			<input
				type="email"
				bind:value={draft.current.email}
				aria-invalid={draft.current.email.includes('@') ? undefined : 'true'}
			/>
		</label>
		<label>
			Role
			<input bind:value={draft.current.role} />
		</label>
	{/snippet}
</FormDialog>
