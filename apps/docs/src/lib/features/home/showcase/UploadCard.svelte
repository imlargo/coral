<script lang="ts">
	import ShowcaseCard from '#lib/features/home/showcase/ShowcaseCard.svelte';
	import FileUpload from '#lib/components/coral/kit/file-upload/file-upload.svelte';
	import type { UploadHandler } from '#lib/components/coral/kit/file-upload/types.js';
	import { PROJECT, wait } from '#lib/features/home/world.js';

	// The first file picked, and any file named with "fail", is refused once so Retry has work to do.
	let first = true;
	const refused: string[] = [];

	const upload: UploadHandler<string> = async (file, { signal, onprogress }) => {
		const refuse =
			(first || file.name.toLowerCase().includes('fail')) && !refused.includes(file.name);
		first = false;
		if (refuse) refused.push(file.name);

		let sent = 0;
		while (sent < 1) {
			await wait(200);
			if (signal.aborted) throw signal.reason;
			sent = Math.min(1, sent + 0.08 + Math.random() * 0.06);
			onprogress(sent);
			if (refuse && sent >= 0.4) throw new Error('Connection reset by the storage node');
		}
		return `https://assets.example.com/${PROJECT}/${file.name}`;
	};

	let landed = $state(0);
</script>

<ShowcaseCard
	title="Release assets"
	description="Attach build artifacts to the v2.4.0 release of {PROJECT}."
	hint="Drop any files: the first one, and any named with “fail”, is refused once so you can retry it."
	components={['kit/file-upload']}
>
	<div class="flex min-w-0 flex-col gap-3">
		<FileUpload
			{upload}
			multiple
			concurrency={2}
			aria-label="Release assets"
			label="Drop files here or click to browse"
			hint="Nothing leaves your browser: the upload is simulated."
			failedMessage={(error) => (error instanceof Error ? error.message : 'Upload failed')}
			onupload={() => landed++}
		/>
		<p class="text-sm text-muted-foreground">
			{landed === 1 ? '1 asset attached' : `${landed} assets attached`}
		</p>
	</div>
</ShowcaseCard>
