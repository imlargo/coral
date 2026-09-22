<script lang="ts">
	import TagsInput from '$lib/components/coral/kit/tags-input/tags-input.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Field from '$lib/components/ui/field/index.js';

	let submitted = $state<string | null>(null);

	function submit(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
		event.preventDefault();
		submitted = JSON.stringify(new FormData(event.currentTarget).getAll('labels'));
	}
</script>

<form class="flex w-full max-w-md flex-col gap-4" onsubmit={submit}>
	<Field.Field>
		<Field.Label for="labels">Issue labels</Field.Label>
		<TagsInput id="labels" name="labels" required placeholder="Add a label..." />
		<Field.Description>Enter, comma, or paste a list.</Field.Description>
	</Field.Field>

	<Button type="submit" size="sm" class="self-start">Submit</Button>

	{#if submitted}
		<p class="font-mono text-xs text-muted-foreground">labels = {submitted}</p>
	{/if}
</form>
