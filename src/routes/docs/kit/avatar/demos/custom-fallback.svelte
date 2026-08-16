<script lang="ts">
	import UserIcon from '@lucide/svelte/icons/user';
	import Avatar from '$lib/coral/kit/avatar/avatar.svelte';
</script>

<Avatar>
	{#snippet fallback()}
		<UserIcon class="size-4" />
	{/snippet}
</Avatar>

<Avatar size="lg">
	{#snippet fallback()}
		<UserIcon class="size-5" />
	{/snippet}
</Avatar>
