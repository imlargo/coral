<script lang="ts">
	import FileUpload from '#lib/components/coral/kit/file-upload/file-upload.svelte';
	import type { UploadHandler } from '#lib/components/coral/kit/file-upload/types.js';

	// Every second file is refused once, which is the shape of a flaky connection.
	let attempts = 0;
	const upload: UploadHandler<void> = (_file, { signal, onprogress }) =>
		new Promise((resolve, reject) => {
			const refuse = attempts++ % 2 === 1;
			let sent = 0;
			const timer = setInterval(() => {
				sent += 0.15;
				onprogress(sent);
				if (refuse && sent >= 0.45) {
					clearInterval(timer);
					reject(new Error('413 Payload Too Large'));
				} else if (sent >= 1) {
					clearInterval(timer);
					resolve();
				}
			}, 200);
			signal.addEventListener('abort', () => clearInterval(timer));
		});
</script>

<div class="w-full max-w-md">
	<FileUpload
		{upload}
		multiple
		aria-label="Attachments"
		failedMessage={(error) => (error instanceof Error ? error.message : 'Upload failed')}
	/>
</div>
