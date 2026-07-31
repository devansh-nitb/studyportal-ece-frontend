// public/sw.js  — Service Worker for Web Push Notifications + offline support
// FIX: This file is required for push notifications to work.

// ── Cache names (bump the suffix to force-invalidate old caches on deploy) ──
const SHELL_CACHE    = 'studyportal-shell-v1';     // app's JS/CSS/HTML so the SPA itself can boot offline
const API_CACHE      = 'studyportal-api-v2';       // small JSON: subjects, materials list, current-semester
const MATERIAL_CACHE = 'studyportal-materials-v2'; // actual PDF/image bytes behind /materials/:id/view

const MAX_CACHED_MATERIALS = 30; // file bodies — cap because PDFs/images are large
const MAX_CACHED_API_ENTRIES = 60; // JSON list responses — cheap, can afford more

const CURRENT_CACHES = [SHELL_CACHE, API_CACHE, MATERIAL_CACHE];

// ── Security: per-user cache scoping ─────────────────────────────────────
// Cache Storage is shared by ORIGIN, not by logged-in user. On a shared
// computer, if we cached responses keyed only by URL, a second person
// logging in after the first would be served the first person's cached
// materials list, file content, and even their personally watermarked PDFs
// (which embed the first user's name + scholar number) — entirely offline,
// with no auth check possible. To prevent that, every cache key is salted
// with a hash of the request's Authorization header, so different users
// (or a logged-out anonymous request) never collide in the cache. The app
// also explicitly flushes these caches on logout — see the
// CLEAR_USER_DATA_CACHE message handler below, wired up in AuthContext.js.
async function userScopeFor(request) {
    const auth = request.headers.get('Authorization') || '';
    if (!auth) return 'anon';
    try {
        const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(auth));
        return Array.from(new Uint8Array(digest))
            .slice(0, 10)
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
    } catch {
        return 'anon';
    }
}

async function scopedKey(request) {
    const scope = await userScopeFor(request);
    const sep = request.url.includes('?') ? '&' : '?';
    return `${request.url}${sep}__swu=${scope}`;
}

// Tag a response with the time it was cached so we can evict the oldest
// entries once a cache goes over its cap. Response headers can't be mutated
// in place, so we rebuild the response with an extra header.
async function tagWithTimestamp(response) {
    const buffer = await response.clone().arrayBuffer();
    const headers = new Headers(response.headers);
    headers.set('sw-cached-at', Date.now().toString());
    return new Response(buffer, { status: response.status, statusText: response.statusText, headers });
}

async function trimCache(cache, maxEntries) {
    const keys = await cache.keys();
    if (keys.length <= maxEntries) return;

    const withTimestamps = await Promise.all(keys.map(async (key) => {
        const res = await cache.match(key);
        const ts = Number(res?.headers.get('sw-cached-at')) || 0;
        return { key, ts };
    }));

    withTimestamps.sort((a, b) => a.ts - b.ts); // oldest first
    const overflow = withTimestamps.length - maxEntries;
    for (let i = 0; i < overflow; i++) {
        await cache.delete(withTimestamps[i].key);
    }
}

function markOfflineFallback(response) {
    const headers = new Headers(response.headers);
    headers.set('x-sw-offline-fallback', '1');
    return response.clone().arrayBuffer().then((buffer) =>
        new Response(buffer, { status: response.status, statusText: response.statusText, headers })
    );
}

// ── Request classification ───────────────────────────────────────────────
// These all work regardless of which domain the API is hosted on, since a
// service worker intercepts every request made by the page it controls
// (fetch() and XHR alike), not just same-origin ones.
function isMaterialViewRequest(request) {
    if (request.method !== 'GET') return false;
    try {
        return /\/api\/materials\/[^/]+\/view$/.test(new URL(request.url).pathname);
    } catch {
        return false;
    }
}

// The small JSON endpoints that drive the "what files/subjects exist" UI.
// Includes the single-material detail endpoint (GET /api/materials/:id)
// used by the direct "open this exact file" deep link/page reload, and the
// public announcements feed. Deliberately NOT including /doubts,
// /timetable, /notifications — those change too often to be worth caching
// offline, or carry no benefit from a stale copy.
function isListDataRequest(request) {
    if (request.method !== 'GET') return false;
    try {
        const { pathname } = new URL(request.url);
        return pathname === '/api/subjects'
            || pathname === '/api/materials'
            || pathname === '/api/settings/current-semester'
            || pathname === '/api/announcements'
            || /^\/api\/materials\/[^/]+$/.test(pathname); // single material detail, NOT /materials/:id/view
    } catch {
        return false;
    }
}

function isAppShellRequest(request) {
    if (request.method !== 'GET') return false;
    if (request.mode === 'navigate') return true;
    try {
        const url = new URL(request.url);
        if (url.origin !== self.location.origin) return false;
        return url.pathname.startsWith('/static/')
            || url.pathname === '/manifest.json'
            || /\.(?:js|css|png|svg|ico|woff2?)$/.test(url.pathname);
    } catch {
        return false;
    }
}

