/**
 * @coral/kit/responsive-dialog
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import Harness from './responsive-dialog-harness.test.svelte';
import ResponsiveDialogTitle from './responsive-dialog-title.svelte';

/** Two queries that always and never match, so the test does not depend on the window's size. */
const WIDE = '(min-width: 1px)';
const NARROW = '(min-width: 100000px)';

const dialog = () => document.querySelector('[data-slot="dialog-content"]');
const drawer = () => document.querySelector('[data-slot="drawer-content"]');
const button = (label: string) =>
	Array.from(document.querySelectorAll('button')).find(
		(entry) => entry.textContent?.trim() === label
	) as HTMLButtonElement | undefined;

function draw(extra: Record<string, unknown> = {}) {
	const props = $state({ open: false, draft: '', query: WIDE, ...extra });
	return props;
}

describe('which primitive it draws', () => {
	it('draws a dialog where the query matches', async () => {
		await render(Harness, draw({ open: true, query: WIDE }));
		await expect.poll(dialog).not.toBeNull();
		expect(drawer()).toBeNull();
	});

	it('draws a drawer where it does not', async () => {
		await render(Harness, draw({ open: true, query: NARROW }));
		await expect.poll(drawer).not.toBeNull();
		expect(dialog()).toBeNull();
	});

	it('draws the drawer on the server, until the page can measure, when told to assume so', async () => {
		await render(Harness, draw({ open: true, query: NARROW, fallback: true }));
		await expect.poll(drawer).not.toBeNull();
	});
});

describe('opening and closing', () => {
	it('opens from its trigger, whichever primitive it is', async () => {
		for (const query of [WIDE, NARROW]) {
			const props = draw({ query });
			const view = await render(Harness, props);

			await userEvent.click(button('Invite')!);
			await expect.poll(() => props.open).toBe(true);
			await expect.poll(() => document.body.textContent).toContain('Invite a teammate');
			view.unmount();
		}
	});

	it('closes from its close control', async () => {
		const props = draw({ open: true });
		await render(Harness, props);
		await expect.poll(dialog).not.toBeNull();

		await userEvent.click(button('Cancel')!);
		await expect.poll(() => props.open).toBe(false);
	});

	it('closes on Escape', async () => {
		const props = draw({ open: true });
		await render(Harness, props);
		await expect.poll(dialog).not.toBeNull();

		await userEvent.keyboard('{Escape}');
		await expect.poll(() => props.open).toBe(false);
	});

	it('reports the change to onOpenChange', async () => {
		const seen: boolean[] = [];
		const props = draw({ open: true, onOpenChange: (next: boolean) => seen.push(next) });
		await render(Harness, props);
		await expect.poll(dialog).not.toBeNull();

		await userEvent.keyboard('{Escape}');
		await expect.poll(() => seen).toEqual([false]);
	});
});

describe('crossing the breakpoint', () => {
	it('stays open, and swaps the primitive under the reader', async () => {
		const props = draw({ open: true, query: WIDE });
		await render(Harness, props);
		await expect.poll(dialog).not.toBeNull();

		props.query = NARROW;
		await expect.poll(drawer).not.toBeNull();
		expect(dialog()).toBeNull();
		expect(props.open).toBe(true);
		expect(document.body.textContent).toContain('Invite a teammate');
	});

	it('keeps what was typed, which lives in the caller and not in the primitive', async () => {
		const props = draw({ open: true, query: WIDE });
		await render(Harness, props);
		await expect.poll(dialog).not.toBeNull();

		await userEvent.fill(
			document.querySelector<HTMLInputElement>('input[aria-label="Email"]')!,
			'amara@example.com'
		);
		props.query = NARROW;
		await expect.poll(drawer).not.toBeNull();
		await expect
			.poll(() => document.querySelector<HTMLInputElement>('input[aria-label="Email"]')?.value)
			.toBe('amara@example.com');
	});
});

describe('the pieces', () => {
	it('name the dialog and describe it, for both primitives', async () => {
		for (const query of [WIDE, NARROW]) {
			const view = await render(Harness, draw({ open: true, query }));
			await expect.poll(() => dialog() ?? drawer()).not.toBeNull();
			const content = (dialog() ?? drawer())!;

			expect(content.getAttribute('aria-labelledby')).toBeTruthy();
			expect(document.getElementById(content.getAttribute('aria-labelledby')!)?.textContent).toBe(
				'Invite a teammate'
			);
			view.unmount();
		}
	});

	it('refuse to render outside the root, and say what to do', async () => {
		expect(() => render(ResponsiveDialogTitle, {})).toThrow(/outside <ResponsiveDialog>/);
	});
});
