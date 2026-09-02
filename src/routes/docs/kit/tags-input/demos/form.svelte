<script lang="ts">
	import TagsInput from '$lib/coral/kit/tags-input/tags-input.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Field from '$lib/components/ui/field/index.js';

	let submitted = $state<string | null>(null);

	function submit(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
		event.preventDefault();
		submitted = JSON.stringify(new FormData(event.currentTarget).getAll('skills'));
	}
</script>

<form class="flex w-full max-w-md flex-col gap-4" onsubmit={submit}>
	<Field.Field>
		<Field.Label for="skills">Habilidades</Field.Label>
		<TagsInput id="skills" name="skills" required placeholder="Add a skill..." />
		<Field.Description>Enter, coma o pegado desde una hoja de cálculo.</Field.Description>
	</Field.Field>

	<Button type="submit" size="sm" class="self-start">Enviar</Button>

	{#if submitted}
		<p class="font-mono text-xs text-muted-foreground">skills = {submitted}</p>
	{/if}
</form>
