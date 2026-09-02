<script lang="ts">
	import TagsInput from '$lib/coral/kit/tags-input/tags-input.svelte';
	import type { TagRejection } from '$lib/coral/kit/tags-input/tags.js';

	let tags = $state(['bogotá', 'medellín']);
	let notice = $state('');

	// The copy is the project's - Coral reports the reason and says nothing on screen.
	const reasons: Record<TagRejection['reason'], string> = {
		duplicate: 'ya está en la lista',
		max: 'no caben más de 4',
		invalid: 'no es válido'
	};

	function explain(rejected: TagRejection[]) {
		const [first] = rejected;
		notice = `«${first.value}» ${reasons[first.reason]}`;
	}
</script>

<div class="flex w-full max-w-md flex-col gap-3">
	<TagsInput
		bind:value={tags}
		max={4}
		placeholder="Add a city..."
		onreject={explain}
		onchange={() => (notice = '')}
	/>
	<p class="text-sm text-muted-foreground">{notice || `${tags.length} de 4`}</p>
</div>
