<script lang="ts">
	/**
	 * @coral/blocks/settings-form
	 * @version 1.0.0
	 */
	import SettingsForm from './settings-form.svelte';
	import { createDraft } from '../../lib/draft.svelte.js';

	type Settings = { name: string; seats: number };

	let {
		saved = $bindable({ name: 'api-gateway', seats: 3 }),
		onsave,
		onerror,
		shortcut
	}: {
		saved?: Settings;
		onsave: (value: Settings) => unknown;
		onerror?: (error: unknown) => void;
		shortcut?: string;
	} = $props();

	const draft = createDraft(() => saved);
</script>

<SettingsForm {draft} {onsave} {onerror} {shortcut} statusTimeout={100}>
	{#snippet children({ draft })}
		<label>
			Name
			<input bind:value={draft.current.name} />
		</label>
		<label>
			Seats
			<input type="number" bind:value={draft.current.seats} />
		</label>
	{/snippet}
</SettingsForm>
