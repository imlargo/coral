/**
 * @coral/kit/file-input
 * @version 1.0.0
 */

import { describe, expect, it } from 'vitest';
import { describeAccept, matchesAccept } from './accept.js';

const file = (name: string, type = ''): File => new File(['x'], name, { type });

describe('matchesAccept', () => {
	it('takes anything when accept is empty', () => {
		expect(matchesAccept(file('a.exe', 'application/x-msdownload'), '')).toBe(true);
		expect(matchesAccept(file('a.exe'), '   ')).toBe(true);
	});

	it('matches an exact mime type', () => {
		expect(matchesAccept(file('a.pdf', 'application/pdf'), 'application/pdf')).toBe(true);
		expect(matchesAccept(file('a.png', 'image/png'), 'application/pdf')).toBe(false);
	});

	it('matches a wildcard category', () => {
		expect(matchesAccept(file('a.png', 'image/png'), 'image/*')).toBe(true);
		expect(matchesAccept(file('a.mp4', 'video/mp4'), 'image/*')).toBe(false);
	});

	it('matches an extension entry, which a mime-only check would ignore', () => {
		expect(matchesAccept(file('report.PDF', 'application/pdf'), '.pdf')).toBe(true);
		expect(matchesAccept(file('report.pdf', 'application/pdf'), '.docx')).toBe(false);
	});

	it('accepts */* outright', () => {
		expect(matchesAccept(file('a.bin'), '*/*')).toBe(true);
	});

	it('reads any one of several entries', () => {
		expect(matchesAccept(file('a.pdf', 'application/pdf'), 'image/*, .pdf')).toBe(true);
	});

	// The bug one project shipped, the other forked to patch, and the patch never travelled back.
	describe('when the browser reports no mime type', () => {
		it('lets the file through if only mime entries were listed', () => {
			expect(matchesAccept(file('clip.mov'), 'video/*')).toBe(true);
			expect(matchesAccept(file('clip.mkv'), 'video/mp4,video/webm')).toBe(true);
		});

		it('holds it to the extensions when the caller listed any', () => {
			expect(matchesAccept(file('clip.mov'), '.mov,video/mp4')).toBe(true);
			expect(matchesAccept(file('clip.mov'), '.pdf,image/*')).toBe(false);
		});
	});
});

describe('describeAccept', () => {
	it('reduces every entry to a bare word', () => {
		expect(describeAccept('.pdf,image/*,video/mp4')).toBe('PDF, IMAGE, MP4');
	});

	it('names a compound subtype by its subtype', () => {
		expect(describeAccept('image/svg+xml')).toBe('SVG+XML');
	});

	it('collapses duplicates', () => {
		expect(describeAccept('.pdf,application/pdf')).toBe('PDF');
	});

	it('returns nothing for an empty accept', () => {
		expect(describeAccept('')).toBe('');
	});
});
