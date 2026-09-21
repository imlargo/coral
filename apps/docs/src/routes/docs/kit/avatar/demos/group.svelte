<script lang="ts">
	import Avatar from '$lib/components/coral/kit/avatar/avatar.svelte';
	import { AvatarGroup, AvatarGroupCount } from '$lib/components/ui/avatar/index.js';

	const team = ['Amara Diallo', 'Wei Zhang', 'Sofia Rossi', "Liam O'Connor"];
</script>

<AvatarGroup>
	{#each team as name (name)}
		<Avatar {name} />
	{/each}
	<AvatarGroupCount>+3</AvatarGroupCount>
</AvatarGroup>
