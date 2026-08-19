/**
 * @coral/kit/file-input
 * @version 1.0.0
 */

/**
 * Whether a file answers an `accept` attribute - `image/*,.pdf,video/mp4` and friends.
 *
 * An empty `accept` takes anything. Extension entries are compared against the file name, wildcard
 * and exact entries against its MIME type.
 *
 * The MIME type is the part that cannot be trusted. Browsers report an empty `file.type` for plenty
 * of ordinary files - `.mov`, `.avi`, `.m4v`, `.mkv`, notably on Windows, installed PWAs and iOS -
 * so a check that only reads `file.type` turns away files the user can plainly see are videos. Two
 * projects in the corpus shipped that bug; one later forked its copy to patch it, with a hardcoded
 * table of video and image extensions that its sibling never received.
 *
 * The rule here needs no table. A file the browser refuses to type can only be judged by its
 * extension: hold it to the extension entries when the caller listed any, and let it through when
 * they did not, because then there is no evidence to convict it with. The server is the real gate
 * either way.
 */
export function matchesAccept(file: File, accept: string): boolean {
	const entries = accept
		.split(',')
		.map((entry) => entry.trim().toLowerCase())
		.filter(Boolean);
	if (entries.length === 0) return true;
	if (entries.includes('*/*')) return true;

	const name = file.name.toLowerCase();
	const type = file.type.toLowerCase();
	const extensions = entries.filter((entry) => entry.startsWith('.'));

	if (extensions.some((extension) => name.endsWith(extension))) return true;

	if (type === '') return extensions.length === 0;

	return entries.some((entry) => {
		if (entry.startsWith('.')) return false;
		// `video/*` becomes the prefix `video/`.
		if (entry.endsWith('/*')) return type.startsWith(entry.slice(0, -1));
		return entry === type;
	});
}

/**
 * A short, language-free summary of what the zone accepts - `PDF, JPG`.
 *
 * Extensions and wildcard categories both reduce to a bare word, so nothing here needs translating.
 * Returns an empty string when `accept` is empty, which is the caller's cue to render nothing.
 */
export function describeAccept(accept: string): string {
	const words = accept
		.split(',')
		.map((entry) => entry.trim())
		.filter(Boolean)
		.map((entry) => {
			if (entry.startsWith('.')) return entry.slice(1);
			if (entry.endsWith('/*')) return entry.slice(0, -2);
			// `image/svg+xml` is known by its subtype, not by `image`.
			return entry.split('/').pop() ?? entry;
		})
		.map((word) => word.toUpperCase());

	return [...new Set(words)].join(', ');
}
