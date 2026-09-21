<script lang="ts">
	import RelativeTime from '$lib/components/coral/kit/relative-time/relative-time.svelte';

	const openedAt = new Date();
</script>

<div class="flex flex-col items-center gap-1 text-sm">
	<p>You opened this page <RelativeTime date={openedAt} precision="second" />.</p>
	<p class="text-muted-foreground">
		Short form: <RelativeTime date={openedAt} format="short" precision="second" />
	</p>
</div>
