import type { HandleClientError } from '@sveltejs/kit';
import { logger } from '$docs/core/logger.js';

export const handleError: HandleClientError = ({ error, status }) => {
	if (status === 404) return { message: 'Not found.' };
	return { message: logger.error('client', error) };
};
