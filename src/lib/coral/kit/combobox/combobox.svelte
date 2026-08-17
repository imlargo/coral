<script lang="ts" generics="T, Type extends ComboboxType = 'single'">
	/**
	 * @coral/kit/combobox
	 * @version 2.0.0
	 */
	import { tick } from 'svelte';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import XIcon from '@lucide/svelte/icons/x';
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import { flatten, includesValue, matches, terms, toGroups } from './options.js';
	import type { ComboboxProps, ComboboxType, Option } from './types.js';

	let {
		options,
		// Left undefined rather than defaulted: `Type` is inferred, and writing a concrete
		// `'single'` into it would not be assignable to whatever the caller instantiated it as.
		// Absent means single, which is what `multiple` below reads.
		type,
		value = $bindable(),
		open = $bindable(false),
		search = $bindable(''),
		placeholder = 'Select an option...',
		searchPlaceholder = 'Search...',
		emptyMessage = 'No results found.',
		clearLabel = 'Clear selection',
		onchange,
		onsearch,
		searchDebounce = 0,
		onOpenChange,
		filter,
		shouldFilter = true,
		disabled = false,
		clearable = false,
		loading = false,
		name,
		maxDisplay = 3,
		class: className,
		contentClass,
		listClass,
		trigger,
		option: optionSnippet,
		empty,
		indicator,
		footer,
		...restProps
	}: ComboboxProps<T, Type> = $props();

	let triggerRef = $state<HTMLButtonElement>(null!);
	let searchTimer: ReturnType<typeof setTimeout> | undefined;

	const multiple = $derived(type === 'multiple');
	const groups = $derived(toGroups(options));
	const all = $derived(flatten(options));

	/**
	 * Command identifies an item by a string, and `T` is not one - stringifying an id is lossy and
	 * two options can collapse onto the same key. A running index across all groups is unique by
	 * construction.
	 */
	const indexed = $derived.by(() => {
		let index = 0;
		return groups.map((group) => ({
			label: group.label,
			options: group.options.map((option) => ({ option, index: index++ }))
		}));
	});

	/** The selection as an array, whatever `type` is, so one code path handles both. */
	const values = $derived<T[]>(
		multiple ? ((value as T[] | undefined) ?? []) : value === undefined ? [] : [value as T]
	);
	const selected = $derived(all.filter((option) => includesValue(values, option.value)));
	const shown = $derived(selected.slice(0, maxDisplay));
	const overflow = $derived(Math.max(0, selected.length - maxDisplay));

	const match = $derived(filter ?? matches<T>);
	const visible = $derived(shouldFilter ? all.filter((option) => match(option, search)) : all);

	/**
	 * Matching runs against the whole `Option` rather than inside Command's scorer, so a caller's
	 * `filter` sees the value, the description and the keywords - not just the two strings Command
	 * would otherwise hand it. Each item carries its own verdict as a sentinel keyword, and
	 * Command's scorer does nothing but read it back.
	 */
	const KEEP = 'coral:keep';

	function keywordsFor(option: Option<T>): string[] {
		return match(option, search) ? [KEEP, ...terms(option)] : terms(option);
	}

	/** 1 keeps the item, 0 hides it. */
	function score(_value: string, _search: string, keywords?: string[]): number {
		return keywords?.includes(KEEP) ? 1 : 0;
	}

	function commit(next: T | T[] | undefined, option: Option<T> | undefined) {
		value = next as never;
		(onchange as ((v: typeof next, o: Option<T> | undefined) => void) | undefined)?.(next, option);
	}

	function close() {
		open = false;
		tick().then(() => triggerRef?.focus());
	}

	/**
	 * `onchange` is called from here, from `clear` and from `selectAll`, and nowhere else. Deriving
	 * the same signal from `value` with an `$effect` would also fire on mount and on every
	 * programmatic assignment, announcing a selection nobody made.
	 */
	function select(option: Option<T>) {
		if (option.disabled) return;

		if (multiple) {
			const current = (value as T[] | undefined) ?? [];
			const next = includesValue(current, option.value)
				? current.filter((candidate) => candidate !== option.value)
				: [...current, option.value];
			commit(next, option);
			// The popover stays open: picking one of several is rarely picking the last one.
			return;
		}

		const isSelected = value !== undefined && value === option.value;
		const next = clearable && isSelected ? undefined : option.value;
		commit(next, next === undefined ? undefined : option);
		close();
	}

	function clear() {
		commit(multiple ? [] : undefined, undefined);
	}

	function selectAll() {
		if (!multiple) return;
		const next = visible.filter((option) => !option.disabled).map((option) => option.value);
		commit(next, undefined);
	}

	function handleSearch(event: Event & { currentTarget: HTMLInputElement }) {
		if (!onsearch) return;
		const next = event.currentTarget.value;
		clearTimeout(searchTimer);
		if (!searchDebounce) {
			onsearch(next);
			return;
		}
		searchTimer = setTimeout(() => onsearch(next), searchDebounce);
	}

	/** A term left behind would filter the list before the user has typed anything next time. */
	function handleOpenChange(next: boolean) {
		if (!next) {
			clearTimeout(searchTimer);
			search = '';
		}
		onOpenChange?.(next);
	}
