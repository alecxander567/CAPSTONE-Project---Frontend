import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000";
const POLLING_INTERVAL = 5000; 

const sharedNotificationsMap = new Map<number, any>();
let sharedListeners = new Set<(notifications: any[]) => void>();

let isFetchingNotifications = false;
let pollingIntervalId: number | null = null;

const notifyAllListeners = () => {
  const allNotifications = Array.from(sharedNotificationsMap.values()).sort(
    (a, b) => b.id - a.id,
  );
  sharedListeners.forEach((listener) => listener(allNotifications));
};

const fetchNotifications = async () => {
  if (isFetchingNotifications) return;

  isFetchingNotifications = true;

  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_BASE_URL}/notifications/`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    sharedNotificationsMap.clear();
    response.data.forEach((n: any) => {
      sharedNotificationsMap.set(n.id, n);
    });

    notifyAllListeners();
  } catch (err) {
    console.error("Failed to fetch notifications:", err);
  } finally {
    isFetchingNotifications = false;
  }
};

const startPolling = () => {
  if (pollingIntervalId !== null) return; 

  fetchNotifications();

  pollingIntervalId = window.setInterval(() => {
    fetchNotifications();
  }, POLLING_INTERVAL);
};

const stopPolling = () => {
  if (pollingIntervalId !== null) {
    clearInterval(pollingIntervalId);
    pollingIntervalId = null;
  }
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>(
    Array.from(sharedNotificationsMap.values()).sort((a, b) => b.id - a.id),
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingIds, setDeletingIds] = useState<number[]>([]);
  const [markingIds, setMarkingIds] = useState<number[]>([]);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const updateLocalState = (newNotifications: any[]) => {
      if (isMountedRef.current) {
        setNotifications(newNotifications);
      }
    };
    sharedListeners.add(updateLocalState);

    startPolling();

    return () => {
      isMountedRef.current = false;
      sharedListeners.delete(updateLocalState);

      if (sharedListeners.size === 0) {
        stopPolling();
        sharedNotificationsMap.clear();
      }
    };
  }, []);

  const markAsRead = async (notificationId: number) => {
    setMarkingIds((prev) => [...prev, notificationId]);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const notification = sharedNotificationsMap.get(notificationId);
      if (notification) {
        notification.is_read = true;
        notifyAllListeners();
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      setErrorMessage("Failed to mark notification as read");
    } finally {
      setMarkingIds((prev) => prev.filter((id) => id !== notificationId));
    }
  };

  const markAllAsRead = async () => {
    setIsMarkingAll(true);
    try {
      const token = localStorage.getItem("token");
      const unreadIds = Array.from(sharedNotificationsMap.values())
        .filter((n) => !n.is_read)
        .map((n) => n.id);

      await Promise.all(
        unreadIds.map((id) =>
          axios.patch(
            `${API_BASE_URL}/notifications/${id}/read`,
            {},
            { headers: { Authorization: `Bearer ${token}` } },
          ),
        ),
      );

      sharedNotificationsMap.forEach((n) => (n.is_read = true));
      notifyAllListeners();
      setSuccessMessage("All notifications marked as read");
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      setErrorMessage("Failed to mark all as read");
    } finally {
      setIsMarkingAll(false);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    setDeletingIds((prev) => [...prev, notificationId]);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      sharedNotificationsMap.delete(notificationId);
      notifyAllListeners();
      setSuccessMessage("Notification deleted successfully");
    } catch (err) {
      console.error("Failed to delete notification:", err);
      setErrorMessage("Failed to delete notification");
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

      sharedNotificationsMap.clear();
      notifyAllListeners();
      setSuccessMessage("All notifications cleared successfully");
    } catch (err) {
      console.error("Failed to delete all notifications:", err);
      setErrorMessage("Failed to delete all notifications");
    } finally {
      setIsDeleting(false);
    }
  };

  const clearSuccessMessage = () => setSuccessMessage(null);
  const clearErrorMessage = () => setErrorMessage(null);

  const refresh = async () => {
    await fetchNotifications();
  };

  return {
    notifications,
    isDeleting,
    deletingIds,
    markingIds,
    isMarkingAll,
    successMessage,
    errorMessage,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    clearSuccessMessage,
    clearErrorMessage,
    refresh,
  };
};
