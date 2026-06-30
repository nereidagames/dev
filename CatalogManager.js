/* game/CatalogManager.js
   Manager do zarządzania katalogami (items, skins, blocks, etc).
   Pobiera katalogi z CatalogService i zarządza cachem.
*/

import { CatalogService } from './services/CatalogService.js';
import { API_BASE_URL } from './Config.js';

export class CatalogManager {
  constructor() {
    this.catalogService = new CatalogService();
    this.catalog = null;
    this.ready = false;
  }

  async initialize() {
    try {
      console.log('[CatalogManager] Initializing...');
      this.catalog = await this.catalogService.getCatalog();
      this.ready = true;
      console.log('[CatalogManager] Catalog loaded successfully: %d items', this.catalog.items?.length || 0);
      return true;
    } catch (error) {
      console.error('[CatalogManager] Initialization failed:', error);
      this.catalog = { items: [] };
      this.ready = true; // Załaduj fallback
      return false;
    }
  }

  getItems() {
    return this.catalog?.items || [];
  }

  getItemById(id) {
    return this.getItems().find(item => item.id === id);
  }

  getCatalog() {
    return this.catalog;
  }

  async refresh() {
    this.catalogService.clearCache();
    return this.initialize();
  }

  isReady() {
    return this.ready;
  }
}
