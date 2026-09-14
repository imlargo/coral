<script lang="ts">
	let { data } = $props();
	// The component is data, so it has to be a `$derived` local before it can be used as a tag.
	const Content = $derived(data.Content);
</script>

<Content />
