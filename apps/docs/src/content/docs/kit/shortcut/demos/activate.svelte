<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import Shortcut from '#lib/components/coral/kit/shortcut/shortcut.svelte';

	let deploys = $state(0);
</script>

<!-- One handler, on the button: the shortcut presses it. -->
<div class="flex flex-col items-center gap-3">
	<Button variant="outline" aria-keyshortcuts="Alt+D" onclick={() => deploys++}>
		Deploy preview <Shortcut keys="alt+d" activate />
	</Button>
	<p class="text-sm text-muted-foreground">
		{deploys === 0 ? 'No previews deployed' : `${deploys} deployed`}
	</p>
</div>
