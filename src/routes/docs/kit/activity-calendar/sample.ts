/** Deterministic sample activity, so a prerendered docs page renders the same grid every build. */

import type { ActivityDay } from '$lib/coral/kit/activity-calendar/types.js';

function random(seed: number): () => number {
	let state = seed;
	return () => {
		state = (state + 0x6d2b79f5) | 0;
		let value = Math.imul(state ^ (state >>> 15), 1 | state);
		value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
		return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
	};
}

/** A year of long-tailed activity - quiet weekends, a couple of heavy days, a dead fortnight. */
export function sample(seed = 7): ActivityDay[] {
	const next = random(seed);
	const days: ActivityDay[] = [];

	for (let day = 0; day < 365; day++) {
		const date = new Date(2025, 8, 1 + day, 12);
		const weekend = date.getDay() === 0 || date.getDay() === 6;
		const roll = next();

		let count = 0;
		if (day > 120 && day < 135) count = 0;
		else if (roll > (weekend ? 0.75 : 0.35)) count = Math.ceil(next() ** 3 * 24);

		days.push({
			date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
			count
		});
	}

	return days;
}

export const START = '2025-09-01';
export const END = '2026-08-31';
