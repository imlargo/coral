<script lang="ts">
	import Combobox from '$lib/components/coral/kit/combobox/combobox.svelte';

	// `value` is whatever the project already has - here a numeric id, not a string.
	const projects = [
		{ value: 1, label: 'web-dashboard' },
		{ value: 2, label: 'billing-api' },
		{ value: 3, label: 'legacy-gateway', disabled: true },
		{ value: 4, label: 'docs-site' }
	];

	let projectId = $state<number>();
</script>

<div class="flex w-64 flex-col gap-3">
	<Combobox
		options={projects}
		bind:value={projectId}
		placeholder="Select a project..."
		searchPlaceholder="Search projects..."
		emptyMessage="No project found."
	/>
	<p class="text-sm text-muted-foreground">
		Selected id: {projectId ?? 'none'} ({typeof projectId})
	</p>
</div>
