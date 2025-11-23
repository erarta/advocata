import { SetMetadata } from '@nestjs/common';
import { CacheInvalidateFunction } from '../interfaces/cache-options.interface';

export const CACHE_INVALIDATE_METADATA = 'cache:invalidate';

/**
 * CacheInvalidate Decorator
 *
 * Defines cache invalidation pattern(s) for an endpoint.
 * When the endpoint is called, matching cache keys will be deleted.
 * Useful for POST, PUT, PATCH, DELETE operations that modify data.
 *
 * @param patternOrFunction - Cache key pattern(s) to invalidate, or function to generate patterns
 *
 * @example
 * // Single pattern
 * @CacheInvalidate('lawyers:*')
 *
 * // Multiple patterns
 * @CacheInvalidate(['lawyer:123', 'lawyers:search:*'])
 *
 * // Dynamic pattern based on request
 * @CacheInvalidate((req) => `lawyer:${req.params.id}`)
 *
 * // Multiple dynamic patterns
 * @CacheInvalidate((req) => [
 *   `lawyer:${req.params.id}`,
 *   'lawyers:search:*',
 *   'lawyers:all'
 * ])
 */
export const CacheInvalidate = (
  patternOrFunction: string | string[] | CacheInvalidateFunction,
) => SetMetadata(CACHE_INVALIDATE_METADATA, patternOrFunction);
