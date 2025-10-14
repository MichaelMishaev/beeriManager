// Custom Service Worker for enhanced PWA features
// This extends next-pwa with push notifications and background sync

// Listen for push notifications
self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');

  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: 'ועד הורים',
        body: event.data.text(),
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png'
      };
    }
  }

  const title = data.title || 'ועד הורים';
  const options = {
    body: data.body || 'התקבלה התראה חדשה',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/icon-96x96.png',
    data: data.data || {},
    tag: data.tag || 'notification',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [],
    dir: 'rtl',
    lang: 'he',
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.', event.notification.tag);

  event.notification.close();

  // Handle action clicks
  if (event.action) {
    console.log('[Service Worker] Notification action:', event.action);
    // Custom action handling can be added here
  }

  // Navigate to the relevant page
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
    .then(function(windowClients) {
      // Check if there's already a window open
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background Sync for offline data
self.addEventListener('sync', function(event) {
  console.log('[Service Worker] Background sync:', event.tag);

  if (event.tag === 'sync-offline-data') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  try {
    // Open IndexedDB
    const db = await openDatabase();

    // Get all pending items from offline storage
    const pendingItems = await getPendingItems(db);

    // Sync each item
    for (const item of pendingItems) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: JSON.stringify(item.data)
        });

        if (response.ok) {
          // Remove from pending queue
          await removePendingItem(db, item.id);
          console.log('[Service Worker] Synced:', item.id);
        }
      } catch (error) {
        console.error('[Service Worker] Sync failed for:', item.id, error);
      }
    }

    // Notify the client that sync is complete
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        timestamp: Date.now()
      });
    });

  } catch (error) {
    console.error('[Service Worker] Background sync failed:', error);
    throw error; // Retry sync
  }
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('BeeriManagerDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains('pendingSync')) {
        const store = db.createObjectStore('pendingSync', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!db.objectStoreNames.contains('offlineCache')) {
        db.createObjectStore('offlineCache', { keyPath: 'key' });
      }
    };
  });
}

function getPendingItems(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingSync'], 'readonly');
    const store = transaction.objectStore('pendingSync');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function removePendingItem(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingSync'], 'readwrite');
    const store = transaction.objectStore('pendingSync');
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

// Periodic Background Sync (if supported)
self.addEventListener('periodicsync', function(event) {
  console.log('[Service Worker] Periodic sync:', event.tag);

  if (event.tag === 'check-updates') {
    event.waitUntil(checkForUpdates());
  }
});

async function checkForUpdates() {
  try {
    // Check for new events, tasks, etc.
    const response = await fetch('/api/updates/check');
    if (response.ok) {
      const data = await response.json();

      if (data.hasUpdates) {
        // Show notification about new content
        await self.registration.showNotification('תוכן חדש זמין', {
          body: data.message || 'יש עדכונים חדשים באפליקציה',
          icon: '/icons/icon-192x192.png',
          tag: 'content-update',
          data: { url: '/' }
        });
      }
    }
  } catch (error) {
    console.error('[Service Worker] Update check failed:', error);
  }
}

// Message handling from clients
self.addEventListener('message', function(event) {
  console.log('[Service Worker] Message received:', event.data);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CLAIM_CLIENTS') {
    self.clients.claim();
  }

  if (event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open('runtime-cache').then(cache => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});

console.log('[Service Worker] Custom SW loaded');
