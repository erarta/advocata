import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of, tap } from 'rxjs';
import { CacheService } from './cache.service';
import { CACHE_KEY_METADATA } from './decorators/cache-key.decorator';
import { CACHE_TTL_METADATA } from './decorators/cache-ttl.decorator';
import { CACHE_INVALIDATE_METADATA } from './decorators/cache-invalidate.decorator';
import { NO_CACHE_METADATA } from './decorators/no-cache.decorator';
import {
  CacheKeyFunction,
  CacheInvalidateFunction,
} from './interfaces/cache-options.interface';

/**
 * CacheInterceptor
 *
 * Automatically caches GET request responses and invalidates cache on mutations.
 *
 * Features:
 * - Automatic caching for GET requests
 * - Custom cache keys via @CacheKey decorator
 * - Custom TTL via @CacheTTL decorator
 * - Cache invalidation via @CacheInvalidate decorator
 * - Bypass cache with ?nocache=1 query param
 * - Respects @NoCache decorator
 */
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name);

  constructor(
    private readonly cacheService: CacheService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();

    // Check if caching is disabled for this endpoint
    const noCache = this.reflector.get<boolean>(NO_CACHE_METADATA, handler);
    if (noCache) {
      return next.handle();
    }

    // Check for bypass cache query param
    const bypassCache = request.query?.nocache === '1';
    if (bypassCache) {
      this.logger.debug('Cache bypassed via query param');
      return next.handle();
    }

    // Handle cache invalidation for non-GET requests
    if (request.method !== 'GET') {
      return this.handleInvalidation(context, next, handler, request);
    }

    // Handle caching for GET requests
    return this.handleCaching(context, next, handler, request);
  }

  /**
   * Handle caching for GET requests
   */
  private async handleCaching(
    context: ExecutionContext,
    next: CallHandler,
    handler: Function,
    request: any,
  ): Promise<Observable<any>> {
    // Generate cache key
    const cacheKey = this.generateCacheKey(handler, request);
    if (!cacheKey) {
      return next.handle();
    }

    // Try to get from cache
    const cachedResponse = await this.cacheService.get(cacheKey);
    if (cachedResponse !== null) {
      this.logger.debug(`Returning cached response for key: ${cacheKey}`);
      return of(cachedResponse);
    }

    // Get TTL from decorator or use default
    const ttl = this.reflector.get<number>(CACHE_TTL_METADATA, handler);

    // Execute request and cache response
    return next.handle().pipe(
      tap(async (response) => {
        if (response !== null && response !== undefined) {
          await this.cacheService.set(cacheKey, response, ttl);
          this.logger.debug(`Cached response for key: ${cacheKey}`);
        }
      }),
    );
  }

  /**
   * Handle cache invalidation for mutations
   */
  private async handleInvalidation(
    context: ExecutionContext,
    next: CallHandler,
    handler: Function,
    request: any,
  ): Promise<Observable<any>> {
    const invalidatePattern = this.reflector.get<
      string | string[] | CacheInvalidateFunction
    >(CACHE_INVALIDATE_METADATA, handler);

    if (!invalidatePattern) {
      return next.handle();
    }

    // Execute request first
    return next.handle().pipe(
      tap(async () => {
        const patterns = this.resolveInvalidatePatterns(
          invalidatePattern,
          request,
        );

        // Invalidate cache for each pattern
        for (const pattern of patterns) {
          await this.cacheService.delPattern(pattern);
          this.logger.debug(`Invalidated cache pattern: ${pattern}`);
        }
      }),
    );
  }

  /**
   * Generate cache key from request
   */
  private generateCacheKey(handler: Function, request: any): string | null {
    // Get custom cache key from decorator
    const cacheKeyMetadata = this.reflector.get<string | CacheKeyFunction>(
      CACHE_KEY_METADATA,
      handler,
    );

    if (cacheKeyMetadata) {
      if (typeof cacheKeyMetadata === 'function') {
        return cacheKeyMetadata(request);
      }
      return cacheKeyMetadata;
    }

    // Generate default cache key from route
    const route = request.route?.path || request.url;
    const method = request.method;

    // Build key from route + query params
    const baseKey = `${method}:${route}`;

    // Add query params to key if present
    const queryKeys = Object.keys(request.query || {}).filter(
      (key) => key !== 'nocache',
    );

    if (queryKeys.length > 0) {
      const sortedQuery = queryKeys
        .sort()
        .map((key) => `${key}=${request.query[key]}`)
        .join('&');
      return `${baseKey}?${sortedQuery}`;
    }

    // Add params to key
    const params = request.params || {};
    const paramKeys = Object.keys(params);

    if (paramKeys.length > 0) {
      const sortedParams = paramKeys
        .sort()
        .map((key) => params[key])
        .join(':');
      return `${baseKey}:${sortedParams}`;
    }

    return baseKey;
  }

  /**
   * Resolve invalidation patterns from decorator metadata
   */
  private resolveInvalidatePatterns(
    patternOrFunction: string | string[] | CacheInvalidateFunction,
    request: any,
  ): string[] {
    if (typeof patternOrFunction === 'function') {
      const result = patternOrFunction(request);
      return Array.isArray(result) ? result : [result];
    }

    if (Array.isArray(patternOrFunction)) {
      return patternOrFunction;
    }

    return [patternOrFunction];
  }
}
