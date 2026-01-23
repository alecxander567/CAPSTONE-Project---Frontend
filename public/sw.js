self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("push", (event) => {
  let data = { title: "Notification", message: "You have a new notification" };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error("Failed to parse push data:", e);
    }
  }

  const options = {
    body: data.message || data.body,
    icon: "/notification-icon.png",
    badge: "/notification-badge.png",
    vibrate: [200, 100, 200],
    requireInteraction: false,
    tag: "event-notification",
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(clients.openWindow("/notifications"));
});
