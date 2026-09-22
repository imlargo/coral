<script lang="ts">
	import PasswordInput from '$lib/components/coral/kit/password-input/password-input.svelte';
	import * as Field from '$lib/components/ui/field/index.js';

	let password = $state('');
	let capsLock = $state(false);
</script>

<Field.Field class="w-72">
	<Field.Label for="login-password">Password</Field.Label>
	<PasswordInput
		id="login-password"
		bind:value={password}
		bind:capsLock
		toggleLabel="Show password"
		capsLockLabel="Caps Lock is on"
	/>
	<Field.Description>
		{capsLock ? 'Caps Lock is on.' : 'Try it with Caps Lock on.'}
	</Field.Description>
</Field.Field>
