/*  */import { getToken } from "./localStorageService";
import { API_CONFIG } from "../config/api.config";
import { mockNotifications } from "../utils/mockDataComplete";

let notifications = [...mockNotifications];

const mockGetNotifications = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          result: notifications
        },
        status: 200
      });
    }, 300);
  });
};

const realGetNotifications = async () => {
  const token = getToken();
  const response = await fetch(`${API_CONFIG.API_BASE_URL}/notifications`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get notifications');
  }

  const data = await response.json();
  return {
    data: {
      result: data
    },
    status: response.status
  };
};

export const getNotifications = async () => {
  if (API_CONFIG.USE_MOCK_DATA) {
    return mockGetNotifications();
  }
  return realGetNotifications();
};

const mockMarkAsRead = async (notificationId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      notifications = notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      resolve({
        data: {
          success: true
        },
        status: 200
      });
    }, 300);
  });
};

const realMarkAsRead = async (notificationId) => {
  const token = getToken();
  const response = await fetch(`${API_CONFIG.API_BASE_URL}/notifications/${notificationId}/read`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to mark notification as read');
  }

  const data = await response.json();
  return {
    data: {
      result: data
    },
    status: response.status
  };
};

export const markAsRead = async (notificationId) => {
  if (API_CONFIG.USE_MOCK_DATA) {
    return mockMarkAsRead(notificationId);
  }
  return realMarkAsRead(notificationId);
};

const mockMarkAllAsRead = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      notifications = notifications.map(n => ({ ...n, isRead: true }));
      resolve({
        data: {
          success: true
        },
        status: 200
      });
    }, 300);
  });
};

const realMarkAllAsRead = async () => {
  const token = getToken();
  const response = await fetch(`${API_CONFIG.API_BASE_URL}/notifications/read-all`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to mark all notifications as read');
  }

  const data = await response.json();
  return {
    data: {
      result: data
    },
    status: response.status
  };
};

export const markAllAsRead = async () => {
  if (API_CONFIG.USE_MOCK_DATA) {
    return mockMarkAllAsRead();
  }
  return realMarkAllAsRead();
};

const mockDeleteNotification = async (notificationId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      notifications = notifications.filter(n => n.id !== notificationId);
      resolve({
        data: {
          success: true
        },
        status: 200
      });
    }, 300);
  });
};

const realDeleteNotification = async (notificationId) => {
  const token = getToken();
  const response = await fetch(`${API_CONFIG.API_BASE_URL}/notifications/${notificationId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete notification');
  }

  return {
    data: {
      success: true
    },
    status: response.status
  };
};

export const deleteNotification = async (notificationId) => {
  if (API_CONFIG.USE_MOCK_DATA) {
    return mockDeleteNotification(notificationId);
  }
  return realDeleteNotification(notificationId);
};
