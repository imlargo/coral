/**
 * @coral/kit/textarea
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import Textarea from './textarea.svelte';

const field = () => document.querySelector<HTMLTextAreaElement>('textarea')!;
const height = () => Math.round(field().getBoundingClientRect().height);

/** Types into the field and lets the resize settle. */
async function type(text: string) {
	await userEvent.fill(field(), text);
	await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
}

describe('growing', () => {
	it('starts at its minimum and grows with the text', async () => {
		await render(Textarea, { rows: 2 });
		const start = height();

		await type('one\ntwo\nthree\nfour');
		expect(height()).toBeGreaterThan(start);
	});

	it('shrinks again when the text goes', async () => {
		await render(Textarea, { rows: 2 });
		const start = height();

		await type('one\ntwo\nthree\nfour');
		await type('one');
		expect(height()).toBe(start);
	});

	it('stops at maxRows and scrolls from there', async () => {
		await render(Textarea, { rows: 1, maxRows: 3 });

		await type('one\ntwo\nthree\nfour\nfive\nsix');
		const capped = height();

		await type('one\ntwo\nthree\nfour\nfive\nsix\nseven\neight');
		expect(height()).toBe(capped);
		// The state, not the computed style: this suite runs without the theme's CSS, so asking the
		// browser about `overflow` would be asking about a stylesheet that is not there.
		expect(field().dataset.scrollable).toBe('true');
	});

	it('does not scroll while the text still fits', async () => {
		await render(Textarea, { rows: 1, maxRows: 5 });
		await type('one\ntwo');
		expect(field().dataset.scrollable).toBeUndefined();
	});

	it('grows for text set from code, not only for typing', async () => {
		const props = $state({ rows: 1, value: 'one' });
		await render(Textarea, props);
		const start = height();

		props.value = 'one\ntwo\nthree\nfour';
		await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
		expect(height()).toBeGreaterThan(start);
	});
});

describe('the counter', () => {
	it('counts what the browser counts, so the two agree at the limit', async () => {
		await render(Textarea, { maxLength: 10, showCount: true, value: '🚀' });
		// One emoji is two UTF-16 units, and `maxlength` spends two on it.
		await expect.poll(() => document.body.textContent).toContain('2/10');
		expect(field().maxLength).toBe(10);
	});

	it('warns near the limit, and describes the field', async () => {
		await render(Textarea, { maxLength: 10, showCount: true, warnAt: 3 });
		const counted = () => document.querySelector('[data-warning]');

		await type('hello');
		expect(counted()).toBeNull();

		await type('helloworld');
		await expect.poll(counted).not.toBeNull();
		expect(field().getAttribute('aria-describedby')).toBe(
			document.querySelector('[id$="-count"]')?.id
		);
	});

	it('draws no counter without a limit to count against', async () => {
		await render(Textarea, { showCount: true });
		expect(document.querySelector('[id$="-count"]')).toBeNull();
	});
});

describe('submitting', () => {
	it('sends on Enter in chat mode, and Shift-Enter writes a newline', async () => {
		const onsubmit = vi.fn();
		await render(Textarea, { submitOn: 'enter', onsubmit, value: 'ship it' });

		field().focus();
		await userEvent.keyboard('{Shift>}{Enter}{/Shift}');
		expect(onsubmit).not.toHaveBeenCalled();

		await userEvent.keyboard('{Enter}');
		expect(onsubmit).toHaveBeenCalledOnce();
	});

	it('sends on Ctrl-Enter in form mode, and plain Enter is a newline', async () => {
		const onsubmit = vi.fn();
		await render(Textarea, { submitOn: 'mod-enter', onsubmit, value: 'ship it' });

		field().focus();
		await userEvent.keyboard('{Enter}');
		expect(onsubmit).not.toHaveBeenCalled();

		await userEvent.keyboard('{Control>}{Enter}{/Control}');
		expect(onsubmit).toHaveBeenCalledOnce();
		// The plain Enter above wrote a newline, which is exactly what it was supposed to do.
		expect(onsubmit.mock.calls[0][0]).toContain('ship it');
	});

	it('leaves an empty field to do what Enter normally does', async () => {
		const onsubmit = vi.fn();
		await render(Textarea, { submitOn: 'enter', onsubmit, value: '   ' });

		field().focus();
		await userEvent.keyboard('{Enter}');
		expect(onsubmit).not.toHaveBeenCalled();
	});

	it('sends nothing at all when nothing asked it to', async () => {
		const onsubmit = vi.fn();
		await render(Textarea, { onsubmit, value: 'ship it' });

		field().focus();
		await userEvent.keyboard('{Enter}');
		expect(onsubmit).not.toHaveBeenCalled();
	});
});
