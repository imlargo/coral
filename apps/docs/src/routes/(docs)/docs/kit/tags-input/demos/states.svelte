<script lang="ts">
	import TagsInput from '$lib/components/coral/kit/tags-input/tags-input.svelte';

	let clearable = $state(['one', 'two', 'three']);
</script>

<div class="flex w-full max-w-md flex-col gap-4">
	<div class="flex flex-col gap-2">
		<TagsInput bind:value={clearable} clearable placeholder="Add..." />
		<p class="text-sm text-muted-foreground">clearable</p>
	</div>

	<div class="flex flex-col gap-2">
		<TagsInput value={['read', 'only']} readonly />
		<p class="text-sm text-muted-foreground">readonly</p>
	</div>

	<div class="flex flex-col gap-2">
		<TagsInput value={['no', 'permission']} disabled />
		<p class="text-sm text-muted-foreground">disabled</p>
	</div>
</div>
