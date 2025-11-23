import { SetMetadata } from '@nestjs/common';
import { CacheKeyFunction } from '../interfaces/cache-options.interface';

export const CACHE_KEY_METADATA = 'cache:key';

/**
 * CacheKey Decorator
 *
 * Defines custom cache key for an endpoint.
 * Can be a string or a function that generates the key from the request.
 *
 * @example
 * // Static key
 * @CacheKey('lawyers:all')
 *
 * // Dynamic key based on request params
 * @CacheKey((req) => `lawyer:${req.params.id}`)
 *
 * // Dynamic key based on query params
 * @CacheKey((req) => `lawyers:search:${JSON.stringify(req.query)}`)
 */
export const CacheKey = (keyOrFunction: string | CacheKeyFunction) =>
  SetMetadata(CACHE_KEY_METADATA, keyOrFunction);
