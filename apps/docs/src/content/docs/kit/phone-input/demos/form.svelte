<script lang="ts">
	import PhoneInput from '#lib/components/coral/kit/phone-input/phone-input.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Field from '#lib/components/ui/field/index.js';

	let submitted = $state('');

	function handleSubmit(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
		event.preventDefault();
		submitted = String(new FormData(event.currentTarget).get('phone'));
	}
</script>

<form class="flex w-80 flex-col gap-3" onsubmit={handleSubmit}>
	<Field.Field>
		<Field.Label for="two-factor-phone">Two-factor phone</Field.Label>
		<PhoneInput id="two-factor-phone" name="phone" country="GB" required />
		<Field.Description>Submit an incomplete number to see the form hold it.</Field.Description>
	</Field.Field>
	<Button type="submit">Send code</Button>
	{#if submitted}
		<p class="text-sm text-muted-foreground">Submitted <code>phone={submitted}</code></p>
	{/if}
</form>
