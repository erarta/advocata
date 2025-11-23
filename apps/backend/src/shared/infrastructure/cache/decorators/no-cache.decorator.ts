import { SetMetadata } from '@nestjs/common';

export const NO_CACHE_METADATA = 'cache:no-cache';

/**
 * NoCache Decorator
 *
 * Disables caching for a specific endpoint.
 * Useful for endpoints that should never be cached (e.g., real-time data, user-specific data).
 *
 * @example
 * @Get('active')
 * @NoCache()
 * async getActiveConsultation() {
 *   // This will never be cached
 * }
 */
export const NoCache = () => SetMetadata(NO_CACHE_METADATA, true);
