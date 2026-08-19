<script lang="ts">
	import FileInput from '$lib/coral/kit/file-input/file-input.svelte';
	import { formatBytes } from '$lib/coral/kit/file-input/format-bytes.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import * as Item from '$lib/components/ui/item/index.js';

	let files = $state<File[]>([]);

	// Stands in for whatever the project's uploader reports. Coral holds the files and knows
	// nothing about where they go, so this state lives here rather than in the component.
	const progressFor = (file: File) => Math.min(100, Math.round((file.size % 90) + 10));
</script>

<div class="w-full max-w-md">
	<FileInput bind:value={files} multiple label="Attach the supporting documents">
		{#snippet file({ file, remove })}
			<Item.Root variant="muted">
				<Item.Content class="min-w-0 gap-2">
					<Item.Title class="truncate">{file.name}</Item.Title>
					<Progress value={progressFor(file)} class="h-1" />
					<Item.Description>{formatBytes(file.size)} · {progressFor(file)}%</Item.Description>
				</Item.Content>
				<Item.Actions>
					<Button variant="ghost" size="xs" onclick={remove}>Cancel</Button>
				</Item.Actions>
			</Item.Root>
		{/snippet}
	</FileInput>
</div>
