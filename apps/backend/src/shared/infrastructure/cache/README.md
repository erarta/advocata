# Redis Caching Service Layer

Comprehensive Redis-based caching infrastructure for the Advocata backend.

## Features

- **Automatic Caching**: Intercepts GET requests and caches responses automatically
- **Cache Invalidation**: Smart cache invalidation on data mutations (POST, PUT, DELETE)
- **Custom Cache Keys**: Flexible cache key generation via decorators
- **TTL Management**: Configurable time-to-live for cache entries
- **Cache Warming**: Pre-warms frequently accessed data on startup
- **Statistics & Monitoring**: Tracks cache hits, misses, and performance metrics
- **Error Handling**: Graceful fallbacks if Redis is unavailable
- **Bypass Options**: Support for cache bypass during testing

## Installation

The CacheModule is already integrated into the AppModule as a global module.

## Configuration

Add these environment variables to your `.env` file:

```env
# Cache Configuration
CACHE_ENABLE=true                 # Enable/disable caching
CACHE_TTL_DEFAULT=300            # Default TTL in seconds (5 minutes)
CACHE_KEY_PREFIX=advocata        # Namespace prefix for all cache keys
CACHE_MAX_ITEMS=10000            # Maximum items in cache
CACHE_WARMING_ENABLE=true        # Enable cache warming on startup
```

## Usage

### 1. Basic Caching (Automatic)

Simply add the `@UseInterceptors(CacheInterceptor)` to your controller:

```typescript
@Controller('lawyers')
@UseInterceptors(CacheInterceptor)
export class LawyerController {
  @Get()
  async search(@Query() dto: SearchLawyersRequestDto) {
    // This will be automatically cached
    return await this.queryBus.execute(query);
  }
}
```

### 2. Custom Cache Key

Use `@CacheKey` decorator to define custom cache keys:

```typescript
@Get(':id')
@CacheKey((req) => `lawyer:${req.params.id}`)
async getLawyer(@Param('id') id: string) {
  // Cached with key: "advocata:lawyer:123"
}

@Get('search')
@CacheKey((req) => `lawyers:search:${JSON.stringify(req.query)}`)
async search(@Query() dto: SearchDto) {
  // Cached with key: "advocata:lawyers:search:{"spec":"ДТП"}"
}
```

### 3. Custom TTL

Use `@CacheTTL` decorator to set custom time-to-live:

```typescript
@Get('lawyers')
@CacheTTL(300) // Cache for 5 minutes
async searchLawyers() {
  // ...
}

@Get('payments/:id')
@CacheTTL(600) // Cache for 10 minutes (payments are immutable)
async getPayment() {
  // ...
}
```

### 4. Cache Invalidation

Use `@CacheInvalidate` to clear cache after mutations:

```typescript
@Post('lawyers')
@CacheInvalidate(['lawyers:search:*', 'lawyers:all'])
async createLawyer(@Body() dto: CreateLawyerDto) {
  // After creating lawyer, invalidate all lawyer search caches
}

@Put('lawyers/:id')
@CacheInvalidate((req) => [
  `lawyer:${req.params.id}`,
  'lawyers:search:*'
])
async updateLawyer(@Param('id') id: string) {
  // Invalidate specific lawyer and all search results
}
```

### 5. Disable Caching for Specific Endpoints

Use `@NoCache` decorator:

```typescript
@Get('active')
@NoCache()
async getActiveConsultation() {
  // Real-time data should not be cached
}
```

### 6. Manual Cache Operations

Inject `CacheService` for manual cache operations:

```typescript
constructor(private readonly cacheService: CacheService) {}

async someMethod() {
  // Set cache
  await this.cacheService.set('my-key', { data: 'value' }, 300);

  // Get from cache
  const value = await this.cacheService.get<MyType>('my-key');

  // Delete cache
  await this.cacheService.del('my-key');

  // Delete pattern
  await this.cacheService.delPattern('lawyers:*');

  // Check existence
  const exists = await this.cacheService.exists('my-key');

  // Get TTL
  const ttl = await this.cacheService.ttl('my-key');

  // Increment/Decrement counters
  await this.cacheService.increment('view-count');
  await this.cacheService.decrement('remaining-quota');
}
```

## Cached Endpoints

### Lawyer Module
- **GET /lawyers/search** - TTL: 5 minutes
- **GET /lawyers/:id** - TTL: 10 minutes
- **Invalidation**: On lawyer registration, updates

### Consultation Module
- **GET /api/v1/consultations/my** - TTL: 2 minutes
- **GET /api/v1/consultations/lawyer/:lawyerId** - TTL: 2 minutes
- **GET /api/v1/consultations/:id** - TTL: 5 minutes
- **GET /api/v1/consultations/active** - NOT CACHED (real-time)
- **Invalidation**: On consultation status changes

### Payment Module
- **GET /api/v1/payments/:id** - TTL: 10 minutes (immutable)
- **GET /api/v1/payments/user/:userId** - TTL: 3 minutes
- **Invalidation**: On payment creation, capture, cancel, refund

### Admin Analytics Module
- **GET /admin/analytics/dashboard** - TTL: 5 minutes
- **GET /admin/analytics/revenue** - TTL: 5 minutes
- **GET /admin/analytics/users/growth** - TTL: 5 minutes
- **GET /admin/analytics/lawyers/performance** - TTL: 5 minutes
- All analytics endpoints - TTL: 5 minutes

## Cache Keys Pattern

All cache keys follow this pattern:
```
{prefix}:{module}:{entity}:{identifier}
```

