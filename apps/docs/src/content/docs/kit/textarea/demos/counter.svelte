<script lang="ts">
	import Textarea from '#lib/components/coral/kit/textarea/textarea.svelte';
	import * as Field from '#lib/components/ui/field/index.js';

	let summary = $state('');
</script>

<Field.Field class="w-96">
	<Field.Label for="release-summary">Release summary</Field.Label>
	<Textarea
		id="release-summary"
		bind:value={summary}
		rows={3}
		maxRows={10}
		maxLength={140}
		showCount
		placeholder="What shipped in this release?"
	/>
	<Field.Description>
		The last 14 characters turn the counter red and announce what is left.
	</Field.Description>
</Field.Field>
