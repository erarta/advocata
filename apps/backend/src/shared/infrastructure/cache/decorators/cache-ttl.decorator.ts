import { SetMetadata } from '@nestjs/common';

export const CACHE_TTL_METADATA = 'cache:ttl';

/**
 * CacheTTL Decorator
 *
 * Defines custom time-to-live (TTL) for cached endpoint response.
 * TTL is specified in seconds.
 *
 * @param ttl - Time to live in seconds
 *
 * @example
 * // Cache for 5 minutes
 * @CacheTTL(300)
 *
 * // Cache for 1 hour
 * @CacheTTL(3600)
 *
 * // Cache for 1 day
 * @CacheTTL(86400)
 */
export const CacheTTL = (ttl: number) => SetMetadata(CACHE_TTL_METADATA, ttl);
