import { API_ENDPOINTS } from '../config/apiConfig';
import { apiFetch } from './apiHelper';

/**
 * Get user settings
 * @returns {Promise<{data: any, status: number}>}
 */
export const getSettings = async () => {
  try {
    return await apiFetch('/settings');
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }
};

/**
 * Update settings for a specific section
 * @param {string} section - The settings section to update
 * @param {Object} settingsData - The settings data to update
 * @returns {Promise<{data: any, status: number}>}
 */
export const updateSettings = async (section, settingsData) => {
  if (!section || typeof section !== 'string') {
    throw new Error('Section is required and must be a string');
  }
  if (!settingsData || typeof settingsData !== 'object') {
    throw new Error('Settings data is required and must be an object');
  }

  try {
    return await apiFetch(`/settings/${section}`, {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};

/**
 * Change user password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<{data: any, status: number}>}
 */
export const changePassword = async (currentPassword, newPassword) => {
  if (!currentPassword || typeof currentPassword !== 'string') {
    throw new Error('Current password is required');
  }
  if (!newPassword || typeof newPassword !== 'string') {
    throw new Error('New password is required');
  }

  try {
    return await apiFetch('/settings/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

/**
 * Delete user account
 * @returns {Promise<{data: any, status: number}>}
 */
export const deleteAccount = async () => {
  try {
    return await apiFetch('/settings/account', {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
};
