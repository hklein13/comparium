/**
 * Firebase Messaging Service Worker
 *
 * This file handles background push notifications from Firebase Cloud Messaging.
 * It MUST be placed in the root of the domain (same level as index.html).
 *
 * When a push notification arrives and the browser/tab is not in focus,
 * this service worker displays the notification to the user.
 */

// Import Firebase scripts for service worker context
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
// This config must match the one in firebase-init.js
firebase.initializeApp({
  apiKey: 'AIzaSyDExicgmY78u4NAWVJngqaZkhKdmAbebjM',
  authDomain: 'comparium-21b69.firebaseapp.com',
  projectId: 'comparium-21b69',
  storageBucket: 'comparium-21b69.firebasestorage.app',
  messagingSenderId: '925744346774',
  appId: '1:925744346774:web:77453c0374054d5b0d74b7',
});

// Retrieve Firebase Messaging instance
const messaging = firebase.messaging();

/**
 * Handle background messages
 * This is called when a message arrives and the web app is NOT in the foreground
 */
messaging.onBackgroundMessage(payload => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  // Extract notification data
  const notificationTitle = payload.notification?.title || 'Comparium';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: payload.data?.notificationId || 'comparium-notification',
    data: {
      url: payload.data?.url || '/dashboard',
      notificationId: payload.data?.notificationId,
    },
  };

  // Show the notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

/**
 * Handle notification click
 * Opens the app and navigates to the relevant page
 */
self.addEventListener('notificationclick', event => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);

  // Close the notification
  event.notification.close();

  // Get the URL to open (from notification data or default to dashboard)
  const relativeUrl = event.notification.data?.url || '/dashboard';
  // Convert to absolute URL for cross-origin safety
  const urlToOpen = new URL(relativeUrl, self.location.origin).href;

  // Open or focus the app window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Check if there's already a Comparium window open
      for (const client of windowClients) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(urlToOpen);
          return;
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