Examples:
- `advocata:lawyer:123` - Lawyer with ID 123
- `advocata:lawyers:search:{"spec":"ДТП"}` - Lawyer search results
- `advocata:consultation:456` - Consultation with ID 456
- `advocata:payment:789` - Payment with ID 789
- `advocata:admin:analytics:dashboard:{}` - Admin dashboard

## Cache Warming

The `CacheWarmingService` pre-warms frequently accessed data:

- **On Startup**: Automatically warms cache when application starts
- **Periodic Refresh**: Refreshes every 5 minutes
- **Manual Trigger**: Can be triggered via service method

Warmed data includes:
- Popular lawyer searches (ДТП, Уголовное право, etc.)
- Top-rated lawyer profiles
- Platform statistics
- Specializations list

## Monitoring

### Get Cache Statistics

```typescript
const stats = await this.cacheService.getStats();

// Returns:
{
  hits: 1523,
  misses: 234,
  hitRate: 86.67,
  totalKeys: 142,
  memoryUsage: 2048576,
  mostAccessedKeys: [
    { key: 'advocata:lawyer:123', count: 45 },
    { key: 'advocata:lawyers:search:...', count: 32 },
    // ...
  ]
}
```

### Reset Statistics

```typescript
this.cacheService.resetStats();
```

### Clear All Cache

```typescript
await this.cacheService.clear();
```

## Bypass Cache for Testing

You can bypass cache in several ways:

1. **Query Parameter**: Add `?nocache=1` to any request
```
GET /lawyers/search?specializations=ДТП&nocache=1
```

2. **Environment Variable**: Set `CACHE_ENABLE=false`

3. **Programmatically**:
```typescript
await this.cacheService.get('key', { bypassCache: true });
await this.cacheService.set('key', value, ttl, { bypassCache: true });
```

## Performance Impact

Expected improvements:
- **Lawyer Search**: 50-80% faster (database query → cache lookup)
- **Lawyer Profile**: 60-90% faster
- **Analytics Dashboards**: 70-95% faster (complex aggregations → cached results)
- **Payment History**: 40-60% faster
- **Overall API Response Time**: 30-50% reduction on average

## Best Practices

1. **Choose Appropriate TTL**:
   - Frequently changing data: 1-2 minutes
   - Moderate changes: 5 minutes
   - Rarely changing data: 10-30 minutes
   - Immutable data: 1+ hours

2. **Use Specific Cache Keys**: More specific keys allow better invalidation
   ```typescript
   // Good
   @CacheKey((req) => `lawyer:${req.params.id}`)

   // Bad
   @CacheKey('lawyers') // Too broad
   ```

3. **Invalidate Wisely**: Use patterns to invalidate related caches
   ```typescript
   @CacheInvalidate((req) => [
     `lawyer:${req.params.id}`,      // Specific lawyer
     'lawyers:search:*',              // All searches
     'lawyers:top-rated'              // Top rated list
   ])
   ```

4. **Don't Cache User-Specific Data**: Unless you include user ID in key
   ```typescript
   // Good
   @CacheKey((req) => `consultations:user:${req.user.id}`)

   // Bad - will mix users' data
   @CacheKey('consultations:my')
   ```

5. **Monitor Cache Hit Rate**: Aim for >70% hit rate
   - Low hit rate → TTL too short or data changes too frequently
   - Very high hit rate → Consider longer TTL

## Troubleshooting

### Cache Not Working

1. Check Redis connection
2. Verify `CACHE_ENABLE=true`
3. Ensure `@UseInterceptors(CacheInterceptor)` is added
4. Check logs for cache errors

### Stale Data

1. Reduce TTL
2. Add proper cache invalidation
3. Use `?nocache=1` to verify fresh data

### Memory Issues

1. Reduce `CACHE_TTL_DEFAULT`
2. Limit `CACHE_MAX_ITEMS`
3. Use more specific invalidation patterns
4. Monitor with `getStats()`

## Architecture

```
┌─────────────────────────────────────────────────┐
│           HTTP Request (GET /lawyers)           │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │  CacheInterceptor     │
         │  - Check @NoCache     │
         │  - Check ?nocache=1   │
         └───────────┬───────────┘
                     │
         ┌───────────▼────────────┐
         │  Generate Cache Key    │
         │  From @CacheKey or URL │
         └───────────┬────────────┘
                     │
         ┌───────────▼────────────┐
         │   CacheService.get()   │
         │   Query Redis          │
         └───────────┬────────────┘
                     │
            ┌────────┴────────┐
            │                 │
         HIT│              MISS│
            ▼                 ▼
    ┌──────────────┐   ┌──────────────────┐
    │ Return Cache │   │ Execute Handler  │
    │    Value     │   │ (DB Query, etc.) │
    └──────────────┘   └────────┬─────────┘
                                 │
                      ┌──────────▼──────────┐
                      │  CacheService.set() │
                      │  Store in Redis     │
                      └──────────┬──────────┘
                                 │
                      ┌──────────▼──────────┐
                      │  Return Response    │
                      └─────────────────────┘
```

## Files Structure

```
apps/backend/src/shared/infrastructure/cache/
├── cache.module.ts               # Module definition
├── cache.service.ts              # Core caching service
├── cache.service.spec.ts         # Unit tests
├── cache.interceptor.ts          # HTTP interceptor
├── cache-warming.service.ts      # Cache warming
├── decorators/
│   ├── cache-key.decorator.ts    # @CacheKey
│   ├── cache-ttl.decorator.ts    # @CacheTTL
│   ├── cache-invalidate.decorator.ts  # @CacheInvalidate
│   ├── no-cache.decorator.ts     # @NoCache
│   └── index.ts
├── interfaces/
│   └── cache-options.interface.ts
├── index.ts
└── README.md                     # This file
```

## License

MIT
