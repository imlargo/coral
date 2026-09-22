/**
 * @coral/kit/password-input
 * @version 1.0.1
 */

import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import PasswordInput from './password-input.svelte';

const field = () => document.querySelector<HTMLInputElement>('input')!;
const toggle = () => document.querySelector<HTMLButtonElement>('button[aria-pressed]')!;

describe('visibility', () => {
	it('toggles the type and reports the state on the toggle', async () => {
		await render(PasswordInput, {});

		expect(field().type).toBe('password');
		await userEvent.click(toggle());
		expect(field().type).toBe('text');
		expect(toggle().getAttribute('aria-pressed')).toBe('true');
	});

	it('keeps the caret where it was', async () => {
		await render(PasswordInput, { value: 'secreto' });

		field().focus();
		field().setSelectionRange(3, 3);
		await userEvent.click(toggle());

		expect([field().selectionStart, field().selectionEnd]).toEqual([3, 3]);
	});

	it('is a password field again by the time its form submits', async () => {
		const form = document.createElement('form');
		document.body.appendChild(form);
		let typeAtSubmit = '';
		form.addEventListener('submit', (event) => {
			event.preventDefault();
			typeAtSubmit = field().type;
		});

		await render(PasswordInput, { visible: true, value: 'secreto' }, { baseElement: form });
		expect(field().type).toBe('text');

		form.requestSubmit();
		expect(typeAtSubmit).toBe('password');
		form.remove();
	});
});
