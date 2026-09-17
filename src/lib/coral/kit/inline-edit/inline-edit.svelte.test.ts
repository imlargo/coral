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
		await render(InlineEdit, { value: 'Obra Centro' });

		await userEvent.click(trigger()!);
		await expect.poll(() => document.activeElement).toBe(input());
		expect(input()!.selectionEnd! - input()!.selectionStart!).toBe('Obra Centro'.length);
	});

	it('saves on Enter and returns focus to the value', async () => {
		const onsave = vi.fn();
		await render(InlineEdit, { value: 'Obra Centro', onsave });

		await userEvent.click(trigger()!);
		await userEvent.keyboard('Obra Sur{Enter}');

		expect(onsave).toHaveBeenCalledWith('Obra Sur');
		await expect.poll(() => trigger()?.textContent?.trim()).toBe('Obra Sur');
		await expect.poll(() => document.activeElement).toBe(trigger());
	});

	it('cancels on Escape without saving, and keeps the dialog around it open', async () => {
		const onsave = vi.fn();
		const oncancel = vi.fn();
		const outside = vi.fn();
		await render(InlineEdit, { value: 'Obra Centro', onsave, oncancel });
		document.addEventListener('keydown', outside);

		await userEvent.click(trigger()!);
		await userEvent.keyboard('Algo más{Escape}');

		expect(onsave).not.toHaveBeenCalled();
		expect(oncancel).toHaveBeenCalledOnce();
		expect(outside).not.toHaveBeenCalledWith(expect.objectContaining({ key: 'Escape' }));
		await expect.poll(() => trigger()?.textContent?.trim()).toBe('Obra Centro');
		document.removeEventListener('keydown', outside);
	});

	it('does not call onsave for unchanged text', async () => {
		const onsave = vi.fn();
		await render(InlineEdit, { value: 'Igual', onsave });

		await userEvent.click(trigger()!);
		await userEvent.keyboard('{Enter}');
		expect(onsave).not.toHaveBeenCalled();
	});
});

describe('failure', () => {
	it('stays open with the typed text when onsave returns false', async () => {
		await render(InlineEdit, { value: 'Obra Centro', onsave: async () => false });

		await userEvent.click(trigger()!);
		await userEvent.keyboard('Obra Norte{Enter}');

		await expect.poll(() => input()?.readOnly).toBe(false);
		expect(input()?.value).toBe('Obra Norte');
	});

	it('refuses empty text when required, and marks the field invalid', async () => {
		const onsave = vi.fn();
		await render(InlineEdit, { value: 'Obra Centro', onsave, required: true });

		await userEvent.click(trigger()!);
		await userEvent.keyboard('{Backspace}{Enter}');

		expect(onsave).not.toHaveBeenCalled();
		expect(input()?.getAttribute('aria-invalid')).toBe('true');
	});
});
