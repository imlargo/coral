/**
 * @coral/kit/segmented-progress
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import SegmentedProgress from './segmented-progress.svelte';

const root = () => document.querySelector<HTMLElement>('[role="progressbar"], [role="meter"]')!;
const states = () => [...root().children].map((segment) => segment.getAttribute('data-state'));

describe('progress', () => {
	it('is a progressbar that says which step of how many', async () => {
		await render(SegmentedProgress, { count: 4, value: 2, 'aria-label': 'Onboarding' });
		expect(root().getAttribute('role')).toBe('progressbar');
		expect(root().getAttribute('aria-valuenow')).toBe('2');
		expect(root().getAttribute('aria-valuemin')).toBe('0');
		expect(root().getAttribute('aria-valuemax')).toBe('4');
		expect(root().getAttribute('aria-valuetext')).toBe('Step 2 of 4');
		expect(states()).toEqual(['complete', 'current', 'upcoming', 'upcoming']);
	});

	it('draws the current step wider than the rest', async () => {
		await render(SegmentedProgress, { count: 3, value: 2 });
		const [done, current] = [...root().children].map((segment) => getComputedStyle(segment));
		expect(Number(current.flexGrow)).toBeGreaterThan(Number(done.flexGrow));
	});

	it('follows the value as it changes', async () => {
		const props = $state({ count: 3, value: 1 });
		await render(SegmentedProgress, props);

		props.value = 3;
		await expect.poll(states).toEqual(['complete', 'complete', 'current']);
		expect(root().getAttribute('aria-valuetext')).toBe('Step 3 of 3');
	});

	it('holds a value past the end to the last step', async () => {
		await render(SegmentedProgress, { count: 3, value: 7 });
		expect(root().getAttribute('aria-valuenow')).toBe('3');
		expect(states()).toEqual(['complete', 'complete', 'current']);
	});
});

describe('meter', () => {
	it('is a meter whose segments are lit to its level, none set apart', async () => {
		await render(SegmentedProgress, { type: 'meter', count: 4, value: 3 });
		expect(root().getAttribute('role')).toBe('meter');
		expect(root().getAttribute('aria-valuetext')).toBe('3 of 4');
		expect(states()).toEqual(['filled', 'filled', 'filled', 'empty']);
	});

	it('speaks the words a caller gives its levels', async () => {
		const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
		await render(SegmentedProgress, {
			type: 'meter',
			count: 4,
			value: 4,
			valueText: (value: number) => labels[value]
		});
		expect(root().getAttribute('aria-valuetext')).toBe('Strong');
	});
});

it('lets a caller word the reading on the root itself', async () => {
	await render(SegmentedProgress, { count: 5, value: 1, 'aria-valuetext': 'Profile, step 1 of 5' });
	expect(root().getAttribute('aria-valuetext')).toBe('Profile, step 1 of 5');
});
