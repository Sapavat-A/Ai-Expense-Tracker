// API Caching Service for performance optimization
class APICache {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes
  }

  set(key, data, ttl = this.defaultTTL) {
    this.cache.set(key, data);
    this.timestamps.set(key, Date.now() + ttl);
  }

  get(key) {
    const timestamp = this.timestamps.get(key);
    if (!timestamp || Date.now() > timestamp) {
      this.delete(key);
      return null;
    }
    return this.cache.get(key);
  }

  delete(key) {
    this.cache.delete(key);
    this.timestamps.delete(key);
  }

  clear() {
    this.cache.clear();
    this.timestamps.clear();
  }

  // Generate cache key from parameters
  generateKey(base, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});
    
    return `${base}:${JSON.stringify(sortedParams)}`;
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Create singleton instance
const apiCache = new APICache();

// Request deduplication for concurrent identical requests
const pendingRequests = new Map();

export const withCache = (apiFunction, cacheKey, ttl) => {
  return async (...args) => {
    const key = apiCache.generateKey(cacheKey, args[0] || {});
    
    // Check cache first
    const cached = apiCache.get(key);
    if (cached) {
      console.log(`Cache hit for ${key}`);
      return cached;
    }

    // Check if request is already pending
    if (pendingRequests.has(key)) {
      console.log(`Request deduplication for ${key}`);
      return pendingRequests.get(key);
    }

    // Make the request
    const requestPromise = apiFunction(...args);
    pendingRequests.set(key, requestPromise);

    try {
      const result = await requestPromise;
      
      // Cache successful responses
      if (result) {
        apiCache.set(key, result, ttl);
      }
      
      return result;
    } finally {
      // Clean up pending request
      pendingRequests.delete(key);
    }
  };
};

export const clearCache = (pattern = null) => {
  if (pattern) {
    // Clear cache entries matching pattern
    const keys = apiCache.getStats().keys;
    keys.forEach(key => {
      if (key.includes(pattern)) {
        apiCache.delete(key);
      }
    });
  } else {
    apiCache.clear();
  }
};

export const getCacheStats = () => {
  return apiCache.getStats();
};

export default apiCache;
