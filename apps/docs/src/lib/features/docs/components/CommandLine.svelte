<script lang="ts">
	import CopyButton from '#lib/features/docs/components/CopyButton.svelte';
	import { cn } from '#lib/utils.js';

	let { command, class: className }: { command: string; class?: string } = $props();
</script>

<!-- Printed rather than highlighted: one line of shell, mostly a URL, has nothing to colour that
     would justify shipping a highlighter to the browser for it. -->
<div class={cn('relative', className)}>
	<CopyButton text={command} class="absolute top-2 right-2 z-10" />
	<div class="docs-code">
		<pre class="pe-10"><code>{command}</code></pre>
	</div>
</div>
