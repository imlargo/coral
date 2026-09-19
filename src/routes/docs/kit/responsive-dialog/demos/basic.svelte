<script lang="ts">
	import ResponsiveDialog from '$lib/coral/kit/responsive-dialog/responsive-dialog.svelte';
	import ResponsiveDialogClose from '$lib/coral/kit/responsive-dialog/responsive-dialog-close.svelte';
	import ResponsiveDialogContent from '$lib/coral/kit/responsive-dialog/responsive-dialog-content.svelte';
	import ResponsiveDialogDescription from '$lib/coral/kit/responsive-dialog/responsive-dialog-description.svelte';
	import ResponsiveDialogFooter from '$lib/coral/kit/responsive-dialog/responsive-dialog-footer.svelte';
	import ResponsiveDialogHeader from '$lib/coral/kit/responsive-dialog/responsive-dialog-header.svelte';
	import ResponsiveDialogTitle from '$lib/coral/kit/responsive-dialog/responsive-dialog-title.svelte';
	import ResponsiveDialogTrigger from '$lib/coral/kit/responsive-dialog/responsive-dialog-trigger.svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	let open = $state(false);
	let email = $state('');
</script>

<ResponsiveDialog bind:open>
	<ResponsiveDialogTrigger class={buttonVariants({ variant: 'outline' })}>
		Invite someone
	</ResponsiveDialogTrigger>

	<ResponsiveDialogContent>
		<ResponsiveDialogHeader>
			<ResponsiveDialogTitle>Invite to project</ResponsiveDialogTitle>
			<ResponsiveDialogDescription>
				Resize the window while this is open: the dialog becomes a drawer, and what you typed stays.
			</ResponsiveDialogDescription>
		</ResponsiveDialogHeader>

		<div class="flex flex-col gap-2 px-4 md:px-0">
			<Label for="invite-email">Email</Label>
			<Input id="invite-email" type="email" bind:value={email} placeholder="name@company.com" />
		</div>

		<ResponsiveDialogFooter>
			<ResponsiveDialogClose class={buttonVariants({ variant: 'outline' })}>
				Cancel
			</ResponsiveDialogClose>
			<Button onclick={() => (open = false)} disabled={!email}>Send invitation</Button>
		</ResponsiveDialogFooter>
	</ResponsiveDialogContent>
</ResponsiveDialog>
