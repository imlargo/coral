<script lang="ts">
	import Avatar from '$lib/coral/kit/avatar/avatar.svelte';
	import { AvatarGroup, AvatarGroupCount } from '$lib/components/ui/avatar/index.js';

	const team = ['Ana Restrepo', 'Juan Herrera', 'Camila Ospina', 'Diego Marín'];
</script>

<AvatarGroup>
	{#each team as name (name)}
		<Avatar {name} />
	{/each}
	<AvatarGroupCount>+3</AvatarGroupCount>
</AvatarGroup>
