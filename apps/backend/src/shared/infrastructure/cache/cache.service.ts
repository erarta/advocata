import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { CacheOptions, CacheStats } from './interfaces/cache-options.interface';

/**
 * CacheService
 *
 * Provides centralized Redis caching functionality with:
 * - Automatic JSON serialization/deserialization
 * - Key prefixing for namespacing
 * - TTL management
 * - Cache statistics
 * - Error handling with fallbacks
 */
@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly redis: Redis;
  private readonly defaultTtl: number;
  private readonly keyPrefix: string;
  private readonly enabled: boolean;

  // Statistics tracking
  private stats = {
    hits: 0,
    misses: 0,
    keyAccessCount: new Map<string, number>(),
  };

  constructor(private readonly configService: ConfigService) {
    this.enabled = this.configService.get('CACHE_ENABLE', 'true') === 'true';
    this.defaultTtl = parseInt(
      this.configService.get('CACHE_TTL_DEFAULT', '300'),
    );
    this.keyPrefix = this.configService.get('CACHE_KEY_PREFIX', 'advocata');

    if (this.enabled) {
      this.redis = new Redis({
        host: this.configService.get('REDIS_HOST', 'localhost'),
        port: parseInt(this.configService.get('REDIS_PORT', '6379')),
        password: this.configService.get('REDIS_PASSWORD'),
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
      });

      this.redis.on('error', (error) => {
        this.logger.error(`Redis connection error: ${error.message}`);
      });

      this.redis.on('connect', () => {
        this.logger.log('Redis cache connected successfully');
      });
    } else {
      this.logger.warn('Cache is disabled');
    }
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit();
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    if (!this.enabled || options?.bypassCache) {
      return null;
    }

    try {
      const fullKey = this.buildKey(key, options?.prefix);
      const value = await this.redis.get(fullKey);

      if (value) {
        this.trackHit(fullKey);
        this.logger.debug(`Cache HIT: ${fullKey}`);
        return JSON.parse(value) as T;
      }

      this.trackMiss(fullKey);
      this.logger.debug(`Cache MISS: ${fullKey}`);
      return null;
    } catch (error) {
      this.logger.error(`Cache GET error for key ${key}: ${error.message}`);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(
    key: string,
    value: any,
    ttl?: number,
    options?: CacheOptions,
  ): Promise<void> {
    if (!this.enabled || options?.bypassCache) {
      return;
    }

    try {
      const fullKey = this.buildKey(key, options?.prefix);
      const serializedValue = JSON.stringify(value);
      const effectiveTtl = ttl || options?.ttl || this.defaultTtl;

      await this.redis.setex(fullKey, effectiveTtl, serializedValue);
      this.logger.debug(`Cache SET: ${fullKey} (TTL: ${effectiveTtl}s)`);
    } catch (error) {
      this.logger.error(`Cache SET error for key ${key}: ${error.message}`);
    }
  }

  /**
   * Delete specific key from cache
   */
  async del(key: string, options?: CacheOptions): Promise<void> {
    if (!this.enabled) {
      return;
    }

    try {
      const fullKey = this.buildKey(key, options?.prefix);
      await this.redis.del(fullKey);
      this.logger.debug(`Cache DELETE: ${fullKey}`);
    } catch (error) {
      this.logger.error(`Cache DELETE error for key ${key}: ${error.message}`);
    }
  }

  /**
   * Delete keys matching pattern
   * Example: delPattern('lawyer:*') deletes all lawyer-related keys
   */
  async delPattern(pattern: string, options?: CacheOptions): Promise<void> {
    if (!this.enabled) {
      return;
    }

    try {
      const fullPattern = this.buildKey(pattern, options?.prefix);
      const keys = await this.redis.keys(fullPattern);

      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.logger.debug(
          `Cache DELETE PATTERN: ${fullPattern} (${keys.length} keys)`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Cache DELETE PATTERN error for pattern ${pattern}: ${error.message}`,
      );
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string, options?: CacheOptions): Promise<boolean> {
    if (!this.enabled) {
      return false;
    }

    try {
      const fullKey = this.buildKey(key, options?.prefix);
      const exists = await this.redis.exists(fullKey);
      return exists === 1;
    } catch (error) {
      this.logger.error(`Cache EXISTS error for key ${key}: ${error.message}`);
      return false;
    }
  }

  /**
   * Get remaining TTL for key (in seconds)
   * Returns -1 if key doesn't exist
   * Returns -2 if key has no expiration
   */
  async ttl(key: string, options?: CacheOptions): Promise<number> {
    if (!this.enabled) {
      return -1;
    }

    try {
      const fullKey = this.buildKey(key, options?.prefix);
      return await this.redis.ttl(fullKey);
    } catch (error) {
      this.logger.error(`Cache TTL error for key ${key}: ${error.message}`);
      return -1;
    }
  }

  /**
   * Increment numeric value
   */
  async increment(key: string, options?: CacheOptions): Promise<number> {
    if (!this.enabled) {
      return 0;
    }

    try {
      const fullKey = this.buildKey(key, options?.prefix);
      return await this.redis.incr(fullKey);
    } catch (error) {
      this.logger.error(`Cache INCR error for key ${key}: ${error.message}`);
      return 0;
    }
  }

  /**
   * Decrement numeric value
   */
  async decrement(key: string, options?: CacheOptions): Promise<number> {
    if (!this.enabled) {
      return 0;
    }

    try {
      const fullKey = this.buildKey(key, options?.prefix);
      return await this.redis.decr(fullKey);
    } catch (error) {
      this.logger.error(`Cache DECR error for key ${key}: ${error.message}`);
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

    // Get top 10 most accessed keys
    const mostAccessedKeys = Array.from(this.stats.keyAccessCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([key, count]) => ({ key, count }));

    let totalKeys = 0;
    let memoryUsage = 0;

    if (this.enabled) {
      try {
        totalKeys = await this.redis.dbsize();
        const info = await this.redis.info('memory');
        const memoryMatch = info.match(/used_memory:(\d+)/);
        if (memoryMatch) {
          memoryUsage = parseInt(memoryMatch[1]);
        }
      } catch (error) {
        this.logger.error(`Error getting cache stats: ${error.message}`);
      }
    }

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: parseFloat(hitRate.toFixed(2)),
      totalKeys,
      memoryUsage,
      mostAccessedKeys,
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      keyAccessCount: new Map<string, number>(),
    };
    this.logger.log('Cache statistics reset');
  }

  /**
   * Clear all cache keys matching prefix
   */
  async clear(): Promise<void> {
    if (!this.enabled) {
      return;
    }

    try {
      const pattern = `${this.keyPrefix}:*`;
      const keys = await this.redis.keys(pattern);

      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.logger.log(`Cache cleared: ${keys.length} keys deleted`);
      }
    } catch (error) {
      this.logger.error(`Cache CLEAR error: ${error.message}`);
    }
  }

  /**
   * Build full cache key with prefix
   */
  private buildKey(key: string, prefix?: string): string {
    const effectivePrefix = prefix || this.keyPrefix;
    return `${effectivePrefix}:${key}`;
  }

  /**
   * Track cache hit
   */
  private trackHit(key: string): void {
    this.stats.hits++;
    const count = this.stats.keyAccessCount.get(key) || 0;
    this.stats.keyAccessCount.set(key, count + 1);
  }

  /**
   * Track cache miss
   */
  private trackMiss(key: string): void {
    this.stats.misses++;
  }

  /**
   * Check if cache is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}
