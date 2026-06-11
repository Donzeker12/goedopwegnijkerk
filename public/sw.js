const CACHE_VERSION = 'gow-admin-v1';
const APP_SHELL_CACHE = `${CACHE_VERSION}-shell`;
const PAGE_CACHE = `${CACHE_VERSION}-pages`;
const API_CACHE = `${CACHE_VERSION}-api`;
const OFFLINE_QUEUE_KEY = 'gow-admin-offline-queue';
const SYNC_TAG = 'gow-admin-sync';
const APP_SHELL_FILES = [
  '/',
  '/admin',
  '/offline.html',
  '/manifest.webmanifest',
  '/apple-touch-icon.png',
  '/logo-square-512.png',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !key.startsWith(CACHE_VERSION))
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    event.respondWith(handleWriteRequest(request));
    return;
  }

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(request));
    return;
  }

  if (url.pathname.startsWith('/build/')) {
    event.respondWith(cacheFirstAsset(request));
    return;
  }

  if (url.pathname.startsWith('/admin')) {
    event.respondWith(networkFirstPage(request));
    return;
  }

  if (url.pathname.startsWith('/api')) {
    event.respondWith(networkFirstApi(request));
  }
});

self.addEventListener('sync', (event) => {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(replayOfflineQueue());
  }
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'REPLAY_OFFLINE_QUEUE') {
    event.waitUntil(replayOfflineQueue());
  }
});

self.addEventListener('push', (event) => {
  let payload = {
    title: 'Nieuwe update',
    body: 'Er is een nieuwe melding beschikbaar in de admin app.',
    url: '/admin/start',
    tag: 'admin-update',
  };

  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() };
    } catch (error) {
      // Keep fallback payload when push body is not valid JSON.
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/apple-touch-icon.png',
      badge: '/apple-touch-icon.png',
      tag: payload.tag,
      data: {
        url: payload.url,
      },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/admin/start';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes('/admin') && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }

      return undefined;
    })
  );
});

async function cacheFirstAsset(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  const cache = await caches.open(APP_SHELL_CACHE);
  cache.put(request, response.clone());
  return response;
}

async function networkFirstPage(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(PAGE_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    const offline = await caches.match('/offline.html');
    return offline || Response.error();
  }
}

async function networkFirstApi(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(API_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    return cached || Response.error();
  }
}

async function handleWriteRequest(request) {
  try {
    return await fetch(request.clone());
  } catch (error) {
    const url = new URL(request.url);
    const shouldQueue = url.pathname.startsWith('/admin');

    if (!shouldQueue) {
      return Response.error();
    }

    const entry = {
      url: request.url,
      method: request.method,
      headers: await serializableHeaders(request.headers),
      body: await safeReadBody(request.clone()),
      timestamp: Date.now(),
    };

    await queueRequest(entry);

    if (self.registration.sync) {
      await self.registration.sync.register(SYNC_TAG);
    }

    return new Response(JSON.stringify({ queued: true, offline: true }), {
      status: 202,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

async function replayOfflineQueue() {
  const queue = await getQueue();
  if (!queue.length) return;

  const pending = [];

  for (const item of queue) {
    try {
      const response = await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body,
        credentials: 'same-origin',
      });

      if (!response.ok) {
        pending.push(item);
      }
    } catch (error) {
      pending.push(item);
    }
  }

  await setQueue(pending);
}

async function serializableHeaders(headers) {
  const mapped = {};
  headers.forEach((value, key) => {
    mapped[key] = value;
  });
  return mapped;
}

async function safeReadBody(request) {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json') || contentType.includes('application/x-www-form-urlencoded')) {
    return request.text();
  }

  return null;
}

async function queueRequest(entry) {
  const queue = await getQueue();
  queue.push(entry);
  await setQueue(queue.slice(-40));
}

async function getQueue() {
  const cache = await caches.open(API_CACHE);
  const response = await cache.match(OFFLINE_QUEUE_KEY);
  if (!response) return [];

  try {
    return await response.json();
  } catch {
    return [];
  }
}

async function setQueue(queue) {
  const cache = await caches.open(API_CACHE);
  await cache.put(
    OFFLINE_QUEUE_KEY,
    new Response(JSON.stringify(queue), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  );
}
