<script lang="ts">
	import FileInput from '$lib/coral/kit/file-input/file-input.svelte';

	let files = $state<File[]>([]);
</script>

<div class="w-full max-w-md">
	<FileInput bind:value={files} />
</div>
