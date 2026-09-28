/**
 * @coral/kit/tags-input
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import TagsInput from './tags-input.svelte';

const field = () => document.querySelector<HTMLInputElement>('input:not([type="hidden"])')!;
const tags = () =>
	Array.from(document.querySelectorAll('[data-coral-tag]')).map((entry) =>
		entry.closest('[data-slot="badge"]')?.textContent?.trim()
	);
const removers = () => Array.from(document.querySelectorAll<HTMLButtonElement>('[data-coral-tag]'));

describe('adding', () => {
	it('turns typed text into a tag on Enter, and empties the field', async () => {
		const onchange = vi.fn();
		const props = $state({ value: [] as string[], onchange });
		await render(TagsInput, props);

		await userEvent.type(field(), 'design{Enter}');
		expect(props.value).toEqual(['design']);
		expect(field().value).toBe('');
		expect(onchange).toHaveBeenCalledWith(['design']);
	});

	it('turns the delimiter into a tag as it is typed', async () => {
		const props = $state({ value: [] as string[] });
		await render(TagsInput, props);

		await userEvent.type(field(), 'design,web');
		expect(props.value).toEqual(['design']);
		expect(field().value).toBe('web');
	});

	it('splits what is pasted by the same rule, leaving the tail in the field', async () => {
		const props = $state({ value: [] as string[] });
		await render(TagsInput, props);

		await userEvent.fill(field(), 'red, blue, gre');
		expect(props.value).toEqual(['red', 'blue']);
		expect(field().value.trim()).toBe('gre');
	});

	/** A real paste, which is the only way a line break reaches a single-line field intact. */
	function paste(text: string) {
		const data = new DataTransfer();
		data.setData('text', text);
		const event = new ClipboardEvent('paste', {
			clipboardData: data,
			bubbles: true,
			cancelable: true
		});
		field().dispatchEvent(event);
		return event;
	}

	it('splits a column pasted from a spreadsheet, whatever the delimiter', async () => {
		const props = $state({ value: [] as string[], delimiter: ';' });
		await render(TagsInput, props);

		field().focus();
		const event = paste('one\ntwo;three\r\nfour');
		expect(event.defaultPrevented).toBe(true);
		expect(props.value).toEqual(['one', 'two', 'three']);
		expect(field().value).toBe('four');
	});

	it('pastes over the selection, and leaves text without a line break to the browser', async () => {
		const props = $state({ value: [] as string[] });
		await render(TagsInput, props);

		field().focus();
		expect(paste('one, two').defaultPrevented).toBe(false);
		expect(props.value).toEqual([]);

		await userEvent.type(field(), 'abcdef');
		field().setSelectionRange(1, 3);
		paste('X\nY\n');
		expect(props.value).toEqual(['aX', 'Y']);
		expect(field().value).toBe('def');
	});

	it('lets the caller handle a paste first', async () => {
		const onpaste = vi.fn((event: ClipboardEvent) => event.preventDefault());
		const props = $state({ value: [] as string[], onpaste });
		await render(TagsInput, props);

		field().focus();
		paste('one\ntwo');
		expect(onpaste).toHaveBeenCalledTimes(1);
		expect(props.value).toEqual([]);
	});

	it('adds what is left in the field when it loses focus', async () => {
		const props = $state({ value: [] as string[] });
		await render(TagsInput, props);

		await userEvent.type(field(), 'design');
		await userEvent.tab();
		expect(props.value).toEqual(['design']);
	});

	it('drops it instead when told not to add on blur', async () => {
		const props = $state({ value: [] as string[], addOnBlur: false });
		await render(TagsInput, props);

		await userEvent.type(field(), 'design');
		await userEvent.tab();
		expect(props.value).toEqual([]);
	});

	it('leaves Enter to the form when there is nothing to add', async () => {
		await render(TagsInput, { value: [] });
		field().focus();
		const press = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
		field().dispatchEvent(press);
		expect(press.defaultPrevented).toBe(false);
	});

	it('does not call onchange for a list assigned from code', async () => {
		const onchange = vi.fn();
		const props = $state({ value: [] as string[], onchange });
		await render(TagsInput, props);

		props.value = ['a', 'b'];
		await expect.poll(tags).toEqual(['a', 'b']);
		expect(onchange).not.toHaveBeenCalled();
	});
});

