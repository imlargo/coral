<script lang="ts">
	import PasswordInput from '$lib/coral/kit/password-input/password-input.svelte';
	import * as Field from '$lib/components/ui/field/index.js';

	let password = $state('');
	let capsLock = $state(false);
</script>

<Field.Field class="w-72">
	<Field.Label for="login-password">Contraseña</Field.Label>
	<PasswordInput
		id="login-password"
		bind:value={password}
		bind:capsLock
		toggleLabel="Mostrar contraseña"
		capsLockLabel="Bloq Mayús está activado"
	/>
	<Field.Description>
		{capsLock ? 'Bloq Mayús está activado.' : 'Prueba con Bloq Mayús activado.'}
	</Field.Description>
</Field.Field>
