import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheService } from './cache.service';
import { CacheInterceptor } from './cache.interceptor';
import { CacheWarmingService } from './cache-warming.service';

/**
 * CacheModule
 *
 * Global module providing caching functionality across the application.
 *
 * Features:
 * - Redis-based caching
 * - Automatic cache warming on startup
 * - Periodic cache refresh
 * - Cache statistics and monitoring
 * - Global cache interceptor
 *
 * Usage:
 * Import this module in AppModule to enable caching globally.
 * Use decorators to control caching behavior:
 * - @CacheKey() - Custom cache key
 * - @CacheTTL() - Custom TTL
 * - @CacheInvalidate() - Cache invalidation
 * - @NoCache() - Disable caching
 */
@Global()
@Module({
  imports: [ConfigModule, ScheduleModule.forRoot()],
  providers: [CacheService, CacheInterceptor, CacheWarmingService],
  exports: [CacheService, CacheInterceptor, CacheWarmingService],
})
export class CacheModule {}
