import { API_ENDPOINTS } from '../config/apiConfig';
import { apiFetch } from './apiHelper';

/**
 * Get all notifications for current user with pagination
 * @param {number} page - Page number (default: 1)
 * @param {number} size - Page size (default: 20)
 */
export const getNotifications = async (page = 1, size = 20) => {
  const endpoint = `${API_ENDPOINTS.NOTIFICATION.LIST}?page=${page}&size=${size}`;
  return apiFetch(endpoint);
};

/**
 * Mark a notification as read
 * @param {string} notificationId - The notification ID
 */
export const markAsRead = async (notificationId) => {
  return apiFetch(API_ENDPOINTS.NOTIFICATION.MARK_READ.replace(':id', notificationId), {
    method: 'PUT',
  });
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async () => {
  return apiFetch(API_ENDPOINTS.NOTIFICATION.MARK_ALL_READ, {
    method: 'PUT',
  });
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async () => {
  return apiFetch(API_ENDPOINTS.NOTIFICATION.UNREAD_COUNT);
};
