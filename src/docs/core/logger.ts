/**
 * The single exit point for logs. To ship Sentry or structured logging, write a
 * class that implements `Logger` and reassign `logger` — nothing else in the
 * codebase changes.
 */

const DEFAULT_MESSAGE = 'An unexpected error occurred.';

/** Extracts a message safe to show a user from whatever was thrown. */
function toMessage(error: unknown): string {
	if (error instanceof Error) return error.message.trim() || DEFAULT_MESSAGE;
	if (typeof error === 'string') return error.trim() || DEFAULT_MESSAGE;
	return DEFAULT_MESSAGE;
}

export interface Logger {
	/** Logs `error` under `scope` and returns the message that is safe to show a user. */
	error(scope: string, error: unknown): string;
}

class ConsoleLogger implements Logger {
	error(scope: string, error: unknown): string {
		console.error(`[${scope}]`, error);
		return toMessage(error);
	}
}

export let logger: Logger = new ConsoleLogger();

/** Swaps the active implementation — e.g. for a SentryLogger, or a no-op one in tests. */
export function setLogger(impl: Logger): void {
	logger = impl;
}
