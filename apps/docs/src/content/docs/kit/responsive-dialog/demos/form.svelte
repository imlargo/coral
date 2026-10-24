<script lang="ts">
	import ResponsiveDialog from '#lib/components/coral/kit/responsive-dialog/responsive-dialog.svelte';
	import ResponsiveDialogBody from '#lib/components/coral/kit/responsive-dialog/responsive-dialog-body.svelte';
	import ResponsiveDialogClose from '#lib/components/coral/kit/responsive-dialog/responsive-dialog-close.svelte';
	import ResponsiveDialogContent from '#lib/components/coral/kit/responsive-dialog/responsive-dialog-content.svelte';
	import ResponsiveDialogDescription from '#lib/components/coral/kit/responsive-dialog/responsive-dialog-description.svelte';
	import ResponsiveDialogFooter from '#lib/components/coral/kit/responsive-dialog/responsive-dialog-footer.svelte';
	import ResponsiveDialogHeader from '#lib/components/coral/kit/responsive-dialog/responsive-dialog-header.svelte';
	import ResponsiveDialogTitle from '#lib/components/coral/kit/responsive-dialog/responsive-dialog-title.svelte';
	import ResponsiveDialogTrigger from '#lib/components/coral/kit/responsive-dialog/responsive-dialog-trigger.svelte';
	import * as Field from '#lib/components/ui/field/index.js';
	import { Button, buttonVariants } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';

	let open = $state(false);
	let name = $state('');
	let key = $state('');
	let description = $state('');
	let submitted = $state(false);

	const keyError = $derived(
		/^[A-Z]{2,5}$/.test(key) ? '' : 'Use 2 to 5 capital letters, such as API.'
	);

	function submit(event: SubmitEvent) {
		event.preventDefault();
		submitted = true;
		if (!name || keyError) return;
		open = false;
		submitted = false;
	}
</script>

<ResponsiveDialog bind:open>
	<ResponsiveDialogTrigger class={buttonVariants({ variant: 'outline' })}>
		New project
	</ResponsiveDialogTrigger>

	<ResponsiveDialogContent>
		<ResponsiveDialogHeader>
			<ResponsiveDialogTitle>New project</ResponsiveDialogTitle>
			<ResponsiveDialogDescription>
				On a narrow screen this is a drawer, and the fields scroll between the header and footer.
			</ResponsiveDialogDescription>
		</ResponsiveDialogHeader>

		<ResponsiveDialogBody>
			<form id="new-project" onsubmit={submit} novalidate>
				<Field.Group>
					<Field.Field data-invalid={submitted && !name}>
						<Field.Label for="project-name">Name</Field.Label>
						<Input id="project-name" bind:value={name} aria-invalid={submitted && !name} />
						{#if submitted && !name}
							<Field.Error>Give the project a name.</Field.Error>
						{/if}
					</Field.Field>

					<Field.Field data-invalid={submitted && !!keyError}>
						<Field.Label for="project-key">Issue key</Field.Label>
						<Input
							id="project-key"
							bind:value={key}
							placeholder="API"
							aria-invalid={submitted && !!keyError}
						/>
						{#if submitted && keyError}
							<Field.Error>{keyError}</Field.Error>
						{:else}
							<Field.Description>Prefixes every issue: API-142.</Field.Description>
						{/if}
					</Field.Field>

					<Field.Field>
						<Field.Label for="project-description">Description</Field.Label>
						<Textarea id="project-description" bind:value={description} rows={4} />
					</Field.Field>
				</Field.Group>
			</form>
		</ResponsiveDialogBody>

		<ResponsiveDialogFooter>
			<ResponsiveDialogClose class={buttonVariants({ variant: 'outline' })}>
				Cancel
			</ResponsiveDialogClose>
			<Button type="submit" form="new-project">Create project</Button>
		</ResponsiveDialogFooter>
	</ResponsiveDialogContent>
</ResponsiveDialog>
