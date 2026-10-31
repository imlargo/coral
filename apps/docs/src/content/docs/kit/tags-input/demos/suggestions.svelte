<script lang="ts">
	import TagsInput from '#lib/components/coral/kit/tags-input/tags-input.svelte';

	const labels = [
		'frontend',
		'backend',
		'infra',
		'billing',
		'docs',
		'good first issue',
		'regression'
	];

	let tags = $state(['backend']);
</script>

<div class="flex w-full max-w-md flex-col gap-3">
	<TagsInput
		bind:value={tags}
		suggestions={labels}
		placeholder="Add a label..."
		aria-label="Issue labels"
	/>
	<p class="font-mono text-xs text-muted-foreground">{JSON.stringify(tags)}</p>
</div>
