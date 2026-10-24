<script lang="ts">
	import FileUpload from '#lib/components/coral/kit/file-upload/file-upload.svelte';
	import type { UploadHandler } from '#lib/components/coral/kit/file-upload/types.js';

	// Stands in for a request: progress ticks up, then the URL the server would hand back.
	const upload: UploadHandler<string> = (file, { signal, onprogress }) =>
		new Promise((resolve, reject) => {
			let sent = 0;
			const timer = setInterval(() => {
				sent += 0.08 + Math.random() * 0.1;
				if (sent >= 1) {
					clearInterval(timer);
					resolve(`https://cdn.example.com/${file.name}`);
				} else {
					onprogress(sent);
				}
			}, 250);
			signal.addEventListener('abort', () => {
				clearInterval(timer);
				reject(new Error('aborted'));
			});
		});

	let urls = $state<string[]>([]);
</script>

<div class="flex w-full max-w-md flex-col gap-3">
	<FileUpload
		{upload}
		multiple
		concurrency={2}
		accept="image/*,.pdf"
		maxSize={10 * 1024 * 1024}
		aria-label="Attachments"
		onupload={(entry) => (urls = [...urls, entry.result ?? ''])}
	/>
	{#if urls.length}
		<p class="text-sm text-muted-foreground">Landed: {urls.length}</p>
	{/if}
</div>
