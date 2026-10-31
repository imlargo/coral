/**
 * @coral/kit/phone-input
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import type { CountryCode } from 'libphonenumber-js';
import PhoneInput from './phone-input.svelte';

const field = () => document.querySelector<HTMLInputElement>('input[type="tel"]')!;
const picker = () => document.querySelector<HTMLButtonElement>('[data-slot="input-group"] button')!;
const option = (label: string) =>
	Array.from(document.querySelectorAll<HTMLElement>('[role="option"]')).find((entry) =>
		entry.textContent?.includes(label)
	)!;

describe('typing', () => {
	it('formats as it is typed and binds the number in E.164', async () => {
		const onchange = vi.fn();
		const props = $state({
			country: 'US' as CountryCode,
			value: undefined as string | undefined,
			onchange
		});
		await render(PhoneInput, props);

		await userEvent.type(field(), '4155550123');

		expect(field().value).toBe('(415) 555-0123');
		expect(props.value).toBe('+14155550123');
		expect(onchange).toHaveBeenLastCalledWith('+14155550123');
	});

	it('keeps the caret after the digit just typed, even mid-number', async () => {
		await render(PhoneInput, { country: 'US' });

		await userEvent.type(field(), '415555012');
		field().setSelectionRange(1, 1);
		await userEvent.keyboard('9');

		expect(field().value).toBe('(941) 555-5012');
		expect(field().selectionStart).toBe(2);
	});

	it('deletes the digit behind a formatting character rather than getting stuck on it', async () => {
		const props = $state({
			country: 'US' as CountryCode,
			value: '+14155550123' as string | undefined
		});
		await render(PhoneInput, props);

		field().focus();
		// Right after `(415) `: backspace would only remove the space the formatter writes back.
		field().setSelectionRange(6, 6);
		await userEvent.keyboard('{Backspace}');

		expect(props.value).toBe('+1415550123');
	});

	it('follows the country a pasted or autofilled international number names', async () => {
		const props = $state({
			country: 'US' as CountryCode | undefined,
			value: undefined as string | undefined
		});
		await render(PhoneInput, props);

		await userEvent.fill(field(), '+44 20 7946 0958');

		expect(props.value).toBe('+442079460958');
		expect(props.country).toBe('GB');
		expect(picker().textContent).toContain('+44');
	});
});

describe('a value from code', () => {
	it('is shown nationally under the country it belongs to, without calling onchange', async () => {
		const onchange = vi.fn();
		const props = $state({ value: '+442079460958' as string | undefined, onchange });
		await render(PhoneInput, props);

		expect(field().value).toBe('020 7946 0958');
		expect(picker().textContent).toContain('+44');

		props.value = '+4930123456';
		await expect.poll(() => field().value).toBe('030 123456');
		expect(onchange).not.toHaveBeenCalled();
	});
});

describe('picking a country', () => {
	it('keeps the digits typed, and moves on to the number once the list closes', async () => {
		const props = $state({ country: 'US' as CountryCode, value: undefined as string | undefined });
		await render(PhoneInput, props);

		await userEvent.type(field(), '2079460958');
		await userEvent.click(picker());
		await userEvent.fill(
			document.querySelector<HTMLInputElement>('[data-slot="command-input"]')!,
			'+44'
		);
		await userEvent.click(option('United Kingdom'));

		await expect.poll(() => props.value).toBe('+442079460958');
		expect(props.country).toBe('GB');
		await expect.poll(() => document.activeElement).toBe(field());
	});
});

describe('in a form', () => {
	it('submits E.164 under its name, not the formatted text', async () => {
		await render(PhoneInput, { country: 'US', value: '+14155550123', name: 'phone' });

		const submitted = document.querySelector<HTMLInputElement>('input[name="phone"]')!;
		expect(submitted.value).toBe('+14155550123');
		expect(field().name).toBe('');
	});

	it('holds a submit up while the number is incomplete, with its message', async () => {
		const props = $state({ country: 'US' as CountryCode, value: '+1415' as string | undefined });
		await render(PhoneInput, { ...props, invalidMessage: 'Too short.' });

		expect(field().validationMessage).toBe('Too short.');
	});

	it('leaves an empty field to required', async () => {
		await render(PhoneInput, { country: 'US' });
		expect(field().validity.valid).toBe(true);
	});
});
