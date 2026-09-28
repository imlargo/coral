/**
 * @coral/kit/combobox
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import { createRawSnippet } from 'svelte';
import type { ComponentProps } from 'svelte';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import Combobox from './combobox.svelte';
import type { Option } from '../../lib/options.js';

const fruits: Option<number>[] = [
	{ value: 1, label: 'Açaí', keywords: ['berry'] },
	{ value: 2, label: 'Guava', description: 'Tropical' },
	{ value: 3, label: 'Kiwi', disabled: true },
	{ value: 4, label: 'Mango' }
];

/** `render` cannot infer a generic component's parameters, and lands on `unknown`. */
const draw = (props: Record<string, unknown>) =>
	render(Combobox, props as unknown as ComponentProps<typeof Combobox>);

const trigger = () => document.querySelector<HTMLButtonElement>('button[role="combobox"]')!;
const search = () => document.querySelector<HTMLInputElement>('[data-slot="command-input"]')!;
const options = () => Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'));
const labels = () => options().map((option) => option.textContent?.replace(/\s+/g, ' ').trim());
const option = (label: string) => options().find((entry) => entry.textContent?.includes(label))!;
const button = (label: string) =>
	Array.from(document.querySelectorAll('button')).find(
		(entry) => entry.textContent?.trim() === label || entry.getAttribute('aria-label') === label
	) as HTMLButtonElement | undefined;

describe('single', () => {
	it('shows the placeholder until something is picked', async () => {
		await draw({ options: fruits, placeholder: 'Pick a fruit' });
		expect(trigger().textContent?.trim()).toBe('Pick a fruit');
	});

	it('picks an option, reports it, closes and gives focus back to the trigger', async () => {
		const onchange = vi.fn();
		const props = $state({ options: fruits, value: undefined as number | undefined, onchange });
		await draw(props);

		await userEvent.click(trigger());
		await userEvent.click(option('Guava'));

		await expect.poll(() => props.value).toBe(2);
		expect(onchange).toHaveBeenCalledTimes(1);
		expect(onchange.mock.calls[0][0]).toMatchObject({ value: 2, label: 'Guava' });
		await expect.poll(() => trigger().textContent?.trim()).toBe('Guava');
		await expect.poll(() => document.activeElement).toBe(trigger());
		await expect.poll(() => options()).toHaveLength(0);
	});

	it('does not call onchange when the value is assigned from code', async () => {
		const onchange = vi.fn();
		const props = $state({ options: fruits, value: 1 as number | undefined, onchange });
		await draw(props);

		props.value = 4;
		await expect.poll(() => trigger().textContent?.trim()).toBe('Mango');
		expect(onchange).not.toHaveBeenCalled();
	});

	it('cannot pick a disabled option', async () => {
		const props = $state({ options: fruits, value: undefined as number | undefined, open: true });
		await draw(props);

		await userEvent.click(option('Kiwi'), { force: true });
		expect(props.value).toBeUndefined();
	});

	it('keeps the selection when the same option is picked again, unless clearable', async () => {
		const props = $state({ options: fruits, value: 2 as number | undefined, open: true });
		await draw(props);
		await userEvent.click(option('Guava'));
		expect(props.value).toBe(2);
	});

	it('unsets on a second pick when clearable, and reports undefined', async () => {
		const onchange = vi.fn();
		const props = $state({
			options: fruits,
			value: 2 as number | undefined,
			open: true,
			clearable: true,
			onchange
		});
		await draw(props);

		await userEvent.click(option('Guava'));
		await expect.poll(() => props.value).toBeUndefined();
		expect(onchange).toHaveBeenCalledWith(undefined);
	});

	it('clears from the control beside the trigger', async () => {
		const props = $state({ options: fruits, value: 2 as number | undefined, clearable: true });
		await draw(props);

		await userEvent.click(button('Clear selection')!);
		await expect.poll(() => props.value).toBeUndefined();
	});
});

