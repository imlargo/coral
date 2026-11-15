<script lang="ts">
	import ComponentMetaBar from '#lib/features/docs/components/ComponentMetaBar.svelte';
	import DocsProse from '#lib/features/docs/components/DocsProse.svelte';
	import Install from '#lib/features/docs/components/Install.svelte';

	let { data } = $props();
	// The component is data, so it has to be a `$derived` local before it can be used as a tag.
	const Content = $derived(data.Content);
</script>

<DocsProse
	title={data.title}
	description={data.description}
	raw={data.raw}
	path={data.path}
	updated={data.updated}
	prev={data.prev}
	next={data.next}
>
	{#snippet meta()}
		{#if data.component}
			<ComponentMetaBar component={data.component} />
		{/if}
	{/snippet}
	{#if data.component}
		<Install component={data.component} />
	{/if}
	<Content />
</DocsProse>
