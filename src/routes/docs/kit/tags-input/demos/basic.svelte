<script lang="ts">
	import TagsInput from '$lib/coral/kit/tags-input/tags-input.svelte';

	let tags = $state(['vainilla', 'chocolate']);
</script>

<div class="flex w-full max-w-md flex-col gap-3">
	<TagsInput bind:value={tags} placeholder="Add a flavour..." />
	<p class="font-mono text-xs text-muted-foreground">{JSON.stringify(tags)}</p>
</div>