describe('searching', () => {
	it('folds accents and case, so what is typed finds what is shown', async () => {
		await draw({ options: fruits, open: true });
		await userEvent.fill(search(), 'ACAI');
		await expect.poll(labels).toEqual(['Açaí']);
	});

	it('finds an option by its description and by its keywords', async () => {
		await draw({ options: fruits, open: true });

		await userEvent.fill(search(), 'tropical');
		await expect.poll(labels).toEqual(['Guava Tropical']);
		await userEvent.fill(search(), 'berry');
		await expect.poll(labels).toEqual(['Açaí']);
	});

	it('says so when nothing matches, in the page and to a screen reader', async () => {
		await draw({ options: fruits, open: true, emptyMessage: 'Nothing like that.' });
		await userEvent.fill(search(), 'zzz');
		await expect.poll(() => document.body.textContent).toContain('Nothing like that.');
		expect(document.querySelector('[role="status"]')?.textContent?.trim()).toBe(
			'Nothing like that.'
		);
		// An empty listbox is invalid ARIA, so it is hidden rather than left holding only the message.
		expect(document.querySelector<HTMLElement>('[role="listbox"]')?.hidden).toBe(true);
	});

	it('brings the list back when the search matches again', async () => {
		await draw({ options: fruits, open: true });
		await userEvent.fill(search(), 'zzz');
		await expect
			.poll(() => document.querySelector<HTMLElement>('[role="listbox"]')?.hidden)
			.toBe(true);
		await userEvent.fill(search(), 'gua');
		await expect
			.poll(() => document.querySelector<HTMLElement>('[role="listbox"]')?.hidden)
			.toBe(false);
		expect(document.querySelector('[role="status"]')?.textContent?.trim()).toBe('');
	});

	it('takes over matching with a filter of its own', async () => {
		await draw({
			options: fruits,
			open: true,
			filter: (entry: Option<number>, term: string) => entry.value === Number(term)
		});
		await userEvent.fill(search(), '4');
		await expect.poll(labels).toEqual(['Mango']);
	});

	it('leaves the list alone when the server already filtered it', async () => {
		await draw({ options: fruits, open: true, shouldFilter: false });
		await userEvent.fill(search(), 'zzz');
		await new Promise((resolve) => setTimeout(resolve, 30));
		expect(options()).toHaveLength(4);
	});

	it('reports the term after the debounce, and only the last one', async () => {
		const onsearch = vi.fn();
		await draw({ options: fruits, open: true, onsearch, searchDebounce: 200 });

		// Typed one key at a time with a pause a loaded browser can stretch past a short debounce,
		// so the last term is set in one step and the wait is the thing under test.
		await userEvent.fill(search(), 'gua');
		expect(onsearch).not.toHaveBeenCalled();
		await expect.poll(() => onsearch.mock.calls.length).toBe(1);
		expect(onsearch).toHaveBeenCalledWith('gua');
	});

	it('forgets the term when it closes, and tells the server straight away', async () => {
		const onsearch = vi.fn();
		const props = $state({
			options: fruits,
			open: true,
			search: '',
			onsearch,
			searchDebounce: 0
		});
		await draw(props);

		await userEvent.fill(search(), 'gua');
		await expect.poll(() => props.search).toBe('gua');
		onsearch.mockClear();

		props.open = false;
		await expect.poll(() => props.search).toBe('');
		expect(onsearch).toHaveBeenCalledWith('');
	});

	it('forgets the term when the caller closes it, as a footer does', async () => {
		const footer = createRawSnippet<[{ close: () => void }]>((context) => ({
			render: () => '<button data-close>Done</button>',
			setup: (node) => node.addEventListener('click', () => context().close())
		}));
		const props = $state({ options: fruits, open: true, search: '', footer });
		await draw(props);

		await userEvent.fill(search(), 'gua');
		await expect.poll(() => props.search).toBe('gua');
		await userEvent.click(button('Done')!);
		await expect.poll(() => props.search).toBe('');
	});

	it('shows a loading row in place of the list', async () => {
		await draw({ options: fruits, open: true, loading: true });
		expect(options()).toHaveLength(0);
		expect(document.querySelector('[role="progressbar"]')).not.toBeNull();
		expect(document.querySelector<HTMLElement>('[role="listbox"]')?.hidden).toBe(true);
	});
});

