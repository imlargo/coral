<script lang="ts">
	import TagsInput from '$lib/components/coral/kit/tags-input/tags-input.svelte';
	import type { TagRejection } from '$lib/components/coral/kit/tags-input/tags.js';

	let tags = $state(['mango', 'papaya']);
	let notice = $state('');

	// The copy is the project's - Coral reports the reason and says nothing on screen.
	const reasons: Record<TagRejection['reason'], string> = {
		duplicate: 'is already in the list',
		max: 'only 4 fit',
		invalid: "isn't valid"
	};

	function explain(rejected: TagRejection[]) {
		const [first] = rejected;
		notice = `"${first.value}" ${reasons[first.reason]}`;
	}
</script>

<div class="flex w-full max-w-md flex-col gap-3">
	<TagsInput
		bind:value={tags}
		max={4}
		placeholder="Add a fruit..."
		onreject={explain}
		onchange={() => (notice = '')}
	/>
	<p class="text-sm text-muted-foreground">{notice || `${tags.length} of 4`}</p>
</div>