// ── Strategy: network-first, cache-fallback ──────────────────────────────
// Used for material file bodies (PDF/image bytes) and the list/JSON
// endpoints. Always prefers a live network response when online (so data
// is never more stale than it has to be) but falls back to the
// last-known-good cached copy when offline.
async function networkFirst(request, cacheName, maxEntries) {
    const cache = await caches.open(cacheName);
    const key = await scopedKey(request);

    try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.ok) {
            const tagged = await tagWithTimestamp(networkResponse);
            cache.put(key, tagged.clone()).then(() => trimCache(cache, maxEntries));
            return tagged;
        }
        // Non-OK response (e.g. 403 premium-locked, 401 expired session) —
        // never cache it, and never substitute a stale cached copy in its
        // place, since that could mask a real access-control decision.
        return networkResponse;
    } catch (networkErr) {
        const cached = await cache.match(key);
        if (cached) return markOfflineFallback(cached);
        throw networkErr;
    }
}

// ── Strategy: stale-while-revalidate ─────────────────────────────────────
// Used for the app shell. Serves the cached copy instantly if we have one
// (so "online" reloads feel immediate — the "refresh minimally" behavior),
// while quietly re-fetching in the background to keep the cache current
// for next time. Falls back to a network fetch only on the very first
// visit, and to the cached app shell root if a navigation request can't be
// served any other way while offline.
async function staleWhileRevalidate(request) {
    const cache = await caches.open(SHELL_CACHE);
    const cached = await cache.match(request);

    const networkUpdate = fetch(request)
        .then((res) => {
            if (res && res.ok) cache.put(request, res.clone());
            return res;
        })
        .catch(() => null);

    if (cached) {
        networkUpdate; // refresh in the background, don't block the response
        return cached;
    }

    const networkResponse = await networkUpdate;
    if (networkResponse) return networkResponse;

    if (request.mode === 'navigate') {
        const shellFallback = (await cache.match('/')) || (await cache.match('/index.html'));
        if (shellFallback) return shellFallback;
    }
    throw new Error('No cached app shell available offline');
}

self.addEventListener('fetch', (event) => {
    const { request } = event;

    if (isMaterialViewRequest(request)) {
        event.respondWith(networkFirst(request, MATERIAL_CACHE, MAX_CACHED_MATERIALS));
        return;
    }
    if (isListDataRequest(request)) {
        event.respondWith(networkFirst(request, API_CACHE, MAX_CACHED_API_ENTRIES));
        return;
    }
    if (isAppShellRequest(request)) {
        event.respondWith(staleWhileRevalidate(request));
    }
    // Everything else (auth, doubts, notifications, downloads, etc.) is
    // intentionally left untouched and goes straight to the network —
    // these must always reflect live, authenticated, non-cached state.
});

// Take over immediately on update instead of waiting for every open tab to
// be closed first — without this, deploying a new sw.js (e.g. this caching
// logic) silently keeps the OLD service worker in control of already-open
// tabs, so the new caching/offline behavior wouldn't actually be active
// until the user fully closes and reopens the browser.
self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((names) =>
                Promise.all(
                    names
                        .filter((name) => name.startsWith('studyportal-') && !CURRENT_CACHES.includes(name))
                        .map((name) => caches.delete(name))
                )
            )
            .then(() => self.clients.claim())
    );
});

// Lets the page talk to the SW: check how much is cached, or flush it
// (the latter is called from AuthContext.js on logout / session expiry,
// so a second person logging in on the same device never sees the first
// person's cached materials).
self.addEventListener('message', (event) => {
    if (!event.data) return;

    if (event.data.type === 'CLEAR_USER_DATA_CACHE') {
        event.waitUntil(
            Promise.all([caches.delete(API_CACHE), caches.delete(MATERIAL_CACHE)]).then(() => {
                event.source?.postMessage({ type: 'USER_DATA_CACHE_CLEARED' });
            })
        );
    }

    if (event.data.type === 'GET_MATERIAL_CACHE_COUNT') {
        event.waitUntil(
            caches.open(MATERIAL_CACHE)
                .then((cache) => cache.keys())
                .then((keys) => {
                    event.source?.postMessage({ type: 'MATERIAL_CACHE_COUNT', count: keys.length });
                })
        );
    }
});

// ── Push notifications (unchanged) ──────────────────────────────────────
self.addEventListener('push', (event) => {
    let data = {};
    try {
        data = event.data ? event.data.json() : {};
    } catch (e) {
        data = { title: 'New Notification', body: event.data ? event.data.text() : '' };
    }

    const title = data.title || 'StudyPortal CSE';
    const options = {
        body: data.body || '',
        icon: '/logo192.png',
        badge: '/favicon.ico',
        tag: data.tag || 'studyportal-notif',
        renotify: true,
        data: { url: data.url || '/' },
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = event.notification.data?.url || '/';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.navigate(targetUrl);
                    return client.focus();
                }
            }
            if (clients.openWindow) return clients.openWindow(targetUrl);
        })
    );
});
