/**
 * @coral/kit/inline-edit
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import InlineEdit from './inline-edit.svelte';

const trigger = () => document.querySelector<HTMLButtonElement>('button');
const input = () => document.querySelector<HTMLInputElement>('input');

describe('editing', () => {
	it('opens on click with the text selected', async () => {
		await render(InlineEdit, { value: 'Central Office' });

		await userEvent.click(trigger()!);
		await expect.poll(() => document.activeElement).toBe(input());
		expect(input()!.selectionEnd! - input()!.selectionStart!).toBe('Central Office'.length);
	});

	it('saves on Enter and returns focus to the value', async () => {
		const onsave = vi.fn();
		await render(InlineEdit, { value: 'Central Office', onsave });

		await userEvent.click(trigger()!);
		await userEvent.keyboard('South Office{Enter}');

		expect(onsave).toHaveBeenCalledWith('South Office');
		await expect.poll(() => trigger()?.textContent?.trim()).toBe('South Office');
		await expect.poll(() => document.activeElement).toBe(trigger());
	});

	it('cancels on Escape without saving, and keeps the dialog around it open', async () => {
		const onsave = vi.fn();
		const oncancel = vi.fn();
		const outside = vi.fn();
		await render(InlineEdit, { value: 'Central Office', onsave, oncancel });
		document.addEventListener('keydown', outside);

		await userEvent.click(trigger()!);
		await userEvent.keyboard('Something else{Escape}');

		expect(onsave).not.toHaveBeenCalled();
		expect(oncancel).toHaveBeenCalledOnce();
		expect(outside).not.toHaveBeenCalledWith(expect.objectContaining({ key: 'Escape' }));
		await expect.poll(() => trigger()?.textContent?.trim()).toBe('Central Office');
		document.removeEventListener('keydown', outside);
	});

	it('does not call onsave for unchanged text', async () => {
		const onsave = vi.fn();
		await render(InlineEdit, { value: 'Unchanged', onsave });

		await userEvent.click(trigger()!);
		await userEvent.keyboard('{Enter}');
		expect(onsave).not.toHaveBeenCalled();
	});
});

describe('failure', () => {
	it('stays open with the typed text when onsave returns false', async () => {
		await render(InlineEdit, { value: 'Central Office', onsave: async () => false });

		await userEvent.click(trigger()!);
		await userEvent.keyboard('North Office{Enter}');

		await expect.poll(() => input()?.readOnly).toBe(false);
		expect(input()?.value).toBe('North Office');
	});

	it('refuses empty text when required, and marks the field invalid', async () => {
		const onsave = vi.fn();
		await render(InlineEdit, { value: 'Central Office', onsave, required: true });

		await userEvent.click(trigger()!);
		await userEvent.keyboard('{Backspace}{Enter}');

		expect(onsave).not.toHaveBeenCalled();
		expect(input()?.getAttribute('aria-invalid')).toBe('true');
	});
});
