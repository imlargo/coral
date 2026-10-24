<script lang="ts">
	/**
	 * @coral/kit/responsive-dialog
	 * @version 1.0.0
	 */
	import ResponsiveDialog from './responsive-dialog.svelte';
	import ResponsiveDialogBody from './responsive-dialog-body.svelte';
	import ResponsiveDialogClose from './responsive-dialog-close.svelte';
	import ResponsiveDialogContent from './responsive-dialog-content.svelte';
	import ResponsiveDialogDescription from './responsive-dialog-description.svelte';
	import ResponsiveDialogFooter from './responsive-dialog-footer.svelte';
	import ResponsiveDialogHeader from './responsive-dialog-header.svelte';
	import ResponsiveDialogTitle from './responsive-dialog-title.svelte';
	import ResponsiveDialogTrigger from './responsive-dialog-trigger.svelte';

	let {
		open = $bindable(false),
		draft = $bindable(''),
		...restProps
	}: { open?: boolean; draft?: string; [key: string]: unknown } = $props();
</script>

<ResponsiveDialog bind:open {...restProps}>
	<ResponsiveDialogTrigger>Invite</ResponsiveDialogTrigger>
	<ResponsiveDialogContent>
		<ResponsiveDialogHeader>
			<ResponsiveDialogTitle>Invite a teammate</ResponsiveDialogTitle>
			<ResponsiveDialogDescription>They will get an email.</ResponsiveDialogDescription>
		</ResponsiveDialogHeader>
		<ResponsiveDialogBody>
			<input aria-label="Email" bind:value={draft} />
		</ResponsiveDialogBody>
		<ResponsiveDialogFooter>
			<ResponsiveDialogClose>Cancel</ResponsiveDialogClose>
		</ResponsiveDialogFooter>
	</ResponsiveDialogContent>
</ResponsiveDialog>