describe('multiple', () => {
	it('toggles options, stays open, and reports every selected option in list order', async () => {
		const onchange = vi.fn();
		const props = $state({
			options: fruits,
			type: 'multiple' as const,
			value: [] as number[],
			open: true,
			onchange
		});
		await draw(props);

		await userEvent.click(option('Mango'));
		await userEvent.click(option('Açaí'));
		await expect.poll(() => props.value).toEqual([4, 1]);
		expect(props.open).toBe(true);
		expect(onchange.mock.lastCall![0].map((entry: Option<number>) => entry.value)).toEqual([1, 4]);

		await userEvent.click(option('Mango'));
		await expect.poll(() => props.value).toEqual([1]);
	});

	it('collapses what does not fit into a counter', async () => {
		await draw({
			options: fruits,
			type: 'multiple',
			value: [1, 2, 4],
			maxDisplay: 2
		});
		expect(trigger().textContent).toContain('Açaí');
		expect(trigger().textContent).toContain('Guava');
		expect(trigger().textContent).not.toContain('Mango');
		expect(trigger().textContent).toContain('+1');
	});

	it('offers select all and clear to a footer, and select all skips what is disabled', async () => {
		const footer = createRawSnippet<[{ selectAll: () => void; clear: () => void }]>((context) => ({
			render: () => '<div><button data-all>All</button><button data-none>None</button></div>',
			setup: (node) => {
				node.querySelector('[data-all]')!.addEventListener('click', () => context().selectAll());
				node.querySelector('[data-none]')!.addEventListener('click', () => context().clear());
			}
		}));
		const props = $state({
			options: fruits,
			type: 'multiple' as const,
			value: [] as number[],
			open: true,
			footer
		});
		await draw(props);

		await userEvent.click(button('All')!);
		await expect.poll(() => props.value).toEqual([1, 2, 4]);
		await userEvent.click(button('None')!);
		await expect.poll(() => props.value).toEqual([]);
	});

	it('adds only what the search shows when select all is pressed under a term', async () => {
		const footer = createRawSnippet<[{ selectAll: () => void }]>((context) => ({
			render: () => '<button data-all>All</button>',
			setup: (node) => node.addEventListener('click', () => context().selectAll())
		}));
		const props = $state({
			options: fruits,
			type: 'multiple' as const,
			value: [4] as number[],
			open: true,
			footer
		});
		await draw(props);

		await userEvent.fill(search(), 'gua');
		await expect.poll(labels).toEqual(['Guava Tropical']);
		await userEvent.click(button('All')!);
		await expect.poll(() => props.value).toEqual([2, 4]);
	});
});

describe('in a form', () => {
	const field = (name: string) =>
		Array.from(document.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`));

	it('submits nothing without a name', async () => {
		await draw({ options: fruits, value: 1 });
		expect(document.querySelector('input[name]')).toBeNull();
	});

	it('submits the value, not the internal key', async () => {
		await draw({ options: fruits, value: 4, name: 'fruit' });
		expect(field('fruit').map((entry) => entry.value)).toEqual(['4']);
	});

	it('submits one field per selected value when several are allowed', async () => {
		await draw({ options: fruits, type: 'multiple', value: [1, 4], name: 'fruit' });
		expect(field('fruit').map((entry) => entry.value)).toEqual(['1', '4']);
	});

	it('holds a required form up while nothing is selected', async () => {
		await draw({ options: fruits, type: 'multiple', value: [], name: 'fruit', required: true });
		expect(field('fruit')).toHaveLength(1);
		expect(field('fruit')[0].checkValidity()).toBe(false);
	});

	it('runs the value through serialize', async () => {
		const thing = { id: 7 };
		await draw({
			options: [{ value: thing, label: 'Seven' }],
			value: thing,
			name: 'thing',
			serialize: (entry: { id: number }) => `#${entry.id}`
		});
		expect(field('thing')[0].value).toBe('#7');
	});
});

describe('naming the trigger', () => {
	it('hands the trigger what a field wires through it', async () => {
		await draw({
			options: fruits,
			id: 'fruit-field',
			'aria-label': 'Fruit',
			'aria-describedby': 'fruit-hint',
			'aria-invalid': true
		});
		expect(trigger().id).toBe('fruit-field');
		expect(trigger().getAttribute('aria-label')).toBe('Fruit');
		expect(trigger().getAttribute('aria-describedby')).toBe('fruit-hint');
		expect(trigger().getAttribute('aria-invalid')).toBe('true');
	});

	it('tells a screen reader which option is highlighted, and follows the arrows', async () => {
		await draw({ options: fruits, open: true });
		const active = () => {
			const id = search().getAttribute('aria-activedescendant');
			return id ? document.getElementById(id)?.textContent?.trim() : undefined;
		};

		await expect.poll(active).toBe('Açaí');
		await userEvent.keyboard('{ArrowDown}');
		await expect.poll(active).toBe('Guava Tropical');
		// Kiwi is disabled, so the highlight steps over it.
		await userEvent.keyboard('{ArrowDown}');
		await expect.poll(active).toBe('Mango');
	});

	it('points at nothing while there is no list to point into', async () => {
		await draw({ options: fruits, open: true });
		await userEvent.fill(search(), 'zzz');
		await expect.poll(() => search().hasAttribute('aria-activedescendant')).toBe(false);
	});

	it('dims a disabled option', async () => {
		await draw({ options: fruits, open: true });
		await expect.poll(() => option('Kiwi')).toBeDefined();
		expect(Number(getComputedStyle(option('Kiwi')).opacity)).toBeLessThan(1);
	});

	it('ties the search box to the list it filters', async () => {
		await draw({ options: fruits, open: true });
		const controls = search().getAttribute('aria-controls');
		expect(controls).toBeTruthy();
		expect(document.getElementById(controls!)?.getAttribute('role')).toBe('listbox');
	});
});
