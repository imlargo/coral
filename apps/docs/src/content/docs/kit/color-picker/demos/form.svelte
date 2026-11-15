<script lang="ts">
	import ColorPicker from '#lib/components/coral/kit/color-picker/color-picker.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Field from '#lib/components/ui/field/index.js';

	let submitted = $state<string | null>(null);

	function submit(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
		event.preventDefault();
		submitted = JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)));
	}
</script>

<form class="flex w-full max-w-xs flex-col gap-4" onsubmit={submit}>
	<Field.Field>
		<Field.Label for="environment-colour">Environment colour</Field.Label>
		<ColorPicker id="environment-colour" name="colour" required />
	</Field.Field>

	<Button type="submit" class="self-start">Save environment</Button>

	{#if submitted}
		<p class="font-mono text-xs text-muted-foreground">{submitted}</p>
	{/if}
</form>
