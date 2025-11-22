import { API_ENDPOINTS } from '../config/apiConfig';
import { apiFetch } from './apiHelper';

export const getSettings = async () => {
  return apiFetch('/settings');
};

export const updateSettings = async (section, settingsData) => {
  return apiFetch(`/settings/${section}`, {
    method: 'PUT',
    body: JSON.stringify(settingsData),
  });
};

export const changePassword = async (currentPassword, newPassword) => {
  return apiFetch('/settings/password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
};

export const deleteAccount = async () => {
  return apiFetch('/settings/account', {
    method: 'DELETE',
  });
};
