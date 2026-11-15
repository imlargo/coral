<script lang="ts">
	import ChevronsDownUpIcon from '@lucide/svelte/icons/chevrons-down-up';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import CodeBlock from '#lib/features/docs/components/CodeBlock.svelte';
	import CopyButton from '#lib/features/docs/components/CopyButton.svelte';
	import type { Demo } from '#lib/features/docs/types.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '#lib/components/ui/tabs/index.js';
	import { cn } from '#lib/utils.js';

	let {
		/** `import demo from './demos/<name>.svelte?demo'`. A missing file fails the build. */
		demo,
		/** Layout overrides for the preview stage - height, alignment, padding. */
		class: className
	}: { demo: Demo; class?: string } = $props();

	const Component = $derived(demo.component);

	/** Past this many lines the code opens folded, so a long demo does not push the page away. */
	const FOLD_AFTER = 18;
	const long = $derived(demo.source.text.split('\n').length > FOLD_AFTER);

	let tab = $state('preview');
	let expanded = $state(false);
	const codeId = $props.id();
</script>

<Tabs bind:value={tab} class="not-prose my-6 gap-0 overflow-hidden rounded-lg border">
	<!-- The list keeps its default `w-fit`: stretched to `w-full` its triggers grow to half the
	     container each, which reads as two buttons rather than one segmented control. -->
	<div class="flex items-center justify-between gap-2 border-b bg-muted/30 px-2 py-1.5">
		<TabsList class="h-7">
			<TabsTrigger value="preview" class="px-3 text-xs">Preview</TabsTrigger>
			<TabsTrigger value="code" class="px-3 text-xs">Code</TabsTrigger>
		</TabsList>
		<CopyButton text={demo.source.text} />
	</div>

	<TabsContent value="preview" class="mt-0">
		<div
			class={cn(
				'docs-stage flex min-h-40 flex-wrap items-center justify-center gap-6 p-6 sm:p-10',
				className
			)}
		>
			<Component />
		</div>
	</TabsContent>

	<TabsContent value="code" class="mt-0">
		<div id={codeId} class={cn('relative', long && !expanded && 'max-h-80 overflow-hidden')}>
			<CodeBlock html={demo.source.html} text={demo.source.text} lang="svelte" copy={false} />
		</div>
		{#if long}
			<div class="flex justify-center border-t bg-muted/30 p-1.5">
				<Button
					variant="ghost"
					class="text-xs text-muted-foreground"
					aria-controls={codeId}
					aria-expanded={expanded}
					onclick={() => (expanded = !expanded)}
				>
					{#if expanded}
						<ChevronsDownUpIcon />
						Collapse code
					{:else}
						<ChevronsUpDownIcon />
						Expand code
					{/if}
				</Button>
			</div>
		{/if}
	</TabsContent>
</Tabs>
