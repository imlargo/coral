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
	import { Button, buttonVariants } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';

	const fields = [
		{ id: 'name', label: 'Project name', placeholder: 'api-gateway' },
		{ id: 'slug', label: 'Slug', placeholder: 'api-gateway' },
		{ id: 'region', label: 'Region', placeholder: 'Frankfurt' },
		{ id: 'branch', label: 'Production branch', placeholder: 'main' },
		{ id: 'root', label: 'Root directory', placeholder: 'apps/api' },
		{ id: 'build', label: 'Build command', placeholder: 'pnpm build' },
		{ id: 'output', label: 'Output directory', placeholder: 'dist' },
		{ id: 'install', label: 'Install command', placeholder: 'pnpm install' },
		{ id: 'node', label: 'Node version', placeholder: '22' },
		{ id: 'domain', label: 'Custom domain', placeholder: 'api.example.com' }
	];

	let open = $state(false);
</script>

<ResponsiveDialog bind:open>
	<ResponsiveDialogTrigger class={buttonVariants({ variant: 'outline' })}>
		New project
	</ResponsiveDialogTrigger>

	<ResponsiveDialogContent>
		<ResponsiveDialogHeader>
			<ResponsiveDialogTitle>New project</ResponsiveDialogTitle>
			<ResponsiveDialogDescription>
				Taller than most screens: the fields scroll, the title and the buttons stay.
			</ResponsiveDialogDescription>
		</ResponsiveDialogHeader>

		<ResponsiveDialogBody class="flex flex-col gap-4">
			{#each fields as field (field.id)}
				<div class="flex flex-col gap-2">
					<Label for="new-{field.id}">{field.label}</Label>
					<Input id="new-{field.id}" placeholder={field.placeholder} />
				</div>
			{/each}
		</ResponsiveDialogBody>

		<ResponsiveDialogFooter>
			<ResponsiveDialogClose class={buttonVariants({ variant: 'outline' })}>
				Cancel
			</ResponsiveDialogClose>
			<Button onclick={() => (open = false)}>Create project</Button>
		</ResponsiveDialogFooter>
	</ResponsiveDialogContent>
</ResponsiveDialog>
