<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import Avatar from '$lib/coral/kit/avatar/avatar.svelte';
	import { AvatarBadge } from '$lib/components/ui/avatar/index.js';
</script>

<!-- `children` renders inside the root, alongside the image — the primitive stays reachable -->
<Avatar src="https://github.com/shadcn.png" name="Shad CN" size="lg">
	<AvatarBadge />
</Avatar>

<Avatar name="Ana Restrepo" size="lg">
	<AvatarBadge>
		<CheckIcon />
	</AvatarBadge>
</Avatar>
