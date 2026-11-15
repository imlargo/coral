<script lang="ts">
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import { Button } from '#lib/components/ui/button/index.js';
	import type { SidebarLink } from '#lib/features/docs/types.js';
	import { resolvePathname } from '#lib/utils/paths.js';

	let { prev, next }: { prev?: SidebarLink; next?: SidebarLink } = $props();
</script>

<!-- The footer has the same links with their titles; these save a scroll when paging through. -->
<div class="hidden items-center gap-1 sm:flex">
	<Button
		variant="outline"
		size="icon"
		href={prev ? resolvePathname(prev.href) : undefined}
		disabled={!prev}
		aria-label={prev ? `Previous: ${prev.title}` : 'No previous page'}
	>
		<ArrowLeftIcon />
	</Button>
	<Button
		variant="outline"
		size="icon"
		href={next ? resolvePathname(next.href) : undefined}
		disabled={!next}
		aria-label={next ? `Next: ${next.title}` : 'No next page'}
	>
		<ArrowRightIcon />
	</Button>
</div>
