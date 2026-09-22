<script lang="ts">
	import DocsProse from '$docs/components/layout/docs/docs-prose.svelte';
	import Install from '$docs/install.svelte';

	let { data } = $props();
	// The component is data, so it has to be a `$derived` local before it can be used as a tag.
	const Content = $derived(data.Content);
</script>

<DocsProse
	title={data.title}
	description={data.description}
	raw={data.raw}
	prev={data.prev}
	next={data.next}
>
	{#if data.item}
		<Install item={data.item} />
	{/if}
	<Content />
</DocsProse>
