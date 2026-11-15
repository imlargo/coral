<script lang="ts">
	import ActionButton from '#lib/components/coral/kit/action-button/action-button.svelte';
	import Select from '#lib/components/coral/kit/select/select.svelte';
	import TagsInput from '#lib/components/coral/kit/tags-input/tags-input.svelte';
	import type { TagRejection } from '#lib/components/coral/kit/tags-input/tags.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import { ROLES, TEAM, wait, type Role } from '#lib/features/home/world.js';
	import type { Option } from '#lib/components/coral/lib/options.js';
	import ShowcaseCard from './ShowcaseCard.svelte';

	const MAX_INVITES = 5;
	const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
	const members = new Set(TEAM.map((member) => member.email));

	// An invite never makes someone an owner; ownership is transferred, not handed out.
	const roles: Option<Role>[] = ROLES.filter((role) => role !== 'Owner').map((role) => ({
		value: role,
		label: role
	}));

	let emails = $state<string[]>([]);
	let role = $state<Role | undefined>('Developer');
	let rejection = $state('');
	let error = $state('');
	let sent = $state('');
	let attempts = 0;

	function explain([first]: TagRejection[]): string {
		if (first.reason === 'duplicate') return `${first.value} is already on the list.`;
		if (first.reason === 'max') return `Up to ${MAX_INVITES} invites at a time.`;
		if (members.has(first.value)) return `${first.value} is already on the team.`;
		return `${first.value} is not an email address.`;
	}

	async function send() {
		error = '';
		sent = '';
		attempts++;
		await wait(900);
		if (attempts === 1) throw new Error('The mail service timed out. No invites went out.');
		const count = emails.length;
		sent = `${count} ${count === 1 ? 'invite' : 'invites'} sent as ${role ?? 'Developer'}.`;
		emails = [];
	}
</script>

<ShowcaseCard
	title="Invite teammates"
	description="Add people to web-app by email and pick the role they join with."
	hint="Add a typo or wei@example.com, who is already on the team, then send twice: the first send fails."
	components={['kit/tags-input', 'kit/select', 'kit/action-button']}
>
	<div class="grid gap-2">
		<Label for="home-invite-emails">Email addresses</Label>
		<TagsInput
			id="home-invite-emails"
			bind:value={emails}
			delimiter={/[,;\s]/}
			max={MAX_INVITES}
			addOnBlur
			sanitize={(raw) => raw.trim().toLowerCase()}
			validate={(value) => EMAIL.test(value) && !members.has(value)}
			onchange={() => (rejection = '')}
			onreject={(rejected) => (rejection = explain(rejected))}
			placeholder="name@example.com"
			removeLabel={(value) => `Remove ${value}`}
		/>
		<p class="text-xs text-muted-foreground" aria-live="polite">
			{rejection || 'Separate addresses with a comma or a space.'}
		</p>
	</div>

	<div class="grid gap-2">
		<Label for="home-invite-role">Role</Label>
		<Select id="home-invite-role" options={roles} bind:value={role} />
	</div>

	<div class="flex flex-wrap items-center gap-3">
		<ActionButton
			onclick={send}
			onerror={(reason) => (error = (reason as Error).message)}
			disabled={emails.length === 0}
			pendingLabel="Sending invites"
		>
			{#snippet children({ pending })}
				{pending ? 'Sending...' : 'Send invites'}
			{/snippet}
		</ActionButton>
		<p
			class={error ? 'min-w-0 text-sm text-destructive' : 'min-w-0 text-sm text-muted-foreground'}
			role="status"
		>
			{error || sent}
		</p>
	</div>
</ShowcaseCard>
