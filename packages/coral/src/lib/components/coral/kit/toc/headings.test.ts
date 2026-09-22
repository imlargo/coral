/**
 * @coral/kit/toc
 * @version 1.1.0
 */

import { describe, expect, it } from 'vitest';
import { pickActive, slug, uniqueId } from './headings.js';

describe('slug', () => {
	it('lowercases and joins words with hyphens', () => {
		expect(slug('Getting started')).toBe('getting-started');
	});

	it('folds accents instead of dropping the letter', () => {
		expect(slug('Deploying to São Paulo')).toBe('deploying-to-sao-paulo');
		expect(slug('Naïve caching')).toBe('naive-caching');
	});

	it('drops punctuation and collapses separators', () => {
		expect(slug('  What Coral adds — really?  ')).toBe('what-coral-adds-really');
	});

	it('falls back rather than returning an empty anchor', () => {
		expect(slug('!?')).toBe('section');
	});
});

describe('uniqueId', () => {
	it('keeps an id nobody has taken', () => {
		expect(uniqueId('props', new Set())).toBe('props');
	});

	it('numbers a repeat, so two "Props" sections do not share an anchor', () => {
		const taken = new Set(['props']);
		expect(uniqueId('props', taken)).toBe('props-2');
		expect(uniqueId('props', new Set(['props', 'props-2']))).toBe('props-3');
	});
});

describe('pickActive', () => {
	// Three headings, at 100, 400 and 900 from the top of the scrolling box.
	const tops = [100, 400, 900];
	const boundary = 80;

	it('is the first heading before anything has been scrolled past', () => {
		expect(pickActive(tops, boundary)).toBe(0);
	});

	it('is the last heading that crossed the boundary', () => {
		// Scrolled so the second heading sits just above the band.
		expect(pickActive([-260, 40, 540], boundary)).toBe(1);
	});

	it('does not jump ahead to a heading still below the band', () => {
		expect(pickActive([-260, 92, 592], boundary)).toBe(0);
	});

	it('allows a pixel of slack, for a heading sitting exactly on the boundary', () => {
		// Sub-pixel layout rounds either way; without the slack the highlight flickers there.
		expect(pickActive([-260, 81, 581], boundary)).toBe(1);
	});

	it('activates a section that fits entirely above the band', () => {
		// A short section: its heading and the next one are both above the boundary.
		expect(pickActive([-500, -60, 300], boundary)).toBe(1);
	});

	it('is the last heading once the page is scrolled to the end', () => {
		expect(pickActive([-900, -600, -100], boundary, true)).toBe(2);
	});

	it('is -1 when there are no headings', () => {
		expect(pickActive([], boundary)).toBe(-1);
	});
});
