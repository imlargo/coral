<script lang="ts">
	import SearchInput from '$lib/coral/kit/search-input/search-input.svelte';
	import Shortcut from '$lib/coral/kit/shortcut/shortcut.svelte';

	let field = $state<HTMLInputElement | null>(null);
</script>

<!-- A plain key: it does not fire while typing in a field, so `s` still types an s there. -->
<div class="flex w-80 flex-col gap-2">
	<SearchInput bind:ref={field} placeholder="Search…" aria-label="Search" aria-keyshortcuts="S" />
	<p class="flex items-center gap-2 text-sm text-muted-foreground">
		<Shortcut keys="s" onpress={() => field?.focus()} /> focuses search from anywhere
	</p>
</div>
