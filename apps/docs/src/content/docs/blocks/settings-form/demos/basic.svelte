<script lang="ts">
	import SettingsForm from '#lib/components/coral/blocks/settings-form/settings-form.svelte';
	import NumberInput from '#lib/components/coral/kit/number-input/number-input.svelte';
	import { Draft } from '#lib/components/coral/lib/draft.svelte.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';

	type Project = { name: string; seats: number };

	// Stands in for the record a page loads and the API that writes it back.
	let project = $state<Project>({ name: 'api-gateway', seats: 5 });
	const draft = new Draft(() => project);

	async function save(value: Project) {
		await new Promise((resolve) => setTimeout(resolve, 800));
		project = value;
	}
</script>

<SettingsForm {draft} onsave={save} class="w-full max-w-sm">
	{#snippet children({ draft })}
		<div class="flex flex-col gap-2">
			<Label for="settings-name">Project name</Label>
			<Input id="settings-name" bind:value={draft.current.name} />
		</div>
		<div class="flex flex-col gap-2">
			<Label for="settings-seats">Seats</Label>
			<NumberInput id="settings-seats" bind:value={draft.current.seats} min={1} max={50} />
		</div>
	{/snippet}
</SettingsForm>
