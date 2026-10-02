/**
 * @coral/lib/announce
 * @version 1.0.0
 */

import { describe, expect, it } from 'vitest';
import { Announcer } from './announce.svelte.js';

/** What a screen reader reads out: the marker that forces a repeat is silent. */
const spoken = (message: string) => message.replaceAll('​', '');

describe('Announcer', () => {
	it('starts empty, so nothing is left for a later change to read back', () => {
		expect(new Announcer().message).toBe('');
	});

	it('says what it is given', () => {
		const announcer = new Announcer();
		announcer.say('Copied');
		expect(announcer.message).toBe('Copied');
		expect(announcer.text).toBe('Copied');
	});

	it('changes the region for a repeat, without changing the words', () => {
		const announcer = new Announcer();
		announcer.say('Moved to position 5 of 5');
		const first = announcer.message;

		announcer.say('Moved to position 5 of 5');
		expect(announcer.message).not.toBe(first);
		expect(spoken(announcer.message)).toBe('Moved to position 5 of 5');
	});

	it('keeps alternating, so a third and fourth repeat are heard too', () => {
		const announcer = new Announcer();
		const seen = new Set<string>();
		for (let press = 0; press < 4; press++) {
			announcer.say('Copied');
			seen.add(announcer.message);
		}
		// Two forms, alternating: each `say` leaves the region holding something new.
		expect(seen.size).toBe(2);
	});

	it('leaves a different message alone - it already changed', () => {
		const announcer = new Announcer();
		announcer.say('Copied');
		announcer.say('Copy failed');
		expect(announcer.message).toBe('Copy failed');
	});

	it('does not mark an empty message as a repeat', () => {
		const announcer = new Announcer();
		announcer.say('');
		announcer.say('');
		expect(announcer.message).toBe('');
	});

	it('clears, and says the same words afterwards as if they were new', () => {
		const announcer = new Announcer();
		announcer.say('Copied');
		announcer.clear();
		expect(announcer.message).toBe('');

		announcer.say('Copied');
		expect(announcer.message).toBe('Copied');
	});
});
