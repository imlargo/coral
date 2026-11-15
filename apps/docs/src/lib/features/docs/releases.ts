import type { ReleaseBadge } from '#lib/features/docs/types.js';

/** How long after its changelog line a component keeps its badge. */
const RECENT_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

const DAY = /^## (\d{4}-\d{2}-\d{2})\s*$/;
/** `` - `kit/combobox` 1.3.0: new. ... `` - the name, then whether the line opens with `new.`. */
const ENTRY = /^- `([a-z]+(?:\/[a-z-]+)+)` \d+\.\d+\.\d+: (new\.)?/;

export interface ReleaseSummary {
	/** The newest day in the changelog, as written there. */
	latest?: string;
	/** Badge per manifest name, for the components the changelog touched lately. */
	badges: Record<string, ReleaseBadge>;
}

/**
 * Reads the changelog the way a returning reader skims it: which day is newest, and which
 * components arrived or changed in the month before it. Measured from the newest entry rather than
 * from today, so a build of the same content always draws the same badges.
 */
export function summarizeReleases(changelog: string): ReleaseSummary {
	const badges: Record<string, ReleaseBadge> = {};
	let latest: string | undefined;
	let day: string | undefined;

	for (const line of changelog.split('\n')) {
		const heading = DAY.exec(line);
		if (heading) {
			day = heading[1];
			latest ??= day;
			continue;
		}
		const entry = ENTRY.exec(line);
		if (!entry || !day || !latest) continue;
		if (Date.parse(latest) - Date.parse(day) > RECENT_DAYS * DAY_MS) break;

		const [, name, isNew] = entry;
		if (isNew) badges[name] = 'New';
		else badges[name] ??= 'Updated';
	}

	return { latest, badges };
}
