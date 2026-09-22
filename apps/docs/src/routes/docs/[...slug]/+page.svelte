<script lang="ts">
	import Install from '$docs/install.svelte';
	import DocsProse from '$docs/docs-prose.svelte';

	let { data } = $props();
	// The component is data, so it has to be a `$derived` local before it can be used as a tag.
	const Content = $derived(data.Content);
</script>

<DocsProse title={data.title} description={data.description}>
	{#if data.item}
		<Install item={data.item} />
	{/if}
	<Content />
</DocsProse>
