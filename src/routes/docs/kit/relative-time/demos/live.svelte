<script lang="ts">
	import RelativeTime from '$lib/coral/kit/relative-time/relative-time.svelte';

	const openedAt = new Date();
</script>

<div class="flex flex-col items-center gap-1 text-sm">
	<p>Abriste esta página <RelativeTime date={openedAt} precision="second" />.</p>
	<p class="text-muted-foreground">
		En inglés, corto: <RelativeTime date={openedAt} locale="en" format="short" precision="second" />
	</p>
</div>
