<script lang="ts">
	import PasswordInput from '$lib/coral/kit/password-input/password-input.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Field from '$lib/components/ui/field/index.js';

	let visible = $state(false);
	let submittedAs = $state('');

	function handleSubmit(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
		event.preventDefault();
		const field = event.currentTarget.elements.namedItem('new-password') as HTMLInputElement;
		submittedAs = field.type;
	}
</script>

<form class="flex w-72 flex-col gap-3" onsubmit={handleSubmit}>
	<Field.Field>
		<Field.Label for="new-password">Nueva contraseña</Field.Label>
		<PasswordInput
			id="new-password"
			name="new-password"
			autocomplete="new-password"
			minlength={8}
			required
			bind:visible
		/>
	</Field.Field>
	<Button type="submit">Guardar</Button>
	<p class="text-sm text-muted-foreground">
		Visible: {visible ? 'sí' : 'no'}
		{#if submittedAs}· enviado como <code>type="{submittedAs}"</code>{/if}
	</p>
</form>
