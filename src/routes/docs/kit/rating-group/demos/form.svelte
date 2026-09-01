<script lang="ts">
	import RatingGroup from '$lib/coral/kit/rating-group/rating-group.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Field from '$lib/components/ui/field/index.js';

	let submitted = $state<string | null>(null);

	function submit(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
		event.preventDefault();
		const body = new FormData(event.currentTarget);
		submitted = JSON.stringify(Object.fromEntries(body));
	}
</script>

<form class="flex w-full max-w-sm flex-col gap-4" onsubmit={submit}>
	<!-- The legend names the group; the rating points at it instead of carrying its own copy. -->
	<Field.Set>
		<Field.Legend variant="label" id="score-legend">¿Cómo estuvo el servicio?</Field.Legend>
		<RatingGroup name="score" required aria-labelledby="score-legend" />
	</Field.Set>

	<Button type="submit" size="sm" class="self-start">Enviar</Button>

	{#if submitted}
		<p class="font-mono text-xs text-muted-foreground">{submitted}</p>
	{/if}
</form>
