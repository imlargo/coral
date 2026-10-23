<script lang="ts">
	import CodeBlock from './code-block.svelte';
	import { getDemo } from './demos.js';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs/index.js';
	import { cn } from '$lib/utils.js';

	let {
		/** Demo name, e.g. `kit/avatar/basic`. Unknown names fail the build. */
		name,
		/** Layout overrides for the preview stage - height, alignment, padding. */
		class: className
	}: { name: string; class?: string } = $props();

	const demo = $derived(getDemo(name));
	const Demo = $derived(demo.component);
</script>

<Tabs value="preview" class="not-prose my-6 gap-0 overflow-hidden rounded-lg border">
	<!-- The list keeps its default `w-fit`: stretched to `w-full` its triggers grow to half the
	     container each, which reads as two buttons rather than one segmented control. -->
	<div class="flex items-center border-b bg-muted/30 px-2 py-1.5">
		<TabsList class="h-7">
			<TabsTrigger value="preview" class="px-3 text-xs">Preview</TabsTrigger>
			<TabsTrigger value="code" class="px-3 text-xs">Code</TabsTrigger>
		</TabsList>
	</div>

	<TabsContent value="preview" class="mt-0">
		<div
			class={cn(
				'docs-stage flex min-h-40 flex-wrap items-center justify-center gap-6 p-8',
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
			lang="svelte"
			class="max-h-[28rem] overflow-y-auto"
		/>
	</TabsContent>
</Tabs>
