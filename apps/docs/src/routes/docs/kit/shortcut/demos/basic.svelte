<script lang="ts">
	import Shortcut from '$lib/components/coral/kit/shortcut/shortcut.svelte';

	let presses = $state(0);
</script>

<div class="flex flex-col items-center gap-3">
	<p class="flex items-center gap-2 text-sm">
		Press <Shortcut keys="alt+n" onpress={() => presses++} />
	</p>
	<p class="text-sm text-muted-foreground">Presses: {presses}</p>
</div>
