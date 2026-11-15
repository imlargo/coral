const DAY = /^## (\d{4}-\d{2}-\d{2})\s*$/m;

export interface ReleaseSummary {
	/** The newest day in the changelog, as written there. */
	latest?: string;
}

/** The newest day in the changelog: the first date heading, since days are written newest first. */
export function summarizeReleases(changelog: string): ReleaseSummary {
	return { latest: DAY.exec(changelog)?.[1] };
}
