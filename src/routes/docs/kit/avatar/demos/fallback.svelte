<script lang="ts">
	import Avatar from '$lib/coral/kit/avatar/avatar.svelte';
</script>

<!-- No image at all -->
<Avatar name="Ana Restrepo" />

<!-- Image that will fail to load -->
<Avatar src="https://example.invalid/missing.png" name="Ana Restrepo" />

<!-- Explicit fallback wins over the derived initials -->
<Avatar name="Ana Restrepo" fallback="AR" />

<!-- No name and no fallback: an empty circle, not a placeholder nobody asked for -->
<Avatar />
