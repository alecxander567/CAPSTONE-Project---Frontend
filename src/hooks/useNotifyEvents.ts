import { useState, useEffect, useRef } from "react";
import axios from "axios";

const WS_URL = "ws://127.0.0.1:8000/ws/notifications/";
const API_BASE_URL = "http://localhost:8000";
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_INTERVAL = 2000;

let globalWs: WebSocket | null = null;
let globalPingInterval: number | null = null;

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingIds, setDeletingIds] = useState<number[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/notifications/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (isMountedRef.current) {
          setNotifications(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
        if (isMountedRef.current) {
          setError("Failed to fetch notifications.");
        }
      }
    };

    fetchNotifications();

    const connectWS = () => {
      if (globalWs?.readyState === WebSocket.OPEN) {
        setIsConnected(true);
        return;
      }

      if (globalWs?.readyState === WebSocket.CONNECTING) {
        return;
      }

      if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
        console.error("Max reconnection attempts reached");
        setError("Unable to establish WebSocket connection");
        return;
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      if (globalPingInterval) {
        clearInterval(globalPingInterval);
        globalPingInterval = null;
      }

      if (globalWs) {
        globalWs.close();
        globalWs = null;
      }

      try {
        const token = localStorage.getItem("token");
        const wsUrl = token ? `${WS_URL}?token=${token}` : WS_URL;

        globalWs = new WebSocket(wsUrl);

        globalWs.onopen = () => {
          if (isMountedRef.current) {
            setIsConnected(true);
            setError(null);
          }
          reconnectAttemptsRef.current = 0;

          if (globalWs?.readyState === WebSocket.OPEN) {
            globalWs.send("ping");
          }

          globalPingInterval = window.setInterval(() => {
            if (globalWs?.readyState === WebSocket.OPEN) {
              globalWs.send("ping");
            } else {
              if (globalPingInterval) {
                clearInterval(globalPingInterval);
                globalPingInterval = null;
              }
            }
          }, 30000);
        };

        globalWs.onmessage = (event) => {
          if (!isMountedRef.current) return;

          try {
            if (event.data === "pong") {
              return;
            }

            const data = JSON.parse(event.data);

            setNotifications((prev) => [data, ...prev]);

            if (Notification.permission === "granted") {
              new Notification(data.title, {
                body: data.message,
                icon: "/notification-icon.png",
              });
            }
          } catch (err) {
            console.error("Failed to parse message:", err);
          }
        };

        globalWs.onerror = (err) => {
          console.error("WebSocket error:", err);
          if (isMountedRef.current) {
            setIsConnected(false);
          }
        };

        globalWs.onclose = (event) => {
          if (globalPingInterval) {
            clearInterval(globalPingInterval);
            globalPingInterval = null;
          }

          if (!isMountedRef.current) return;

          setIsConnected(false);

          if (event.code !== 1000 && event.code !== 1001) {
            reconnectAttemptsRef.current += 1;
            reconnectTimeoutRef.current = window.setTimeout(() => {
              connectWS();
            }, RECONNECT_INTERVAL);
          }
        };
      } catch (err) {
        console.error("Failed to create WebSocket:", err);
        if (isMountedRef.current) {
          setError("Failed to establish WebSocket connection");
        }
        reconnectAttemptsRef.current += 1;

        reconnectTimeoutRef.current = window.setTimeout(
          connectWS,
          RECONNECT_INTERVAL,
        );
      }
    };

    connectWS();

    return () => {
      isMountedRef.current = false;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const deleteNotification = async (notificationId: number) => {
    setDeletingIds((prev) => [...prev, notificationId]);

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      setSuccessMessage("Notification deleted successfully");
    } catch (err) {
      console.error("Failed to delete notification:", err);
      setErrorMessage("Failed to delete notification");
      throw err;
    } finally {
      setDeletingIds((prev) => prev.filter((id) => id !== notificationId));
    }
  };

  const deleteAllNotifications = async () => {
    setIsDeleting(true);

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/notifications/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications([]);
      setSuccessMessage("All notifications cleared successfully");
    } catch (err) {
      console.error("Failed to delete all notifications:", err);
      setErrorMessage("Failed to delete all notifications");
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  const clearSuccessMessage = () => setSuccessMessage(null);
  const clearErrorMessage = () => setErrorMessage(null);

  return {
    notifications,
    error,
    isConnected,
    isDeleting,
    deletingIds,
    successMessage,
    errorMessage,
    deleteNotification,
    deleteAllNotifications,
    clearSuccessMessage,
    clearErrorMessage,
  };
};

export const cleanupWebSocket = () => {
  if (globalPingInterval) {
    clearInterval(globalPingInterval);
    globalPingInterval = null;
  }
  if (globalWs) {
    globalWs.close(1000);
    globalWs = null;
  }
};
