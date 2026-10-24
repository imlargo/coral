<script lang="ts">
	import SettingsForm from '#lib/components/coral/blocks/settings-form/settings-form.svelte';
	import { Draft } from '#lib/components/coral/lib/draft.svelte.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';

	type Webhook = { url: string };

	let webhook = $state<Webhook>({ url: 'https://example.com/hooks/deploys' });
	const draft = new Draft(() => webhook);
	let attempts = 0;

	// Fails the first time, lands the second: the shape of a real request.
	async function save(value: Webhook) {
		await new Promise((resolve) => setTimeout(resolve, 800));
		attempts += 1;
		if (attempts % 2 === 1) return false;
		webhook = value;
	}
</script>

<SettingsForm {draft} onsave={save} class="w-full max-w-sm">
	{#snippet children({ draft })}
		<div class="flex flex-col gap-2">
			<Label for="webhook-url">Webhook URL</Label>
			<Input id="webhook-url" type="url" bind:value={draft.current.url} />
			<p class="text-sm text-muted-foreground">The first save fails, the second lands.</p>
		</div>
	{/snippet}
</SettingsForm>
