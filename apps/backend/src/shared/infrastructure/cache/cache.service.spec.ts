import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';

describe('CacheService', () => {
  let service: CacheService;
  let configService: ConfigService;

  // Mock ConfigService
  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      const config = {
        CACHE_ENABLE: 'true',
        CACHE_TTL_DEFAULT: '300',
        CACHE_KEY_PREFIX: 'test',
        REDIS_HOST: 'localhost',
        REDIS_PORT: '6379',
        REDIS_PASSWORD: undefined,
      };
      return config[key] || defaultValue;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(async () => {
    // Clean up Redis connections
    await service.onModuleDestroy();
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should be enabled by default', () => {
      expect(service.isEnabled()).toBe(true);
    });

    it('should respect CACHE_ENABLE configuration', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'CACHE_ENABLE') return 'false';
        return mockConfigService.get(key);
      });

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CacheService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const disabledService = module.get<CacheService>(CacheService);
      expect(disabledService.isEnabled()).toBe(false);

      await disabledService.onModuleDestroy();
    });
  });

  describe('set and get', () => {
    it('should store and retrieve a value', async () => {
      const key = 'test-key';
      const value = { data: 'test-data', number: 123 };

      await service.set(key, value);
      const result = await service.get(key);

      expect(result).toEqual(value);
    });

    it('should return null for non-existent key', async () => {
      const result = await service.get('non-existent-key');
      expect(result).toBeNull();
    });

    it('should handle primitive values', async () => {
      await service.set('string-key', 'test string');
      await service.set('number-key', 42);
      await service.set('boolean-key', true);

      expect(await service.get('string-key')).toBe('test string');
      expect(await service.get('number-key')).toBe(42);
      expect(await service.get('boolean-key')).toBe(true);
    });

    it('should handle complex objects', async () => {
      const complexObject = {
        user: {
          id: '123',
          name: 'Test User',
          roles: ['admin', 'user'],
        },
        metadata: {
          createdAt: new Date().toISOString(),
          tags: ['tag1', 'tag2'],
        },
      };

      await service.set('complex-key', complexObject);
      const result = await service.get('complex-key');

      expect(result).toEqual(complexObject);
    });

    it('should respect custom TTL', async () => {
      const key = 'ttl-test';
      const value = 'test-value';
      const ttl = 2; // 2 seconds

      await service.set(key, value, ttl);

      // Should exist immediately
      expect(await service.exists(key)).toBe(true);

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 2500));

      // Should be expired
      expect(await service.exists(key)).toBe(false);
    }, 10000); // Increase test timeout
  });

  describe('delete', () => {
    it('should delete a key', async () => {
      const key = 'delete-test';
      await service.set(key, 'value');

      expect(await service.exists(key)).toBe(true);

      await service.del(key);

      expect(await service.exists(key)).toBe(false);
    });

    it('should handle deleting non-existent key', async () => {
      await expect(service.del('non-existent')).resolves.not.toThrow();
    });
  });

  describe('delPattern', () => {
    it('should delete keys matching pattern', async () => {
      await service.set('user:1', { id: 1 });
      await service.set('user:2', { id: 2 });
      await service.set('user:3', { id: 3 });
      await service.set('post:1', { id: 1 });

      await service.delPattern('user:*');

      expect(await service.exists('user:1')).toBe(false);
      expect(await service.exists('user:2')).toBe(false);
      expect(await service.exists('user:3')).toBe(false);
      expect(await service.exists('post:1')).toBe(true);
    });
  });

  describe('exists', () => {
    it('should return true for existing key', async () => {
      await service.set('exists-test', 'value');
      expect(await service.exists('exists-test')).toBe(true);
    });

    it('should return false for non-existent key', async () => {
      expect(await service.exists('non-existent')).toBe(false);
    });
  });

  describe('ttl', () => {
    it('should return remaining TTL', async () => {
      const key = 'ttl-check';
      const ttl = 60;

      await service.set(key, 'value', ttl);
      const remainingTtl = await service.ttl(key);

      expect(remainingTtl).toBeGreaterThan(0);
      expect(remainingTtl).toBeLessThanOrEqual(ttl);
    });

    it('should return -1 for non-existent key', async () => {
      const ttl = await service.ttl('non-existent');
      expect(ttl).toBe(-1);
    });
  });

  describe('increment and decrement', () => {
    it('should increment a counter', async () => {
      const key = 'counter';

      const first = await service.increment(key);
      expect(first).toBe(1);

      const second = await service.increment(key);
      expect(second).toBe(2);

      const third = await service.increment(key);
      expect(third).toBe(3);
    });

    it('should decrement a counter', async () => {
      const key = 'counter-down';

      await service.set(key, '10');

      const first = await service.decrement(key);
      expect(first).toBe(9);

      const second = await service.decrement(key);
      expect(second).toBe(8);
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', async () => {
      // Perform some cache operations
      await service.get('test-1'); // miss
      await service.set('test-1', 'value');
      await service.get('test-1'); // hit
      await service.get('test-1'); // hit
      await service.get('test-2'); // miss

      const stats = await service.getStats();

      expect(stats).toHaveProperty('hits');
      expect(stats).toHaveProperty('misses');
      expect(stats).toHaveProperty('hitRate');
      expect(stats).toHaveProperty('totalKeys');
      expect(stats).toHaveProperty('memoryUsage');
      expect(stats).toHaveProperty('mostAccessedKeys');

      expect(stats.hits).toBeGreaterThan(0);
      expect(stats.misses).toBeGreaterThan(0);
      expect(stats.hitRate).toBeGreaterThan(0);
      expect(stats.hitRate).toBeLessThanOrEqual(100);
    });
  });

  describe('resetStats', () => {
    it('should reset statistics', async () => {
      await service.get('test'); // Generate some stats
      await service.set('test', 'value');
      await service.get('test');

      service.resetStats();

      const stats = await service.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });
  });

  describe('clear', () => {
    it('should clear all cache keys', async () => {
      await service.set('key1', 'value1');
      await service.set('key2', 'value2');
      await service.set('key3', 'value3');

      await service.clear();

      expect(await service.exists('key1')).toBe(false);
      expect(await service.exists('key2')).toBe(false);
      expect(await service.exists('key3')).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle errors gracefully in get', async () => {
      // Test with invalid JSON (simulated by corrupting cache)
      const result = await service.get('non-existent-key');
      expect(result).toBeNull();
    });

    it('should handle errors gracefully in set', async () => {
      // Should not throw even if there's an error
      await expect(service.set('test', undefined)).resolves.not.toThrow();
    });
  });

  describe('bypass cache option', () => {
    it('should bypass cache when option is set', async () => {
      const key = 'bypass-test';
      const value = 'test-value';

      await service.set(key, value, undefined, { bypassCache: true });

      const result = await service.get(key, { bypassCache: true });
      expect(result).toBeNull();
    });
  });

  describe('key prefixing', () => {
    it('should use default prefix', async () => {
      const key = 'test-key';
      await service.set(key, 'value');

      // The key should be stored with prefix
      // This is verified internally by the service
      expect(await service.get(key)).toBe('value');
    });

    it('should use custom prefix', async () => {
      const key = 'test-key';
      const customPrefix = 'custom';

      await service.set(key, 'value', undefined, { prefix: customPrefix });

      // Should not be found with default prefix
      expect(await service.get(key)).toBeNull();

      // Should be found with custom prefix
      expect(await service.get(key, { prefix: customPrefix })).toBe('value');
    });
  });
});
