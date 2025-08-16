// Service Worker for Push Notifications
const CACHE_NAME = "jurnal-pkl-v1";

// Install event
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  self.skipWaiting();
});

// Activate event
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  event.waitUntil(self.clients.claim());
});

// Push event handler
self.addEventListener("push", (event) => {
  console.log("Push event received:", event);

  let notificationData = {
    title: "🔔 Reminder Absensi PKL",
    body: "Jangan lupa untuk absen hari ini!",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    tag: "attendance-reminder",
    data: {
      url: "/siswa/absensi",
    },
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (e) {
      console.error("Error parsing push data:", e);
    }
  }

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      requireInteraction: true,
      actions: [
        {
          action: "attend",
          title: "Absen Sekarang",
          icon: "/icons/check-icon.png",
        },
        {
          action: "later",
          title: "Nanti",
          icon: "/icons/clock-icon.png",
        },
      ],
    }
  );

  event.waitUntil(promiseChain);
});

// Notification click event handler
self.addEventListener("notificationclick", (event) => {
  console.log("Notification click received:", event);

  event.notification.close();

  const action = event.action;
  const notificationData = event.notification.data || {};

  let urlToOpen = "/";

  if (action === "attend") {
    urlToOpen = "/siswa/absensi";
  } else if (action === "later") {
    // Just close the notification
    return;
  } else {
    // Default click - open the app or go to attendance page
    urlToOpen = notificationData.url || "/siswa/absensi";
  }

  const promiseChain = self.clients
    .matchAll({
      type: "window",
      includeUncontrolled: true,
    })
    .then((windowClients) => {
      // Check if app is already open
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        const clientUrl = new URL(client.url);

        if (clientUrl.origin === self.location.origin) {
          // App is open, navigate to the target page
          client.navigate(urlToOpen);
          return client.focus();
        }
      }

      // App is not open, open new window
      return self.clients.openWindow(urlToOpen);
    });

  event.waitUntil(promiseChain);
});

// Background sync for offline functionality
self.addEventListener("sync", (event) => {
  console.log("Background sync event:", event.tag);

  if (event.tag === "attendance-sync") {
    event.waitUntil(syncAttendanceData());
  }
});

// Function to sync attendance data when back online
async function syncAttendanceData() {
  try {
    // Get offline attendance data from IndexedDB or localStorage
    const offlineData = JSON.parse(
      localStorage.getItem("offlineAttendance") || "[]"
    );

    if (offlineData.length > 0) {
      // Send offline data to server
      for (const attendance of offlineData) {
        try {
          const response = await fetch("/api/attendance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(attendance),
          });

          if (response.ok) {
            // Remove synced data from offline storage
            const index = offlineData.indexOf(attendance);
            offlineData.splice(index, 1);
          }
        } catch (error) {
          console.error("Failed to sync attendance:", error);
        }
      }

      // Update offline storage
      localStorage.setItem("offlineAttendance", JSON.stringify(offlineData));
    }
  } catch (error) {
    console.error("Error in syncAttendanceData:", error);
  }
}

// Fetch event for caching
self.addEventListener("fetch", (event) => {
  // Only handle GET requests to our domain
  if (
    event.request.method === "GET" &&
    event.request.url.startsWith(self.location.origin)
  ) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
    );
  }
});
