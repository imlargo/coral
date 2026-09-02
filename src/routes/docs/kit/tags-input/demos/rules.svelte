<script lang="ts">
	import TagsInput from '$lib/coral/kit/tags-input/tags-input.svelte';

	let emails = $state(['ana@kora.co']);
	let rejected = $state(0);
</script>

<div class="flex w-full max-w-md flex-col gap-3">
	<!--
		One rule, applied wherever a value comes from: typing it, pasting a column of them, or
		leaving the field with one half-written in it.
	-->
	<TagsInput
		bind:value={emails}
		delimiter={/[,;\s]/}
		sanitize={(raw) => raw.trim().toLowerCase()}
		validate={(value) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)}
		onreject={(entries) => (rejected += entries.length)}
		placeholder="Add an email..."
	/>
	<p class="text-sm text-muted-foreground">
		Paste <code class="font-mono text-xs">Ana@Kora.co; nope; luis@kora.co</code> · turned away:
		{rejected}
	</p>
</div>
