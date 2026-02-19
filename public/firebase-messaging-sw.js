importScripts(
  "https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyCXI-bQjmGaXggjtE1UO1EE2lC7vvUC4xo",
  authDomain: "aras-bt-notifications.firebaseapp.com",
  projectId: "aras-bt-notifications",
  storageBucket: "aras-bt-notifications.firebasestorage.app",
  messagingSenderId: "744586628565",
  appId: "1:744586628565:web:6bcd3dff960b1bdea3815c",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: "/favicon.ico",
  });
});
