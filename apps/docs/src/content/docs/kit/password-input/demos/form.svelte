<script lang="ts">
	import PasswordInput from '$lib/components/coral/kit/password-input/password-input.svelte';
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
		<Field.Label for="new-password">New password</Field.Label>
		<PasswordInput
			id="new-password"
			name="new-password"
			autocomplete="new-password"
			minlength={8}
			required
			bind:visible
		/>
	</Field.Field>
	<Button type="submit">Save</Button>
	<p class="text-sm text-muted-foreground">
		Visible: {visible ? 'yes' : 'no'}
		{#if submittedAs}· submitted as <code>type="{submittedAs}"</code>{/if}
	</p>
</form>
