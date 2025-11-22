import { API_ENDPOINTS } from '../config/apiConfig';
import { apiFetch } from './apiHelper';

export const getNotifications = async (page = 1, size = 20) => {
  const endpoint = `${API_ENDPOINTS.NOTIFICATION.LIST}?page=${page}&size=${size}`;
  return apiFetch(endpoint);
};

export const markAsRead = async (notificationId) => {
  return apiFetch(API_ENDPOINTS.NOTIFICATION.MARK_READ.replace(':id', notificationId), {
    method: 'PUT',
  });
};

export const markAllAsRead = async () => {
  return apiFetch(API_ENDPOINTS.NOTIFICATION.MARK_ALL_READ, {
    method: 'PUT',
  });
};

export const deleteNotification = async (notificationId) => {
  return apiFetch(API_ENDPOINTS.NOTIFICATION.DELETE.replace(':id', notificationId), {
    method: 'DELETE',
  });
};
