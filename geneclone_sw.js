/**
 * 🧬 Gene Clone Phone - Service Worker
 * Instant caching for offline-first EugeneOusOS
 * No downloads necessary - apps stream from cloud when online, cached when offline
 */

const CACHE_NAME = 'eugeneous-os-v1.0';
const RUNTIME_CACHE = 'eugeneous-runtime-v1.0';

// Core files to cache immediately (instant startup)
const CORE_FILES = [
  '/geneclone_phone.html',
  '/pixelprodigy3d.html',
  '/wordweaver_format_engine.js',
  '/document3d_canvas.js',
  '/three.min.js',
  '/OrbitControls.js',
  '/TransformControls.js',
  '/clones_device_optimizer.js',
  '/muscle_layer.js',
  '/security_system.js',
  '/payment_integration.js',
  '/nft_system.js',
  '/live_analytics_dashboard.html',
  '/nft_readiness_dashboard.html',
  '/css_style_editor.html'
];

// Install event - cache core files instantly
self.addEventListener('install', (event) => {
  console.log('🧬 EugeneOusOS Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching core files...');
        return cache.addAll(CORE_FILES.map(url => new Request(url, { cache: 'reload' })));
      })
      .then(() => {
        console.log('✅ Core files cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.warn('⚠️ Some files could not be cached:', error);
        // Continue anyway - app will work with partial cache
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('🧬 EugeneOusOS Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network (offline-first)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }
  
  // Network-first for API calls
  if (url.pathname.startsWith('/v1/') || url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // Cache-first for static assets (instant loading)
  event.respondWith(cacheFirst(request));
});

/**
 * Cache-first strategy: instant app loading
 * Serves from cache immediately, updates cache in background
 */
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    console.log('⚡ Serving from cache:', request.url);
    
    // Update cache in background (stale-while-revalidate)
    fetch(request).then((response) => {
      if (response && response.status === 200) {
        cache.put(request, response.clone());
      }
    }).catch(() => {
      // Network error - keep using cache
    });
    
    return cached;
  }
  
  // Not in cache - fetch from network and cache
  try {
    const response = await fetch(request);
    
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('❌ Fetch failed:', request.url, error);
    
    // Return offline page if available
    const offlinePage = await cache.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }
    
    // Return minimal offline response
    return new Response('Offline - EugeneOusOS will sync when connected', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain'
      })
    });
  }
}

/**
 * Network-first strategy: for dynamic data (API calls)
 * Tries network first, falls back to cache if offline
 */
async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  
  try {
    const response = await fetch(request);
    
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('🔄 Network failed, using cache:', request.url);
    
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    
    // No cache available
    return new Response(JSON.stringify({ error: 'Offline', cached: false }), {
      status: 503,
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    });
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  console.log('☁️ Syncing offline data...');
  
  // Get offline actions from IndexedDB (future implementation)
  // Send to backend API when connection restored
  
  return Promise.resolve();
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('📬 Push notification received');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'EugeneOusOS';
  const options = {
    body: data.body || 'New notification',
    icon: '/icons/geneclone-icon-192.png',
    badge: '/icons/geneclone-badge-72.png',
    vibrate: [200, 100, 200],
    data: data,
    actions: data.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Notification clicked:', event.notification.tag);
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/geneclone_phone.html')
  );
});

console.log('🧬 EugeneOusOS Service Worker loaded');
