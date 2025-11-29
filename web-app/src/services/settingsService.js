import { API_ENDPOINTS } from '../config/apiConfig';
import { apiFetch } from './apiHelper';

/**
 * Get user settings
 * @returns {Promise<{data: any, status: number}>}
 */
export const getSettings = async () => {
  try {
    return await apiFetch(API_ENDPOINTS.SETTINGS.GET);
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }
};

/**
 * Update settings for a specific section
 * @param {string} section - The settings section to update (e.g., 'privacy', 'notifications', 'security')
 * @param {Object} settingsData - The settings data to update
 * @returns {Promise<{data: any, status: number}>}
 */
export const updateSettings = async (section, settingsData) => {
  if (!section) {
    throw new Error('Settings section is required');
  }
  if (!settingsData || typeof settingsData !== 'object') {
    throw new Error('Settings data is required and must be an object');
  }

  try {
    const endpoint = API_ENDPOINTS.SETTINGS.UPDATE.replace(':section', section);
    return await apiFetch(endpoint, {
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
  if (!currentPassword || !newPassword) {
    throw new Error('Current password and new password are required');
  }

  try {
    return await apiFetch(API_ENDPOINTS.SETTINGS.CHANGE_PASSWORD, {
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
    return await apiFetch(API_ENDPOINTS.SETTINGS.DELETE_ACCOUNT, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
};
