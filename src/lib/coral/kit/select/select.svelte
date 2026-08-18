<script lang="ts" generics="T">
	/**
	 * @coral/kit/select
	 * @version 1.0.0
	 */
	import XIcon from '@lucide/svelte/icons/x';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import { flatten, toGroups } from '../../lib/options.js';
	import type { SelectProps } from './types.js';

	let {
		options,
		value = $bindable(),
		open = $bindable(false),
		placeholder = 'Select an option...',
		clearLabel = 'Clear selection',
		onchange,
		disabled = false,
		clearable = false,
		name,
		serialize,
		size = 'default',
		class: className,
		contentClass,
		trigger,
		option: optionSnippet,
		...restProps
	}: SelectProps<T> = $props();

	const toText = $derived(serialize ?? ((entry: T) => String(entry)));
	const groups = $derived(toGroups(options));
	const all = $derived(flatten(options));

	/**
	 * bits-ui keys an item by a string, and `T` is not one. A running index across all groups is
	 * unique by construction.
	 *
	 * `String(value)` is the obvious alternative and it is what three of the four selects in the
	 * corpus reached for. It is lossy twice over: two ids that stringify the same collapse onto
	 * one item, and every object value becomes `[object Object]`, so the whole list shares a key.
	 * An index cannot collide with itself.
	 */
	const indexed = $derived.by(() => {
		let index = 0;
		return groups.map((group) => ({
			label: group.label,
			entries: group.options.map((option) => ({ option, index: index++ }))
		}));
	});

	const selectedIndex = $derived(all.findIndex((option) => option.value === value));
	const selected = $derived(selectedIndex === -1 ? undefined : all[selectedIndex]);
	const selectedKey = $derived(selectedIndex === -1 ? '' : String(selectedIndex));
	const showClear = $derived(clearable && selected !== undefined && !disabled);

	/**
	 * Typeahead while the trigger is focused and the list is shut, the way a native `<select>`
	 * behaves. bits-ui needs the labels up front for it, because an item that has never been
	 * mounted cannot report its own.
	 */
	const items = $derived(
		all.map((option, index) => ({
			value: String(index),
			label: option.label,
			disabled: option.disabled
		}))
	);

	/**
	 * The only place `onchange` is called from.
	 *
	 * Both selects in the corpus derived it from the value with an `$effect` instead, which fires
	 * on mount and on every programmatic assignment - so a form that loads a saved record
	 * announces a change nobody made, and does it again on every rehydrate.
	 */
	function handleValueChange(key: string) {
		// bits-ui reports a deselection as an empty string.
		const option = key === '' ? undefined : all[Number(key)];
		value = option?.value;
		onchange?.(value, option);
	}

	function clear() {
		value = undefined;
		onchange?.(undefined, undefined);
	}
</script>

<div class="relative">
	<Select.Root
		type="single"
		bind:open
		{disabled}
		{items}
		allowDeselect={clearable}
		value={selectedKey}
		onValueChange={handleValueChange}
		{...restProps}
	>
		<Select.Trigger
			{size}
			class={cn('w-full', showClear && 'pe-9', className)}
			aria-label={selected ? undefined : placeholder}
		>
			{#if trigger}
				{@render trigger({ selected, placeholder, disabled })}
			{:else if selected}
				<span class="min-w-0 truncate">{selected.label}</span>
			{:else}
				<!--
					`data-placeholder` on the trigger is what dims placeholder text, and the primitive
					only sets it when its own value is empty. Coral drives the value, so the empty case
					is spelled out here rather than inherited.
				-->
				<span class="min-w-0 truncate text-muted-foreground">{placeholder}</span>
			{/if}
		</Select.Trigger>

		<Select.Content class={contentClass}>
			{#each indexed as group, groupIndex (groupIndex)}
				<Select.Group>
					{#if group.label}
						<Select.GroupHeading>{group.label}</Select.GroupHeading>
					{/if}
					{#each group.entries as entry (entry.index)}
						{@const isSelected = entry.index === selectedIndex}
						<Select.Item
							value={String(entry.index)}
							label={entry.option.label}
							disabled={entry.option.disabled}
						>
							{#if optionSnippet}
								{@render optionSnippet({ option: entry.option, selected: isSelected })}
							{:else if entry.option.description}
								<span class="flex min-w-0 flex-col">
									<span class="truncate">{entry.option.label}</span>
									<span class="truncate text-muted-foreground">{entry.option.description}</span>
								</span>
							{:else}
								{entry.option.label}
							{/if}
						</Select.Item>
					{/each}
				</Select.Group>
			{/each}
		</Select.Content>
	</Select.Root>

	<!--
		Beside the trigger, not inside it. The trigger is a `<button>`, and a button nested in a
		button is invalid HTML that browsers recover from by dropping one of the two.
	-->
	{#if showClear}
		<Button
			type="button"
			variant="ghost"
			size="icon-xs"
			class="absolute inset-y-0 end-7 my-auto"
			aria-label={clearLabel}
			onclick={clear}
		>
			<XIcon class="opacity-50" />
		</Button>
	{/if}
</div>

{#if name}
	<input type="hidden" {name} value={value === undefined ? '' : toText(value)} />
{/if}
