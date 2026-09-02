<script lang="ts">
	import HashIcon from '@lucide/svelte/icons/hash';
	import TagsInput from '$lib/coral/kit/tags-input/tags-input.svelte';

	let tags = $state(['reef', 'coral']);
</script>

<div class="w-full max-w-md">
	<TagsInput
		bind:value={tags}
		tagVariant="outline"
		sanitize={(raw) => raw.trim().replace(/^#/, '')}
		placeholder="Add a topic..."
	>
		{#snippet tag({ value })}
			<HashIcon class="opacity-60" />
			<span class="min-w-0 truncate">{value}</span>
		{/snippet}
	</TagsInput>
</div>
