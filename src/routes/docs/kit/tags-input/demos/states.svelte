<script lang="ts">
	import TagsInput from '$lib/coral/kit/tags-input/tags-input.svelte';

	let clearable = $state(['uno', 'dos', 'tres']);
</script>

<div class="flex w-full max-w-md flex-col gap-4">
	<div class="flex flex-col gap-2">
		<TagsInput bind:value={clearable} clearable placeholder="Add..." />
		<p class="text-sm text-muted-foreground">clearable</p>
	</div>

	<div class="flex flex-col gap-2">
		<TagsInput value={['solo', 'lectura']} readonly />
		<p class="text-sm text-muted-foreground">readonly</p>
	</div>

	<div class="flex flex-col gap-2">
		<TagsInput value={['sin', 'permiso']} disabled />
		<p class="text-sm text-muted-foreground">disabled</p>
	</div>
</div>
