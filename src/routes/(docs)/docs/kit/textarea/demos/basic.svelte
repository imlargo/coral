<script lang="ts">
	import Textarea from '#lib/components/coral/kit/textarea/textarea.svelte';
	import * as Field from '#lib/components/ui/field/index.js';

	let value = $state(
		'The deploy failed on the build step.\nIt looks like the lockfile is out of date.'
	);
</script>

<Field.Field class="w-96">
	<Field.Label for="issue-body">Description</Field.Label>
	<Textarea id="issue-body" bind:value rows={2} maxRows={8} placeholder="What happened?" />
	<Field.Description>
		Two lines to start, eight at most. Past that it scrolls instead of pushing the page down.
	</Field.Description>
</Field.Field>
