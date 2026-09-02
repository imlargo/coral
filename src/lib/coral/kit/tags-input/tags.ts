/**
 * @coral/kit/tags-input
 * @version 1.0.0
 */

/** Why a tag was turned away. */
export type RejectionReason = 'invalid' | 'duplicate' | 'max';

export type TagRejection = {
	value: string;
	reason: RejectionReason;
};

/**
 * A single-line field cannot hold a newline, so a newline is always a separator - however exotic
 * the delimiter is. That is what makes a column pasted out of a spreadsheet arrive as tags rather
 * than as one tag with line breaks in it.
 */
const NEWLINES = /\r\n|\r|\n/;

/**
 * Cuts a run of text into the tags it describes.
 *
 * One function for typing and for pasting: the delimiter separates tags wherever the text came
 * from. Splitting only on paste - which is what a `addOnPaste` switch buys - means the same string
 * becomes two tags or one depending on how it got into the field.
 *
 * An empty string delimiter would cut between every character, so it is read as "no delimiter" and
 * only newlines separate.
 */
export function split(raw: string, delimiter: string | RegExp = ','): string[] {
	const lines = raw.split(NEWLINES);
	if (delimiter === '') return lines;
	return lines.flatMap((line) => line.split(delimiter));
}

export type AddOptions = {
	/** What is already held. */
	current: string[];
	/** Cleans a value before it is judged. Defaults to trimming. */
	sanitize?: (raw: string) => string;
	/** Return `false` to turn a value away. Receives the list as it stands at that point. */
	validate?: (value: string, tags: string[]) => boolean;
	/** Whether the same value may be held twice. */
	allowDuplicates?: boolean;
	/** How many tags may be held in total. Omitted means unbounded. */
	max?: number;
};

/**
 * Works out what the list should be after some values arrive, and what got turned away.
 *
 * Values arrive from three places - a delimiter key, a paste, a field losing focus - and all three
 * funnel through here, so the rules cannot drift between them.
 *
 * The checks run per value against the list *as it grows*, not against the list that came in: that
 * is what makes pasting `a, a` add one tag, and what makes the last value of an oversized paste
 * report `max` instead of being counted against a length that never changed.
 *
 * When nothing gets through, `current` is returned by identity rather than rebuilt - which is what
 * lets the caller tell "nothing changed" from "changed to the same thing", and keeps a rejected
 * entry from clearing the field it was typed in.
 */
export function add(
	incoming: string[],
	{ current, sanitize = (raw) => raw.trim(), validate, allowDuplicates = false, max }: AddOptions
): { tags: string[]; rejected: TagRejection[] } {
	const tags = [...current];
	const rejected: TagRejection[] = [];
	let changed = false;

	for (const raw of incoming) {
		const value = sanitize(raw);

		// Nothing was typed. Not a rejection: pressing the delimiter twice is a slip, not an error
		// worth reporting to the caller.
		if (value === '') continue;

		if (validate && !validate(value, tags)) {
			rejected.push({ value, reason: 'invalid' });
			continue;
		}

		// Checked before `max`, so a value that is already in the list is reported as the duplicate
		// it is even when the list happens to be full.
		if (!allowDuplicates && tags.includes(value)) {
			rejected.push({ value, reason: 'duplicate' });
			continue;
		}

		if (max !== undefined && tags.length >= max) {
			rejected.push({ value, reason: 'max' });
			continue;
		}

		tags.push(value);
		changed = true;
	}

	return { tags: changed ? tags : current, rejected };
}
