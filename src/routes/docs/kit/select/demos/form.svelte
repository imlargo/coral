<script lang="ts">
	import Select from '$lib/coral/kit/select/select.svelte';

	const fruits = [
		{ value: 1, label: 'Açaí' },
		{ value: 2, label: 'Guava' },
		{ value: 3, label: 'Kiwi' }
	];

	let submitted = $state<string>();

	function onsubmit(event: SubmitEvent) {
		event.preventDefault();
		const data = new FormData(event.currentTarget as HTMLFormElement);
		submitted = data.get('fruit')?.toString() || 'nothing';
	}
</script>

<form {onsubmit} class="flex w-64 flex-col gap-3">
	<!-- `required` blocks the submit while nothing is picked - try it with the field empty. -->
	<Select options={fruits} name="fruit" placeholder="Select a fruit..." clearable required />
	<button type="submit" class="text-sm underline underline-offset-4">Submit</button>
	{#if submitted}
		<p class="text-sm text-muted-foreground">Posted fruit={submitted}</p>
	{/if}
</form>
