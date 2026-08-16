<script lang="ts">
	import CodeBlock from './code-block.svelte';
	import { getDemo } from './demos.js';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs/index.js';
	import { cn } from '$lib/utils.js';

	let {
		/** Demo name, e.g. `kit/avatar/basic`. Unknown names fail the build. */
		name,
		/** Layout overrides for the preview stage — height, alignment, padding. */
		class: className
	}: { name: string; class?: string } = $props();

	const demo = $derived(getDemo(name));
	const Demo = $derived(demo.component);
</script>

<Tabs value="preview" class="not-prose my-6 gap-0">
	<TabsList class="w-full justify-start rounded-b-none border-b bg-transparent p-0">
		<TabsTrigger value="preview">Preview</TabsTrigger>
		<TabsTrigger value="code">Code</TabsTrigger>
	</TabsList>

	<TabsContent value="preview" class="mt-0">
		<div
			class={cn(
				'flex min-h-56 flex-wrap items-center justify-center gap-6 rounded-b-lg border border-t-0 p-8',
				className
			)}
		>
			<Demo />
		</div>
	</TabsContent>

	<TabsContent value="code" class="mt-0">
		<CodeBlock
			html={demo.source.html}
			text={demo.source.text}
			class="max-h-[32rem] overflow-y-auto rounded-b-lg border border-t-0"
		/>
	</TabsContent>
</Tabs>
