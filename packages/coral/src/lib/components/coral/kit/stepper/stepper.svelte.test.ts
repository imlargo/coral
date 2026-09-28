/**
 * @coral/kit/stepper
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import StepperHarness from './stepper-harness.test.svelte';

const steps = ['account', 'plan', 'review'];

const triggers = () =>
	Array.from(document.querySelectorAll<HTMLButtonElement>('[data-coral-step]'));
const trigger = (index: number) => triggers()[index];
const panel = () => document.querySelector<HTMLElement>('[role="region"]:not([hidden])');
const next = () =>
	Array.from(document.querySelectorAll('button')).find((b) =>
		/^(Next|Finish)$/.test(b.textContent?.trim() ?? '')
	) as HTMLButtonElement;
const previous = () =>
	Array.from(document.querySelectorAll('button')).find(
		(b) => b.textContent?.trim() === 'Previous'
	) as HTMLButtonElement;

/**
 * State is declared in a variable first: `$state` is only valid as an initialiser. The bindable
 * keys are spelled out even when empty - a component writes a bound prop back only to a key the
 * object already has.
 */
function harness(extra: Record<string, unknown> = {}) {
	const props = $state<Record<string, unknown>>({
		steps,
		value: undefined,
		completed: [],
		...extra
	});
	return props;
}

describe('moving on', () => {
	it('starts on the first step and marks it current', async () => {
		await render(StepperHarness, harness());
		expect(trigger(0).getAttribute('aria-current')).toBe('step');
		expect(trigger(1).hasAttribute('aria-current')).toBe(false);
		expect(panel()?.textContent).toContain('account');
	});

	it('goes to the next step, completes the one it left, and reports it', async () => {
		const onvaluechange = vi.fn();
		const props = harness({ onvaluechange });
		await render(StepperHarness, props);

		await userEvent.click(next());
		await expect.poll(() => props.value).toBe('plan');
		expect(props.completed).toEqual(['account']);
		expect(onvaluechange).toHaveBeenCalledWith('plan');
		expect(trigger(0).closest('li')?.dataset.state).toBe('complete');
	});

	it('moves focus to the panel that appeared', async () => {
		await render(StepperHarness, harness());
		await userEvent.click(next());
		await expect.poll(() => document.activeElement).toBe(panel());
	});

	it('goes back without validating', async () => {
		const onbeforenext = vi.fn();
		const props = harness({ onbeforenext, value: 'plan', completed: ['account'] });
		await render(StepperHarness, props);

		await userEvent.click(previous());
		await expect.poll(() => props.value).toBe('account');
		expect(onbeforenext).not.toHaveBeenCalled();
	});

	it('cannot go back from the first step', async () => {
		await render(StepperHarness, harness());
		expect(previous().disabled).toBe(true);
	});
});

describe('validation', () => {
	it('waits on onbeforenext, and shows it is busy', async () => {
		let release!: () => void;
		const onbeforenext = vi.fn(() => new Promise<void>((resolve) => (release = resolve)));
		const props = harness({ onbeforenext });
		await render(StepperHarness, props);

		await userEvent.click(next());
		await expect.poll(() => next().getAttribute('aria-busy')).toBe('true');
		expect(props.value).toBeUndefined();
		// A press while busy is dropped, not queued.
		next().click();
		expect(onbeforenext).toHaveBeenCalledTimes(1);

		release();
		await expect.poll(() => props.value).toBe('plan');
	});

	it('stays put when onbeforenext returns exactly false', async () => {
		const props = harness({ onbeforenext: () => false });
		await render(StepperHarness, props);

		await userEvent.click(next());
		await new Promise((resolve) => setTimeout(resolve, 30));
		expect(props.value).toBeUndefined();
		expect(props.completed ?? []).toEqual([]);
	});

	it('stays put and reports it when onbeforenext throws', async () => {
		const failure = new Error('taken');
		const onerror = vi.fn();
		const props = harness({
			onbeforenext: () => {
				throw failure;
			},
			onerror
		});
		await render(StepperHarness, props);

		await userEvent.click(next());
		await expect.poll(() => onerror.mock.calls.length).toBe(1);
		expect(onerror).toHaveBeenCalledWith(failure);
		expect(props.value).toBeUndefined();
	});

	it('runs onfinish on the last step, and offers Finish instead of Next', async () => {
		const onfinish = vi.fn();
		const props = harness({ onfinish, value: 'review', completed: ['account', 'plan'] });
		await render(StepperHarness, props);

		expect(next().textContent?.trim()).toBe('Finish');
		await userEvent.click(next());
		await expect.poll(() => onfinish.mock.calls.length).toBe(1);
		expect(props.completed).toEqual(['account', 'plan', 'review']);
	});

	it('stays on the last step when onfinish fails', async () => {
		const props = harness({
			onfinish: () => false,
			value: 'review',
			completed: ['account', 'plan']
		});
		await render(StepperHarness, props);

		await userEvent.click(next());
		await new Promise((resolve) => setTimeout(resolve, 30));
		expect(props.completed).toEqual(['account', 'plan']);
	});
});

describe('jumping', () => {
	it('cannot jump past a step that is not complete', async () => {
		await render(StepperHarness, harness());
		expect(trigger(2).disabled).toBe(true);
		expect(trigger(1).disabled).toBe(true);
	});

	it('can return to a later step in one click after going back', async () => {
		const props = harness({ value: 'account', completed: ['account', 'plan'] });
		await render(StepperHarness, props);

		expect(trigger(2).disabled).toBe(false);
		await userEvent.click(trigger(2));
		await expect.poll(() => props.value).toBe('review');
	});

	it('jumps anywhere when it is not linear', async () => {
		await render(StepperHarness, harness({ linear: false }));
		expect(trigger(2).disabled).toBe(false);
	});

	it('labels the panel by the step that owns it', async () => {
		await render(StepperHarness, harness());
		expect(panel()?.getAttribute('aria-labelledby')).toBe(trigger(0).id);
	});
});

describe('keeping panels', () => {
	it('keeps an inactive panel mounted and hidden when asked', async () => {
		await render(StepperHarness, harness({ keepMounted: true }));
		expect(document.querySelectorAll('[role="region"]')).toHaveLength(3);
		expect(document.querySelectorAll('[role="region"][hidden]')).toHaveLength(2);
	});

	it('leaves the others out of the page otherwise', async () => {
		await render(StepperHarness, harness());
		expect(document.querySelectorAll('[role="region"]')).toHaveLength(1);
	});
});

describe('the keyboard', () => {
	it('walks the step buttons with the arrows, and to the ends with Home and End', async () => {
		await render(StepperHarness, harness({ linear: false }));

		trigger(0).focus();
		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(trigger(1));
		await userEvent.keyboard('{End}');
		expect(document.activeElement).toBe(trigger(2));
		await userEvent.keyboard('{Home}');
		expect(document.activeElement).toBe(trigger(0));
	});
});

describe('wording', () => {
	it('takes the button labels as props', async () => {
		await render(StepperHarness, harness({ nextLabel: 'Weiter', previousLabel: 'Zurück' }));
		expect(
			Array.from(document.querySelectorAll('button')).map((button) => button.textContent?.trim())
		).toEqual(expect.arrayContaining(['Weiter', 'Zurück']));
	});

	it('takes the last step label as a prop too', async () => {
		await render(
			StepperHarness,
			harness({ finishLabel: 'Fertig', value: 'review', completed: ['account', 'plan'] })
		);
		expect(
			Array.from(document.querySelectorAll('button')).some(
				(b) => b.textContent?.trim() === 'Fertig'
			)
		).toBe(true);
	});
});
