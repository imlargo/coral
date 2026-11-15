<script lang="ts">
	import UserPlusIcon from '@lucide/svelte/icons/user-plus';
	import XIcon from '@lucide/svelte/icons/x';
	import ActionButton from '#lib/components/coral/kit/action-button/action-button.svelte';
	import Avatar from '#lib/components/coral/kit/avatar/avatar.svelte';
	import ConfirmDialog from '#lib/components/coral/kit/confirm-dialog/confirm-dialog.svelte';
	import ResponsiveDialog from '#lib/components/coral/kit/responsive-dialog/responsive-dialog.svelte';
	import ResponsiveDialogBody from '#lib/components/coral/kit/responsive-dialog/responsive-dialog-body.svelte';
	import ResponsiveDialogClose from '#lib/components/coral/kit/responsive-dialog/responsive-dialog-close.svelte';
	import ResponsiveDialogContent from '#lib/components/coral/kit/responsive-dialog/responsive-dialog-content.svelte';
	import ResponsiveDialogDescription from '#lib/components/coral/kit/responsive-dialog/responsive-dialog-description.svelte';
	import ResponsiveDialogFooter from '#lib/components/coral/kit/responsive-dialog/responsive-dialog-footer.svelte';
	import ResponsiveDialogHeader from '#lib/components/coral/kit/responsive-dialog/responsive-dialog-header.svelte';
	import ResponsiveDialogTitle from '#lib/components/coral/kit/responsive-dialog/responsive-dialog-title.svelte';
	import ResponsiveDialogTrigger from '#lib/components/coral/kit/responsive-dialog/responsive-dialog-trigger.svelte';
	import SearchInput from '#lib/components/coral/kit/search-input/search-input.svelte';
	import Select from '#lib/components/coral/kit/select/select.svelte';
	import TagsInput from '#lib/components/coral/kit/tags-input/tags-input.svelte';
	import { fold } from '#lib/components/coral/lib/fold.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button, buttonVariants } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Empty from '#lib/components/ui/empty/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import { ROLES, TEAM, wait, type Member, type Role } from '#lib/features/home/world.js';

	type Invite = { email: string; role: Role };

	// Ownership is transferred, never assigned from a row, so the role lists leave it out.
	const assignable = ROLES.filter((role) => role !== 'Owner').map((role) => ({
		value: role,
		label: role
	}));
	const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	let members = $state<Member[]>(TEAM.map((member) => ({ ...member })));
	let invites = $state<Invite[]>([]);
	// What the search reported: trimmed and debounced, so the list does not refilter per keystroke.
	let term = $state('');

	let visible = $derived.by(() => {
		const query = fold(term);
		if (!query) return members;
		return members.filter((member) => fold(`${member.name} ${member.email}`).includes(query));
	});

	let removing = $state<Member>();
	let confirmOpen = $state(false);

	async function remove() {
		if (!removing) return;
		const id = removing.id;
		await wait(700);
		members = members.filter((member) => member.id !== id);
	}

	let inviteOpen = $state(false);
	let emails = $state<string[]>([]);
	let inviteRole = $state<Role>('Developer');
	let rejectMessage = $state('');

	function taken(email: string) {
		return [...members, ...invites].some((entry) => entry.email === email);
	}

	async function sendInvites() {
		await wait(900);
		invites = [...invites, ...emails.map((email) => ({ email, role: inviteRole }))];
	}

	function resetInvite() {
		emails = [];
		inviteRole = 'Developer';
		rejectMessage = '';
	}
</script>

