<script lang="ts">
	import { page } from '$app/state';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { resolvePathname } from '#lib/utils/paths.js';

	const latest = $derived<string | undefined>(page.data.release?.latest);

	// A changelog date is a calendar day, so it is read and printed in UTC: read as local time it
	// becomes the day before anywhere west of Greenwich.
	const format = new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		timeZone: 'UTC'
	});
</script>

{#if latest}
	<Badge href={resolvePathname('/docs/changelog')} variant="outline" class="hidden lg:inline-flex">
		What's new
		<span class="text-muted-foreground">
			<time datetime={latest}>{format.format(new Date(`${latest}T00:00:00Z`))}</time>
		</span>
	</Badge>
{/if}
