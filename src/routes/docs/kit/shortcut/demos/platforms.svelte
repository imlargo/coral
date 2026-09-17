<script lang="ts">
	import Shortcut from '$lib/coral/kit/shortcut/shortcut.svelte';

	const combos = ['mod+shift+p', 'alt+enter', 'ctrl+alt+delete', 'shift+?'];
</script>

<table class="text-sm">
	<thead>
		<tr class="text-muted-foreground">
			<th class="pe-6 text-start font-normal">Atajo</th>
			<th class="pe-6 text-start font-normal">macOS</th>
			<th class="text-start font-normal">Windows / Linux</th>
		</tr>
	</thead>
	<tbody>
		{#each combos as keys (keys)}
			<tr>
				<td class="py-1 pe-6"><code>{keys}</code></td>
				<td class="py-1 pe-6"><Shortcut {keys} platform="mac" /></td>
				<td class="py-1"><Shortcut {keys} platform="other" /></td>
			</tr>
		{/each}
	</tbody>
</table>
