using Microsoft.Extensions.Caching.Memory;
using System;
using System.Threading.Tasks;

namespace Batuara.Auth.Services
{
    public class CacheService : ICacheService
    {
        private readonly IMemoryCache _cache;
        private readonly ILogger<CacheService> _logger;
        
        // Default cache expiration time (30 minutes)
        private static readonly TimeSpan DefaultExpiration = TimeSpan.FromMinutes(30);
        
        public CacheService(IMemoryCache cache, ILogger<CacheService> logger)
        {
            _cache = cache;
            _logger = logger;
        }
        
        public async Task<T?> GetAsync<T>(string key)
        {
            try
            {
                if (_cache.TryGetValue(key, out T? value))
                {
                    _logger.LogDebug("Cache hit for key: {Key}", key);
                    return value;
                }
                
                _logger.LogDebug("Cache miss for key: {Key}", key);
                return default(T);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving item from cache with key: {Key}", key);
                return default(T);
            }
        }
        
        public async Task SetAsync<T>(string key, T value, TimeSpan? expiration = null)
        {
            try
            {
                var cacheEntryOptions = new MemoryCacheEntryOptions()
                    .SetAbsoluteExpiration(expiration ?? DefaultExpiration);
                
                _cache.Set(key, value, cacheEntryOptions);
                
                _logger.LogDebug("Item added to cache with key: {Key}", key);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding item to cache with key: {Key}", key);
            }
        }
        
        public async Task RemoveAsync(string key)
        {
            try
            {
                _cache.Remove(key);
                
                _logger.LogDebug("Item removed from cache with key: {Key}", key);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing item from cache with key: {Key}", key);
            }
        }
        
        public async Task<bool> ExistsAsync(string key)
        {
            try
            {
                return _cache.TryGetValue(key, out _);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking cache existence for key: {Key}", key);
                return false;
            }
        }
    }
}