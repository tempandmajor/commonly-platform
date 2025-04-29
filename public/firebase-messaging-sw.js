
// Firebase Cloud Messaging Service Worker

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyDYaHzkXwI-_8on99Y3BqrhRqUvtsQ9nXI",
  authDomain: "commonly-platform.firebaseapp.com",
  projectId: "commonly-platform",
  storageBucket: "commonly-platform.appspot.com",
  messagingSenderId: "959082427909",
  appId: "1:959082427909:web:e92d0f48e27b3382a50e6c",
  measurementId: "G-S63E4DMQ8C"
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background notifications
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click event
self.addEventListener('notificationclick', event => {
  console.log('[firebase-messaging-sw.js] Notification click:', event);
  
  event.notification.close();
  
  // Handle click based on notification data
  const clickAction = event.notification.data?.clickAction;
  if (clickAction) {
    clients.openWindow(clickAction);
  } else {
    // Default action - open the app
    clients.openWindow('/');
  }
});
