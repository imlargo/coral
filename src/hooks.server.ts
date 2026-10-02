import type { HandleServerError } from '@sveltejs/kit/hooks';
import { logger } from '#docs/core/logger.js';

export const handleError: HandleServerError = ({ kind, error }) => {
	// App and framework errors (a 404 among them) already carry a status and a safe message, and
	// say more about crawlers than about the app.
	if (kind !== 'unknown') return;
	return { message: logger.error('server', error) };
};
