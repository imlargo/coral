<script lang="ts">
	import FormDialog from '#lib/components/coral/blocks/form-dialog/form-dialog.svelte';
	import { createDraft } from '#lib/components/coral/lib/draft.svelte.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';

	type Environment = { id: string; name: string; branch: string };

	let environments = $state<Environment[]>([
		{ id: 'prod', name: 'production', branch: 'main' },
		{ id: 'stg', name: 'staging', branch: 'develop' }
	]);

	const blank: Environment = { id: '', name: '', branch: '' };
	// One dialog for both: `editing` points the draft at the record being edited, or at the blank one.
	let editing = $state<Environment | undefined>();
	let open = $state(false);
	const draft = createDraft(() => editing ?? blank);

	function start(environment?: Environment) {
		editing = environment;
		open = true;
	}

	async function save(value: Environment) {
		await new Promise((resolve) => setTimeout(resolve, 500));
		if (value.id) {
			environments = environments.map((entry) => (entry.id === value.id ? value : entry));
		} else {
			environments = [...environments, { ...value, id: crypto.randomUUID() }];
		}
	}
</script>

<div class="flex w-full max-w-sm flex-col gap-3">
	<ul class="flex flex-col gap-1">
		{#each environments as environment (environment.id)}
			<li class="flex items-center justify-between gap-2 text-sm">
				<span
					>{environment.name}
					<span class="text-muted-foreground">· {environment.branch}</span></span
				>
				<Button variant="ghost" size="sm" onclick={() => start(environment)}>Edit</Button>
			</li>
		{/each}
	</ul>
	<Button variant="outline" class="self-start" onclick={() => start()}>New environment</Button>

	<FormDialog
		{draft}
		bind:open
		title={editing ? `Edit ${editing.name}` : 'New environment'}
		onsubmit={save}
	>
		{#snippet children({ draft })}
			<div class="flex flex-col gap-2">
				<Label for="env-name">Name</Label>
				<Input id="env-name" bind:value={draft.current.name} />
			</div>
			<div class="flex flex-col gap-2">
				<Label for="env-branch">Branch</Label>
				<Input id="env-branch" bind:value={draft.current.branch} />
			</div>
		{/snippet}
	</FormDialog>
</div>
