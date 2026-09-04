<script lang="ts">
	import Select from '$lib/coral/kit/select/select.svelte';

	const cities = [
		{ value: 11001, label: 'Bogotá' },
		{ value: 5001, label: 'Medellín' },
		{ value: 76001, label: 'Cali' }
	];

	let submitted = $state<string>();

	function onsubmit(event: SubmitEvent) {
		event.preventDefault();
		const data = new FormData(event.currentTarget as HTMLFormElement);
		submitted = data.get('city')?.toString() || 'nothing';
	}
</script>

<form {onsubmit} class="flex w-64 flex-col gap-3">
	<!-- `required` blocks the submit while nothing is picked - try it with the field empty. -->
	<Select options={cities} name="city" placeholder="Select a city..." clearable required />
	<button type="submit" class="text-sm underline underline-offset-4">Submit</button>
	{#if submitted}
		<p class="text-sm text-muted-foreground">Posted city={submitted}</p>
	{/if}
</form>
