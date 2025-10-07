/**
 * IndexedDB Offline Storage Utility
 * Provides offline caching and sync queue management
 */

const DB_NAME = 'BeeriManagerDB';
const DB_VERSION = 1;

export interface PendingSyncItem {
  id?: number;
  url: string;
  method: string;
  headers: Record<string, string>;
  data: any;
  timestamp: number;
  retryCount: number;
}

export interface CacheItem<T = any> {
  key: string;
  value: T;
  timestamp: number;
  expiresAt?: number;
}

class OfflineStorage {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase> | null = null;

  /**
   * Initialize IndexedDB connection
   */
  async init(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB failed to open:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB opened successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('pendingSync')) {
          const syncStore = db.createObjectStore('pendingSync', {
            keyPath: 'id',
            autoIncrement: true,
          });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('url', 'url', { unique: false });
        }

        if (!db.objectStoreNames.contains('offlineCache')) {
          const cacheStore = db.createObjectStore('offlineCache', {
            keyPath: 'key',
          });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
          cacheStore.createIndex('expiresAt', 'expiresAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('events')) {
          db.createObjectStore('events', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('tasks')) {
          db.createObjectStore('tasks', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('protocols')) {
          db.createObjectStore('protocols', { keyPath: 'id' });
        }

        console.log('IndexedDB schema upgraded');
      };
    });

    return this.initPromise;
  }

  /**
   * Add item to sync queue
   */
  async addToSyncQueue(item: Omit<PendingSyncItem, 'id' | 'timestamp' | 'retryCount'>): Promise<number> {
    const db = await this.init();
    const transaction = db.transaction(['pendingSync'], 'readwrite');
    const store = transaction.objectStore('pendingSync');

    const syncItem: Omit<PendingSyncItem, 'id'> = {
      ...item,
      timestamp: Date.now(),
      retryCount: 0,
    };

    return new Promise((resolve, reject) => {
      const request = store.add(syncItem);
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all pending sync items
   */
  async getPendingSyncItems(): Promise<PendingSyncItem[]> {
    const db = await this.init();
    const transaction = db.transaction(['pendingSync'], 'readonly');
    const store = transaction.objectStore('pendingSync');

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Remove item from sync queue
   */
  async removeSyncItem(id: number): Promise<void> {
    const db = await this.init();
    const transaction = db.transaction(['pendingSync'], 'readwrite');
    const store = transaction.objectStore('pendingSync');

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Update retry count for sync item
   */
  async updateSyncItemRetry(id: number): Promise<void> {
    const db = await this.init();
    const transaction = db.transaction(['pendingSync'], 'readwrite');
    const store = transaction.objectStore('pendingSync');

    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          item.retryCount += 1;
          const updateRequest = store.put(item);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          reject(new Error('Item not found'));
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * Cache data with optional expiration
   */
  async cacheData<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    const db = await this.init();
    const transaction = db.transaction(['offlineCache'], 'readwrite');
    const store = transaction.objectStore('offlineCache');

    const cacheItem: CacheItem<T> = {
      key,
      value,
      timestamp: Date.now(),
      expiresAt: ttlMs ? Date.now() + ttlMs : undefined,
    };

    return new Promise((resolve, reject) => {
      const request = store.put(cacheItem);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get cached data
   */
  async getCachedData<T>(key: string): Promise<T | null> {
    const db = await this.init();
    const transaction = db.transaction(['offlineCache'], 'readonly');
    const store = transaction.objectStore('offlineCache');

    return new Promise((resolve, reject) => {
      const request = store.get(key);

      request.onsuccess = () => {
        const item = request.result as CacheItem<T> | undefined;

        if (!item) {
          resolve(null);
          return;
        }

        // Check if expired
        if (item.expiresAt && item.expiresAt < Date.now()) {
          // Delete expired item
          this.deleteCachedData(key);
          resolve(null);
          return;
        }

        resolve(item.value);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete cached data
   */
  async deleteCachedData(key: string): Promise<void> {
    const db = await this.init();
    const transaction = db.transaction(['offlineCache'], 'readwrite');
    const store = transaction.objectStore('offlineCache');

    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear expired cache items
   */
  async clearExpiredCache(): Promise<number> {
    const db = await this.init();
    const transaction = db.transaction(['offlineCache'], 'readwrite');
    const store = transaction.objectStore('offlineCache');
    const index = store.index('expiresAt');

    const now = Date.now();
    let deletedCount = 0;

    return new Promise((resolve, reject) => {
      const request = index.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;

        if (cursor) {
          const item = cursor.value as CacheItem;
          if (item.expiresAt && item.expiresAt < now) {
            cursor.delete();
            deletedCount++;
          }
          cursor.continue();
        } else {
          resolve(deletedCount);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Store entity data for offline access
   */
  async storeEntity<T>(storeName: string, entity: T & { id: string | number }): Promise<void> {
    const db = await this.init();

    if (!db.objectStoreNames.contains(storeName)) {
      console.warn(`Store ${storeName} does not exist`);
      return;
    }

    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.put(entity);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get entity data
   */
  async getEntity<T>(storeName: string, id: string | number): Promise<T | null> {
    const db = await this.init();

    if (!db.objectStoreNames.contains(storeName)) {
      console.warn(`Store ${storeName} does not exist`);
      return null;
    }

    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all entities from a store
   */
  async getAllEntities<T>(storeName: string): Promise<T[]> {
    const db = await this.init();

    if (!db.objectStoreNames.contains(storeName)) {
      console.warn(`Store ${storeName} does not exist`);
      return [];
    }

    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all data from database
   */
  async clearAll(): Promise<void> {
    const db = await this.init();
    const storeNames = Array.from(db.objectStoreNames);

    const transaction = db.transaction(storeNames, 'readwrite');

    return new Promise((resolve, reject) => {
      storeNames.forEach((storeName) => {
        transaction.objectStore(storeName).clear();
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Check if online
   */
  isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Register background sync (if supported)
   */
  async registerBackgroundSync(tag: string = 'sync-offline-data'): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await (registration as any).sync.register(tag);
        console.log('Background sync registered:', tag);
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    } else {
      console.warn('Background sync not supported');
    }
  }
}

// Export singleton instance
export const offlineStorage = new OfflineStorage();

// Initialize on module load
if (typeof window !== 'undefined') {
  offlineStorage.init().catch(console.error);
}
