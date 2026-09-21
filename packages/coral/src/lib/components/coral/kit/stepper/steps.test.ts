/**
 * @coral/kit/stepper
 * @version 1.0.0
 */

import { describe, expect, it } from 'vitest';
import { adjacent, canVisit, complete, stateOf } from './steps.js';

const steps = ['cuenta', 'perfil', 'pago', 'resumen'] as const;
type Step = (typeof steps)[number];

describe('stateOf', () => {
	it('reads the current step as current, even once completed', () => {
		expect(stateOf<Step>('perfil', 'perfil', ['cuenta', 'perfil'])).toBe('current');
	});

	it('reads the rest as complete or upcoming', () => {
		expect(stateOf<Step>('cuenta', 'perfil', ['cuenta'])).toBe('complete');
		expect(stateOf<Step>('pago', 'perfil', ['cuenta'])).toBe('upcoming');
	});
});

describe('canVisit', () => {
	const base = { steps, linear: true };

	it('always allows going back', () => {
		expect(canVisit<Step>('cuenta', { ...base, current: 'pago', completed: [] })).toBe(true);
	});

	it('refuses skipping ahead past an incomplete step', () => {
		expect(canVisit<Step>('pago', { ...base, current: 'cuenta', completed: ['cuenta'] })).toBe(
			false
		);
	});

	it('allows a step once everything before it is complete', () => {
		expect(
			canVisit<Step>('pago', { ...base, current: 'cuenta', completed: ['cuenta', 'perfil'] })
		).toBe(true);
	});

	it('lets the reader return to a later step after going back', () => {
		const completed: Step[] = ['cuenta', 'perfil', 'pago'];
		expect(canVisit<Step>('resumen', { ...base, current: 'cuenta', completed })).toBe(true);
	});

	it('allows anything when not linear', () => {
		expect(
			canVisit<Step>('resumen', { steps, linear: false, current: 'cuenta', completed: [] })
		).toBe(true);
	});

	it('refuses a step that is not in the list', () => {
		expect(
			canVisit('otro' as Step, { steps, linear: false, current: 'cuenta', completed: [] })
		).toBe(false);
	});
});

describe('adjacent', () => {
	it('steps either way', () => {
		expect(adjacent(steps, 'perfil', 1)).toBe('pago');
		expect(adjacent(steps, 'perfil', -1)).toBe('cuenta');
	});

	it('is undefined past either end', () => {
		expect(adjacent(steps, 'resumen', 1)).toBeUndefined();
		expect(adjacent(steps, 'cuenta', -1)).toBeUndefined();
	});
});

describe('complete', () => {
	it('adds a step once', () => {
		const once = complete<Step>([], 'cuenta');
		expect(once).toEqual(['cuenta']);
		expect(complete(once, 'cuenta')).toBe(once);
	});

	it('works for object steps by identity', () => {
		const first = { id: 1 };
		const second = { id: 1 };
		expect(complete([first], second)).toEqual([first, second]);
	});
});
