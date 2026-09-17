<script lang="ts">
	import AvatarStack from '$lib/coral/kit/avatar-stack/avatar-stack.svelte';

	const team = [
		{ name: 'Ana Restrepo', src: 'https://github.com/shadcn.png' },
		{ name: 'Juan Herrera' },
		{ name: 'Camila Ospina' },
		{ name: 'Diego Marín' },
		{ name: 'Laura Gómez' },
		{ name: 'Andrés Torres' },
		{ name: 'Valentina Ruiz' }
	];
</script>

<div class="flex flex-col items-center gap-4">
	<AvatarStack
		items={team}
		max={4}
		label="Equipo asignado"
		overflowLabel={(count) => `${count} personas más`}
	/>
	<AvatarStack items={team.slice(0, 5)} max={5} size="sm" label="Cinco caben" />
	<AvatarStack items={team.slice(0, 6)} max={5} size="lg" label="Seis en cinco espacios" />
</div>
