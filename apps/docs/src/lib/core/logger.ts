/** The single exit point for logs. For Sentry or JSON, implement `Logger` and call `setLogger`. */

/** Searchable detail for a log line. */
type LogContext = Record<string, unknown>;

/** The docs site raises no errors meant for a reader, so whatever reaches the log is a bug. */
const UNEXPECTED_MESSAGE = 'An unexpected error occurred.';

export interface Logger {
	/** Logs the error and returns the message that is safe to show. */
	error(scope: string, error: unknown, context?: LogContext): string;
}

class ConsoleLogger implements Logger {
	error(scope: string, error: unknown, context?: LogContext): string {
		console.error(`[${scope}]`, error, ...(context ? [context] : []));
		return UNEXPECTED_MESSAGE;
	}
}

export let logger: Logger = new ConsoleLogger();

export function setLogger(impl: Logger): void {
	logger = impl;
}