<Card.Root class="min-w-0">
	<Card.Header>
		<Card.Title>Members</Card.Title>
		<Card.Description>
			{members.length} members on web-app. A role change applies on their next request.
		</Card.Description>
		<Card.Action>
			<ResponsiveDialog
				bind:open={inviteOpen}
				onOpenChangeComplete={(open) => {
					if (!open) resetInvite();
				}}
			>
				<ResponsiveDialogTrigger class={buttonVariants({ size: 'sm' })}>
					<UserPlusIcon aria-hidden="true" />
					Invite
				</ResponsiveDialogTrigger>

				<ResponsiveDialogContent>
					<ResponsiveDialogHeader>
						<ResponsiveDialogTitle>Invite to web-app</ResponsiveDialogTitle>
						<ResponsiveDialogDescription>
							Each address gets an email with a link that expires in seven days.
						</ResponsiveDialogDescription>
					</ResponsiveDialogHeader>

					<ResponsiveDialogBody>
						<Field.Group>
							<Field.Field>
								<Field.Label for="invite-emails">Email addresses</Field.Label>
								<TagsInput
									id="invite-emails"
									bind:value={emails}
									placeholder="name@example.com"
									sanitize={(raw) => raw.trim().toLowerCase()}
									validate={(email) => EMAIL.test(email) && !taken(email)}
									onreject={(rejected) =>
										(rejectMessage = `Skipped ${rejected.map((r) => r.value).join(', ')}: not an address, or already on the team.`)}
									onchange={() => (rejectMessage = '')}
									addOnBlur
									removeLabel={(email) => `Remove ${email}`}
								/>
								<Field.Description role="status">
									{rejectMessage || 'Paste a list separated by commas.'}
								</Field.Description>
							</Field.Field>

							<Field.Field>
								<Field.Label for="invite-role">Role</Field.Label>
								<Select id="invite-role" options={assignable} bind:value={inviteRole} />
							</Field.Field>
						</Field.Group>
					</ResponsiveDialogBody>

					<ResponsiveDialogFooter>
						<ResponsiveDialogClose class={buttonVariants({ variant: 'outline' })}>
							Cancel
						</ResponsiveDialogClose>
						<ActionButton
							disabled={emails.length === 0}
							onclick={sendInvites}
							onsuccess={() => (inviteOpen = false)}
							pendingLabel="Sending invitations"
						>
							{#snippet children({ pending })}
								{#if pending}
									Sending...
								{:else}
									Send {emails.length === 1 ? 'invitation' : 'invitations'}
								{/if}
							{/snippet}
						</ActionButton>
					</ResponsiveDialogFooter>
				</ResponsiveDialogContent>
			</ResponsiveDialog>
		</Card.Action>
	</Card.Header>

	<Card.Content class="flex flex-col gap-4">
		<SearchInput
			onsearch={(next) => (term = next)}
			placeholder="Search by name or email"
			aria-label="Search members"
		/>

		{#if visible.length === 0}
			<Empty.Root class="border">
				<Empty.Header>
					<Empty.Title>No one matches "{term}"</Empty.Title>
					<Empty.Description>Search by first name, last name or email address.</Empty.Description>
				</Empty.Header>
			</Empty.Root>
		{:else}
			<ul class="flex flex-col divide-y" aria-label="Members">
				{#each visible as member (member.id)}
					<li class="flex flex-wrap items-center gap-3 py-3">
						<Avatar name={member.name} />
						<div class="flex min-w-0 flex-1 flex-col">
							<span class="truncate text-sm font-medium">{member.name}</span>
							<span class="truncate text-xs text-muted-foreground">{member.email}</span>
						</div>
						<div class="flex items-center gap-2">
							{#if member.role === 'Owner'}
								<Badge variant="secondary">Owner</Badge>
							{:else}
								<Select
									options={assignable}
									bind:value={member.role}
									size="sm"
									aria-label="Role for {member.name}"
								/>
								<Button
									variant="ghost"
									size="icon-sm"
									aria-label="Remove {member.name}"
									onclick={() => {
										removing = member;
										confirmOpen = true;
									}}
								>
									<XIcon aria-hidden="true" />
								</Button>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
		{/if}

		{#if invites.length > 0}
			<div class="flex flex-col gap-2">
				<h3 class="text-sm font-medium">Pending invitations</h3>
				<ul class="flex flex-col divide-y">
					{#each invites as invite (invite.email)}
						<li class="flex flex-wrap items-center justify-between gap-2 py-2">
							<span class="min-w-0 truncate text-sm">{invite.email}</span>
							<Badge variant="outline">{invite.role}</Badge>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</Card.Content>
</Card.Root>

<ConfirmDialog
	bind:open={confirmOpen}
	title="Remove {removing?.name ?? 'this member'}?"
	description="They lose access to web-app straight away. Deployments they made stay up."
	confirmLabel="Remove"
	cancelLabel="Cancel"
	variant="destructive"
	onconfirm={remove}
/>