describe('turning a tag away', () => {
	it('says why, once per batch, and keeps rejected text in the field', async () => {
		const onreject = vi.fn();
		const props = $state({ value: ['red'] as string[], onreject });
		await render(TagsInput, props);

		await userEvent.fill(field(), 'red,blue,red,');
		expect(props.value).toEqual(['red', 'blue']);
		expect(onreject).toHaveBeenCalledTimes(1);
		expect(onreject).toHaveBeenCalledWith([
			{ value: 'red', reason: 'duplicate' },
			{ value: 'red', reason: 'duplicate' }
		]);
	});

	it('holds a maximum, and reports what did not fit', async () => {
		const onreject = vi.fn();
		const props = $state({ value: [] as string[], max: 2, onreject });
		await render(TagsInput, props);

		await userEvent.fill(field(), 'a,b,c,d,');
		expect(props.value).toEqual(['a', 'b']);
		expect(onreject.mock.calls[0][0].map((entry: { reason: string }) => entry.reason)).toEqual([
			'max',
			'max'
		]);
	});

	it('runs a validator, and keeps a refused entry in the field to be fixed', async () => {
		const onreject = vi.fn();
		const props = $state({
			value: [] as string[],
			validate: (entry: string) => entry.length > 2,
			onreject
		});
		await render(TagsInput, props);

		await userEvent.type(field(), 'ab{Enter}');
		expect(props.value).toEqual([]);
		expect(field().value).toBe('ab');
		expect(onreject).toHaveBeenCalledWith([{ value: 'ab', reason: 'invalid' }]);
	});

	it('cleans a value before it is judged, the same way for typing and pasting', async () => {
		const props = $state({
			value: [] as string[],
			sanitize: (entry: string) => entry.trim().replace(/^#/, '').toLowerCase()
		});
		await render(TagsInput, props);

		await userEvent.fill(field(), '#Design, #WEB,');
		expect(props.value).toEqual(['design', 'web']);
	});

	it('allows repeats when asked to', async () => {
		const props = $state({ value: [] as string[], allowDuplicates: true });
		await render(TagsInput, props);

		await userEvent.fill(field(), 'a,a,');
		expect(props.value).toEqual(['a', 'a']);
	});
});

describe('removing', () => {
	it('removes with the button, and names each after its tag', async () => {
		const props = $state({ value: ['red', 'blue'] as string[] });
		await render(TagsInput, props);

		expect(removers().map((entry) => entry.getAttribute('aria-label'))).toEqual([
			'Remove red',
			'Remove blue'
		]);
		await userEvent.click(removers()[0]);
		expect(props.value).toEqual(['blue']);
	});

	it('walks back onto the tags from an empty field, and deletes one with Backspace', async () => {
		const props = $state({ value: ['red', 'blue'] as string[] });
		await render(TagsInput, props);

		field().focus();
		await userEvent.keyboard('{Backspace}');
		expect(document.activeElement).toBe(removers()[1]);
		await userEvent.keyboard('{Backspace}');
		expect(props.value).toEqual(['red']);
		// Focus moved to what is left rather than falling to the page.
		await expect.poll(() => document.activeElement).toBe(removers()[0]);
	});

	it('returns to the field when the last tag is deleted', async () => {
		const props = $state({ value: ['red'] as string[] });
		await render(TagsInput, props);

		removers()[0].focus();
		await userEvent.keyboard('{Delete}');
		expect(props.value).toEqual([]);
		await expect.poll(() => document.activeElement).toBe(field());
	});

	it('moves along the tags with the arrows, and off the end into the field', async () => {
		await render(TagsInput, { value: ['red', 'blue'] });

		removers()[0].focus();
		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(removers()[1]);
		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(field());
	});

	it('sends a printable key from a tag back into the field', async () => {
		await render(TagsInput, { value: ['red'] });

		removers()[0].focus();
		await userEvent.keyboard('x');
		expect(document.activeElement).toBe(field());
		expect(field().value).toBe('x');
	});

	it('empties the list from the clear control, when there is one', async () => {
		const props = $state({ value: ['red', 'blue'] as string[], clearable: true });
		await render(TagsInput, props);

		await userEvent.click(document.querySelector('button[aria-label="Clear all"]')!);
		expect(props.value).toEqual([]);
		expect(document.activeElement).toBe(field());
	});
});

describe('read only and disabled', () => {
	it('shows the tags without offering to change them', async () => {
		const props = $state({ value: ['red'] as string[], readonly: true });
		await render(TagsInput, props);

		expect(tags()).toEqual([]);
		expect(removers()).toHaveLength(0);
		expect(document.body.textContent).toContain('red');
	});
});

describe('in a form', () => {
	const hidden = () =>
		Array.from(document.querySelectorAll<HTMLInputElement>('input[type="hidden"]')).map((entry) => [
			entry.name,
			entry.value
		]);

	it('submits one field per tag, under the name', async () => {
		await render(TagsInput, { value: ['red', 'blue'], name: 'colors' });
		expect(hidden()).toEqual([
			['colors', 'red'],
			['colors', 'blue']
		]);
	});

	it('never puts the name on the visible field, which holds what is not a tag yet', async () => {
		await render(TagsInput, { value: [], name: 'colors' });
		expect(field().name).toBe('');
	});

	it('asks for a tag only while there is none', async () => {
		const props = $state({ value: [] as string[], required: true });
		await render(TagsInput, props);
		expect(field().required).toBe(true);

		props.value = ['red'];
		await expect.poll(() => field().required).toBe(false);
	});
});
