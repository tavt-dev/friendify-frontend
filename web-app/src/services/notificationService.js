import { API_ENDPOINTS } from '../config/apiConfig';
import { apiFetch } from './apiHelper';

/**
 * Get notifications with pagination
 * @param {number} page - Page number (default: 1)
 * @param {number} size - Page size (default: 20)
 * @returns {Promise<{data: any, status: number}>}
 */
export const getNotifications = async (page = 1, size = 20) => {
  if (page < 1) {
    throw new Error('Page must be greater than 0');
  }
  if (size < 1) {
    throw new Error('Size must be greater than 0');
  }

  try {
    const endpoint = `${API_ENDPOINTS.NOTIFICATION.LIST}?page=${page}&size=${size}`;
    return await apiFetch(endpoint);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Mark a notification as read
 * @param {string} notificationId - The notification ID
 * @returns {Promise<{data: any, status: number}>}
 */
export const markAsRead = async (notificationId) => {
  if (!notificationId || typeof notificationId !== 'string') {
    throw new Error('Notification ID is required');
  }

  try {
    return await apiFetch(API_ENDPOINTS.NOTIFICATION.MARK_READ.replace(':id', notificationId), {
      method: 'PUT',
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 * @returns {Promise<{data: any, status: number}>}
 */
export const markAllAsRead = async () => {
  try {
    return await apiFetch(API_ENDPOINTS.NOTIFICATION.MARK_ALL_READ, {
      method: 'PUT',
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Delete a notification
 * @param {string} notificationId - The notification ID
 * @returns {Promise<{data: any, status: number}>}
 */
export const deleteNotification = async (notificationId) => {
  if (!notificationId || typeof notificationId !== 'string') {
    throw new Error('Notification ID is required');
  }

  try {
    return await apiFetch(API_ENDPOINTS.NOTIFICATION.DELETE.replace(':id', notificationId), {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};
