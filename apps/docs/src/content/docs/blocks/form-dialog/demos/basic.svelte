<script lang="ts">
	import FormDialog from '#lib/components/coral/blocks/form-dialog/form-dialog.svelte';
	import Select from '#lib/components/coral/kit/select/select.svelte';
	import { createDraft } from '#lib/components/coral/lib/draft.svelte.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';

	type Invite = { email: string; role?: string };

	const roles = [
		{ value: 'viewer', label: 'Viewer' },
		{ value: 'developer', label: 'Developer' },
		{ value: 'admin', label: 'Admin' }
	];

	const empty: Invite = { email: '', role: 'viewer' };
	const draft = createDraft(() => empty);
	let invited = $state<string[]>([]);
	let invalid = $state(false);

	async function invite(value: Invite) {
		await new Promise((resolve) => setTimeout(resolve, 700));
		// The server's answer: a refusal keeps the dialog open with the message beside the fields.
		invalid = !value.email.includes('@');
		if (invalid) return false;
		invited = [...invited, value.email];
	}
</script>

<div class="flex flex-col items-center gap-3">
	<FormDialog
		{draft}
		title="Invite a teammate"
		description="They get an email with a link to join."
		submitLabel="Send invitation"
		failedMessage="That does not look like an email address."
		onsubmit={invite}
	>
		{#snippet trigger({ props })}
			<Button {...props} variant="outline">Invite a teammate</Button>
		{/snippet}
		{#snippet children({ draft })}
			<div class="flex flex-col gap-2">
				<Label for="invite-email">Email</Label>
				<Input
					id="invite-email"
					type="email"
					bind:value={draft.current.email}
					aria-invalid={invalid ? 'true' : undefined}
					oninput={() => (invalid = false)}
					placeholder="name@company.com"
				/>
			</div>
			<div class="flex flex-col gap-2">
				<Label for="invite-role">Role</Label>
				<Select id="invite-role" options={roles} bind:value={draft.current.role} />
			</div>
		{/snippet}
	</FormDialog>

	<p class="text-sm text-muted-foreground">
		{invited.length
			? `Invited: ${invited.join(', ')}`
			: 'Nobody invited yet. Try an email without an @.'}
	</p>
</div>