</script>

<Popover.Root bind:open onOpenChange={handleOpenChange} {...restProps}>
	<div class="relative">
		<Popover.Trigger bind:ref={triggerRef}>
			{#snippet child({ props })}
				{#if trigger}
					{@render trigger({ props, selected, open, disabled, clear })}
				{:else}
					<Button
						{...props}
						variant="outline"
						role="combobox"
						aria-expanded={open}
						{disabled}
						class={cn(
							'w-full justify-between gap-2',
							clearable && selected.length > 0 && 'pe-14',
							className
						)}
					>
						{#if selected.length === 0}
							{placeholder}
						{:else if multiple}
							<span class="flex min-w-0 flex-wrap items-center gap-1">
								{#each shown as option (option.value)}
									<Badge variant="secondary">{option.label}</Badge>
								{/each}
								{#if overflow > 0}
									<Badge variant="outline">+{overflow}</Badge>
								{/if}
							</span>
						{:else}
							<span class="min-w-0 truncate">{selected[0].label}</span>
						{/if}
						<ChevronsUpDownIcon class="opacity-50" />
					</Button>
				{/if}
			{/snippet}
		</Popover.Trigger>

		<!--
			The clear control sits beside the trigger rather than inside it. A button nested in a
			button is invalid HTML, and browsers recover from it by dropping one of the two - which
			is how a per-badge remove control ends up unreachable by keyboard.
		-->
		{#if clearable && !trigger && selected.length > 0 && !disabled}
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

	<Popover.Content class={cn('w-(--bits-popover-anchor-width) p-0', contentClass)}>
		<Command.Root filter={score} {shouldFilter}>
			<Command.Input placeholder={searchPlaceholder} bind:value={search} oninput={handleSearch} />

			<Command.List class={listClass}>
				{#if loading}
					<Command.Loading>
						{#if indicator}
							{@render indicator()}
						{:else}
							<div class="flex items-center justify-center py-6">
								<LoaderCircleIcon class="size-4 animate-spin opacity-50" />
							</div>
						{/if}
					</Command.Loading>
				{:else}
					<Command.Empty>
						{#if empty}{@render empty()}{:else}{emptyMessage}{/if}
					</Command.Empty>

					{#each indexed as group, groupIndex (groupIndex)}
						<Command.Group heading={group.label}>
							{#each group.options as entry (entry.index)}
								{@const isSelected = includesValue(values, entry.option.value)}
								<Command.Item
									value={String(entry.index)}
									keywords={keywordsFor(entry.option)}
									disabled={entry.option.disabled}
									data-checked={isSelected ? 'true' : undefined}
									onSelect={() => select(entry.option)}
								>
									{#if optionSnippet}
										{@render optionSnippet({ option: entry.option, selected: isSelected })}
									{:else if entry.option.description}
										<span class="flex min-w-0 flex-col">
											<span class="truncate">{entry.option.label}</span>
											<span class="truncate text-muted-foreground">
												{entry.option.description}
											</span>
										</span>
									{:else}
										{entry.option.label}
									{/if}
								</Command.Item>
							{/each}
						</Command.Group>
					{/each}
				{/if}
			</Command.List>

			{#if footer}
				<div class="border-t p-1">
					{@render footer({ selected, visible, clear, selectAll, close })}
				</div>
			{/if}
		</Command.Root>
	</Popover.Content>
</Popover.Root>

{#if name}
	{#if multiple}
		{#each values as entry (entry)}
			<input type="hidden" {name} value={String(entry)} />
		{/each}
	{:else}
		<input type="hidden" {name} value={value === undefined ? '' : String(value)} />
	{/if}
{/if}
