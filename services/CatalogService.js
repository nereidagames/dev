/* game/services/CatalogService.js
   Service do pobierania katalogów z serwera proxy (JSON i binary).
   Obsługuje fallback: najpierw próbuje JSON, potem binary.
*/

import { API_BASE_URL } from '../Config.js';

const API_BASE = API_BASE_URL || 'http://localhost:10000';

export class CatalogService {
  constructor() {
    this.cache = null;
    this.cacheTime = 0;
    this.cacheTTL = 300000; // 5 minut cache
  }

  async fetchJSON() {
    try {
      const response = await fetch(`${API_BASE}/api/catalog/v1`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('[CatalogService] fetchJSON failed:', error);
      throw error;
    }
  }

  async fetchBinary() {
    try {
      const response = await fetch(`${API_BASE}/api/catalog/precompiled_catalogs.bin`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const buffer = await response.arrayBuffer();
      return this.parseBinary(buffer);
    } catch (error) {
      console.error('[CatalogService] fetchBinary failed:', error);
      throw error;
    }
  }

  parseBinary(buffer) {
    // Stub: placeholder dla prawdziwego parsera binary'ego
    // W przyszłości: implementacja parsera precompiled_catalogs.bin
    console.warn('[CatalogService] Binary parser not implemented; returning empty');
    return { items: [] };
  }

  async getCatalog(forceRefresh = false) {
    const now = Date.now();
    
    // Zwróć cache jeśli świeży
    if (this.cache && !forceRefresh && (now - this.cacheTime) < this.cacheTTL) {
      console.log('[CatalogService] Returning cached catalog, items:', this.cache.items?.length || 0);
      return this.cache;
    }

    console.log('[CatalogService] Fetching fresh catalog (forceRefresh=%s)', forceRefresh);
    
    // Spróbuj JSON najpierw
    try {
      const data = await this.fetchJSON();
      this.cache = data;
      this.cacheTime = now;
      console.log('[CatalogService] Successfully loaded JSON catalog with', data.items?.length || 0, 'items');
      return data;
    } catch (jsonError) {
      console.warn('[CatalogService] JSON fetch failed, trying binary...', jsonError.message);
    }

    // Fallback: spróbuj binary
    try {
      const data = await this.fetchBinary();
      this.cache = data;
      this.cacheTime = now;
      console.log('[CatalogService] Successfully loaded binary catalog with', data.items?.length || 0, 'items');
      return data;
    } catch (binError) {
      console.error('[CatalogService] Both JSON and binary failed:', binError.message);
      throw new Error('Catalog fetch failed: ' + binError.message);
    }
  }

  clearCache() {
    this.cache = null;
    this.cacheTime = 0;
  }
}
