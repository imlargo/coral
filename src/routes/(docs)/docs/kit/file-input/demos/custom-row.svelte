<script lang="ts">
	import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';
	import XIcon from '@lucide/svelte/icons/x';
	import FileInput from '#lib/components/coral/kit/file-input/file-input.svelte';
	import { formatBytes } from '#lib/components/coral/kit/file-input/format-bytes.js';
	import * as Attachment from '#lib/components/ui/attachment/index.js';
	import { Spinner } from '#lib/components/ui/spinner/index.js';

	let files = $state<File[]>([]);

	// Stands in for whatever the project's uploader reports. Coral holds the files and knows
	// nothing about where they go, so this state lives here rather than in the component.
	const progressFor = (file: File) => Math.min(100, Math.round((file.size % 90) + 10));
	const stateFor = (file: File) =>
		progressFor(file) === 100 ? 'done' : file.name.endsWith('.log') ? 'error' : 'uploading';
</script>

<div class="w-full max-w-md">
	<FileInput bind:value={files} multiple label="Attach screenshots or log files">
		{#snippet file({ file, remove })}
			{@const state = stateFor(file)}
			<Attachment.Root {state} class="w-full">
				<Attachment.Media>
					{#if state === 'uploading'}
						<Spinner />
					{:else}
						<XIcon />
					{/if}
				</Attachment.Media>
				<Attachment.Content>
					<Attachment.Title>{file.name}</Attachment.Title>
					<Attachment.Description>
						{#if state === 'error'}
							Upload failed. Try again.
						{:else if state === 'done'}
							Uploaded · {formatBytes(file.size)}
						{:else}
							Uploading · {progressFor(file)}%
						{/if}
					</Attachment.Description>
				</Attachment.Content>
				<Attachment.Actions>
					{#if state === 'error'}
						<Attachment.Action aria-label="Retry {file.name}">
							<RefreshCwIcon />
						</Attachment.Action>
					{/if}
					<Attachment.Action aria-label="Remove {file.name}" onclick={remove}>
						<XIcon />
					</Attachment.Action>
				</Attachment.Actions>
			</Attachment.Root>
		{/snippet}
	</FileInput>
</div>
