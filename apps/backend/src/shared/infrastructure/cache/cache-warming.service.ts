import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';
import { Cron, CronExpression } from '@nestjs/schedule';

/**
 * CacheWarmingService
 *
 * Pre-warms frequently accessed data on startup and refreshes before expiration.
 * This improves response times for common queries.
 *
 * Warming strategies:
 * - Popular searches
 * - Top-rated lawyers
 * - Frequently accessed static data
 */
@Injectable()
export class CacheWarmingService implements OnModuleInit {
  private readonly logger = new Logger(CacheWarmingService.name);
  private readonly warmingEnabled: boolean;

  constructor(
    private readonly cacheService: CacheService,
    private readonly configService: ConfigService,
  ) {
    this.warmingEnabled =
      this.configService.get('CACHE_WARMING_ENABLE', 'true') === 'true';
  }

  async onModuleInit() {
    if (this.warmingEnabled && this.cacheService.isEnabled()) {
      this.logger.log('Starting cache warming...');
      await this.warmCache();
      this.logger.log('Cache warming completed');
    }
  }

  /**
   * Warm cache with frequently accessed data
   */
  async warmCache(): Promise<void> {
    try {
      await Promise.all([
        this.warmPopularSearches(),
        this.warmTopLawyers(),
        this.warmStaticData(),
      ]);
    } catch (error) {
      this.logger.error(`Cache warming failed: ${error.message}`);
    }
  }

  /**
   * Refresh cache periodically (every 5 minutes)
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async refreshCache(): Promise<void> {
    if (!this.warmingEnabled || !this.cacheService.isEnabled()) {
      return;
    }

    this.logger.debug('Refreshing cache...');
    await this.warmCache();
    this.logger.debug('Cache refresh completed');
  }

  /**
   * Warm popular search queries
   * Pre-cache common search patterns based on historical data
   */
  private async warmPopularSearches(): Promise<void> {
    const popularSearches = [
      { specializations: ['ДТП'], key: 'lawyers:search:spec=ДТП' },
      {
        specializations: ['Уголовное право'],
        key: 'lawyers:search:spec=Уголовное право',
      },
      {
        specializations: ['Трудовое право'],
        key: 'lawyers:search:spec=Трудовое право',
      },
      {
        specializations: ['Семейное право'],
        key: 'lawyers:search:spec=Семейное право',
      },
    ];

    for (const search of popularSearches) {
      // In real implementation, this would call the actual search query handler
      // For now, we'll just set a placeholder
      await this.cacheService.set(
        search.key,
        {
          items: [],
          total: 0,
          cached: true,
          warmed: true,
        },
        300, // 5 minutes
      );
    }

    this.logger.debug(
      `Warmed ${popularSearches.length} popular search queries`,
    );
  }

  /**
   * Warm top-rated lawyers
   * Pre-cache profiles of top-rated and most booked lawyers
   */
  private async warmTopLawyers(): Promise<void> {
    // In real implementation, this would:
    // 1. Query database for top 10 lawyers by rating
    // 2. Query database for top 10 lawyers by consultation count
    // 3. Cache their profiles

    const topLawyerIds = [
      // These would come from actual queries
      // For now, using placeholders
    ];

    for (const lawyerId of topLawyerIds) {
      // Cache individual lawyer profiles
      await this.cacheService.set(
        `lawyer:${lawyerId}`,
        {
          id: lawyerId,
          cached: true,
          warmed: true,
        },
        600, // 10 minutes
      );
    }

    this.logger.debug(`Warmed ${topLawyerIds.length} top lawyer profiles`);
  }

  /**
   * Warm static/semi-static data
   * Pre-cache data that rarely changes
   */
  private async warmStaticData(): Promise<void> {
    // Warm specializations list
    await this.cacheService.set(
      'static:specializations',
      [
        'ДТП',
        'Уголовное право',
        'Трудовое право',
        'Семейное право',
        'Жилищное право',
        'Налоговое право',
      ],
      3600, // 1 hour
    );

    // Warm platform statistics
    await this.cacheService.set(
      'static:platform-stats',
      {
        totalLawyers: 0, // Would come from DB query
        totalConsultations: 0,
        averageRating: 0,
        cached: true,
        warmed: true,
      },
      300, // 5 minutes
    );

    this.logger.debug('Warmed static data');
  }

  /**
   * Manually trigger cache warming
   */
  async triggerWarmup(): Promise<void> {
    this.logger.log('Manual cache warming triggered');
    await this.warmCache();
  }

  /**
   * Clear and re-warm cache
   */
  async clearAndWarm(): Promise<void> {
    this.logger.log('Clearing cache and re-warming...');
    await this.cacheService.clear();
    await this.warmCache();
    this.logger.log('Cache cleared and re-warmed');
  }
}
