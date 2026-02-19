import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging"; // ✅ added

const firebaseConfig = {
  apiKey: "AIzaSyCXI-bQjmGaXggjtE1UO1EE2lC7vvUC4xo",
  authDomain: "aras-bt-notifications.firebaseapp.com",
  projectId: "aras-bt-notifications",
  storageBucket: "aras-bt-notifications.firebasestorage.app",
  messagingSenderId: "744586628565",
  appId: "1:744586628565:web:6bcd3dff960b1bdea3815c",
  measurementId: "G-MRXLZZX2MQ",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestDeviceToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission denied");
      return null;
    }
    const token = await getToken(messaging, {
      vapidKey:
        "BH7lk2UeUbyHP_vsI9P2Q_FC-Bi_-NqPOplS0ZAXntIGL6gOBmROfsHcVqYyYGC1VwTTSwAof88WtVG-syjVzT8",
    });
    console.log("Device token:", token);
    return token;
  } catch (err) {
    console.error("Error getting device token", err);
    return null;
  }
};

export const listenMessages = (callback) => {
  onMessage(messaging, (payload) => {
    console.log("Message received:", payload);
    callback(payload);
  });
};
