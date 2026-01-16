// Configuration - adjust these values as needed
const NOTIFICATION_INTERVAL_MS = 10000; // 10 seconds
const MAX_NOTIFICATIONS = 10;
const NOTIFICATION_TITLE = 'Periodic Notification';
const NOTIFICATION_OPTIONS = {
  icon: '/favicon.ico',
  badge: '/favicon.ico',
  vibrate: [200, 100, 200],
  tag: 'periodic-notification',
  requireInteraction: false
};

// State
let notificationIntervalId = null;
let notificationCount = 0;

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);

  if (event.data.type === 'START_NOTIFICATIONS') {
    startPeriodicNotifications();
  } else if (event.data.type === 'STOP_NOTIFICATIONS') {
    stopPeriodicNotifications();
  } else if (event.data.type === 'GET_STATE') {
    // Respond with current state
    event.ports[0].postMessage({
      type: 'STATE_RESPONSE',
      isRunning: notificationIntervalId !== null,
      notificationCount: notificationCount
    });
  }
});

function startPeriodicNotifications() {
  // Clear any existing interval
  stopPeriodicNotifications();

  // Reset counter
  notificationCount = 0;

  console.log('[Service Worker] Starting periodic notifications');

  // Send first notification immediately
  sendNotification();

  // Set up interval for subsequent notifications
  notificationIntervalId = setInterval(() => {
    if (notificationCount >= MAX_NOTIFICATIONS) {
      console.log('[Service Worker] Max notifications reached, stopping');
      stopPeriodicNotifications();
      notifyClientsComplete();
      return;
    }

    sendNotification();
  }, NOTIFICATION_INTERVAL_MS);
}

function stopPeriodicNotifications() {
  if (notificationIntervalId !== null) {
    clearInterval(notificationIntervalId);
    notificationIntervalId = null;
    console.log('[Service Worker] Periodic notifications stopped');
  }
}

function sendNotification() {
  notificationCount++;

  const body = `This is notification ${notificationCount} of ${MAX_NOTIFICATIONS}`;
  const timestamp = new Date().toLocaleTimeString();

  console.log(`[Service Worker] Sending notification ${notificationCount}/${MAX_NOTIFICATIONS}`);

  self.registration.showNotification(NOTIFICATION_TITLE, {
    ...NOTIFICATION_OPTIONS,
    body: `${body}\nSent at: ${timestamp}`,
    data: {
      count: notificationCount,
      timestamp: Date.now()
    }
  });
}

async function notifyClientsComplete() {
  const clients = await self.clients.matchAll({
    includeUncontrolled: true,
    type: 'window'
  });

  clients.forEach((client) => {
    client.postMessage({
      type: 'NOTIFICATIONS_COMPLETE'
    });
  });
}

// Handle notification click events
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event.notification.data);

  event.notification.close();

  // Focus or open the app window
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If a window is already open, focus it
        for (const client of clientList) {
          if ('focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow('/web-notifications/');
        }
      })
  );
});

// Clean up on service worker termination
self.addEventListener('beforeunload', () => {
  stopPeriodicNotifications();
});
