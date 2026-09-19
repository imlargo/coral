<script lang="ts">
	import AvatarStack from '$lib/coral/kit/avatar-stack/avatar-stack.svelte';

	const team = [
		{ name: 'Amara Diallo', src: 'https://github.com/shadcn.png' },
		{ name: 'Wei Zhang' },
		{ name: 'Sofia Rossi' },
		{ name: "Liam O'Connor" },
		{ name: 'Priya Sharma' },
		{ name: 'Kenji Tanaka' },
		{ name: 'Lucas Andersen' }
	];
</script>

<div class="flex flex-col items-center gap-4">
	<AvatarStack
		items={team}
		max={4}
		label="Assigned team"
		overflowLabel={(count) => `${count} more people`}
	/>
	<AvatarStack items={team.slice(0, 5)} max={5} size="sm" label="Five fit" />
	<AvatarStack items={team.slice(0, 6)} max={5} size="lg" label="Six in five slots" />
</div>
