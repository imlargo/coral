/**
 * @coral/kit/follow-scroll
 * @version 1.0.0
 */

import { describe, expect, it } from 'vitest';
import { distanceFromEnd, isAtEnd, isScrollable, unreadSince } from './follow.js';

/** A 400px box holding 1000px of content: 600px of scrolling. */
const box = { clientHeight: 400, scrollHeight: 1_000 };

describe('distanceFromEnd', () => {
	it('is zero at the end and grows on the way up', () => {
		expect(distanceFromEnd({ ...box, scrollTop: 600 })).toBe(0);
		expect(distanceFromEnd({ ...box, scrollTop: 400 })).toBe(200);
	});

	it('never goes negative, for the overscroll a trackpad produces', () => {
		expect(distanceFromEnd({ ...box, scrollTop: 900 })).toBe(0);
	});
});

describe('isAtEnd', () => {
	it('holds within the threshold, where a smooth scroll and a zoomed page land', () => {
		expect(isAtEnd({ ...box, scrollTop: 600 })).toBe(true);
		expect(isAtEnd({ ...box, scrollTop: 590 })).toBe(true);
	});

	it('lets go once the reader has actually scrolled back', () => {
		expect(isAtEnd({ ...box, scrollTop: 500 })).toBe(false);
	});

	it('takes the threshold it is given', () => {
		expect(isAtEnd({ ...box, scrollTop: 500 }, 200)).toBe(true);
		expect(isAtEnd({ ...box, scrollTop: 599 }, 0)).toBe(false);
	});

	it('is true for content that does not fill its box', () => {
		expect(isAtEnd({ scrollTop: 0, clientHeight: 400, scrollHeight: 100 })).toBe(true);
	});
});

describe('isScrollable', () => {
	it('tells a full box from an empty one', () => {
		expect(isScrollable({ ...box, scrollTop: 0 })).toBe(true);
		expect(isScrollable({ scrollTop: 0, clientHeight: 400, scrollHeight: 120 })).toBe(false);
	});
});

describe('unreadSince', () => {
	it('counts what arrived after following stopped', () => {
		expect(unreadSince(12, 5)).toBe(7);
	});

	it('is zero when nothing has arrived', () => {
		expect(unreadSince(5, 5)).toBe(0);
	});

	it('does not report a trimmed list as news', () => {
		// A log capped at the last N lines can be shorter than it was.
		expect(unreadSince(3, 10)).toBe(0);
	});
});
