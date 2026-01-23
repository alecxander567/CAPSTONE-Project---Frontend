// src/serviceWorker.ts
export const registerSW = async () => {
  if ("serviceWorker" in navigator) {
    await navigator.serviceWorker.register("/sw.js");
  }
};
