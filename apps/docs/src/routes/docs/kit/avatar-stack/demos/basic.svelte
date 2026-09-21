<script lang="ts">
	import AvatarStack from '$lib/components/coral/kit/avatar-stack/avatar-stack.svelte';

	const reviewers = [
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
		items={reviewers}
		max={4}
		label="Reviewers"
		overflowLabel={(count) => `${count} more reviewers`}
	/>
	<AvatarStack items={reviewers.slice(0, 5)} max={5} size="sm" label="Five fit" />
	<AvatarStack items={reviewers.slice(0, 6)} max={5} size="lg" label="Six in five slots" />
</div>
