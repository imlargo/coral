<script lang="ts">
	import RelativeTime from '$lib/components/coral/kit/relative-time/relative-time.svelte';

	const day = 24 * 60 * 60 * 1000;
	const week = 7 * day;
</script>

<ul class="flex w-80 flex-col gap-2 text-sm">
	<li class="flex justify-between">
		<span>2 days ago</span>
		<RelativeTime date={Date.now() - 2 * day} cutoff={week} />
	</li>
	<li class="flex justify-between">
		<span>40 days ago</span>
		<RelativeTime
			date={Date.now() - 40 * day}
			cutoff={week}
			titleFormat={{ dateStyle: 'medium' }}
		/>
	</li>
</ul>
