<script lang="ts">
	import FileInput from '$lib/coral/kit/file-input/file-input.svelte';
	import type { FileRejection } from '$lib/coral/kit/file-input/types.js';

	let files = $state<File[]>([]);
	let problems = $state<string[]>([]);

	// The message is the project's, in the project's language. Coral only says what happened.
	const reasons: Record<FileRejection['reason'], string> = {
		type: 'no es un tipo permitido',
		size: 'pesa más de 1 MB',
		count: 'sobra: ya hay 3'
	};

	function onreject(rejections: FileRejection[]) {
		problems = rejections.map(({ file, reason }) => `${file.name} ${reasons[reason]}`);
	}
</script>

<div class="flex w-full max-w-md flex-col gap-3">
	<FileInput
		bind:value={files}
		multiple
		maxFiles={3}
		maxSize={1024 * 1024}
		accept="image/*,.pdf"
		{onreject}
		onchange={() => (problems = [])}
	/>

	{#each problems as problem (problem)}
		<p class="text-sm text-destructive">{problem}</p>
	{/each}
</div>
