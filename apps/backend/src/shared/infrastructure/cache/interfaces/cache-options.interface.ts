/**
 * Cache Configuration Options
 */
export interface CacheOptions {
  /**
   * Time to live in seconds
   */
  ttl?: number;

  /**
   * Cache key prefix
   */
  prefix?: string;

  /**
   * Whether to bypass cache
   */
  bypassCache?: boolean;
}

/**
 * Cache Key Function
 * Used to generate dynamic cache keys based on request
 */
export type CacheKeyFunction = (request: any) => string;

/**
 * Cache Invalidation Pattern Function
 * Used to generate cache invalidation patterns based on request
 */
export type CacheInvalidateFunction = (request: any) => string | string[];

/**
 * Cache Statistics
 */
export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalKeys: number;
  memoryUsage: number;
  mostAccessedKeys: Array<{ key: string; count: number }>;
}

/**
 * Cache Entry Metadata
 */
export interface CacheEntryMetadata {
  key: string;
  ttl: number;
  createdAt: Date;
  expiresAt: Date;
}
