<script lang="ts">
	import Prose from '$lib/docs/prose.svelte';

	let { data } = $props();
	// The component is data, so it has to be a `$derived` local before it can be used as a tag.
	const Content = $derived(data.Content);
</script>

<Prose title={data.title} description={data.description}>
	<Content />
</Prose>
