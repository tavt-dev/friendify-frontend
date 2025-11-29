import { API_ENDPOINTS } from "../config/apiConfig";
import { apiFetch } from "./apiHelper";

/**
 * Get current user's profile information
 * @returns {Promise<{data: any, status: number}>}
 */
export const getMyInfo = async () => {
  try {
    return await apiFetch(API_ENDPOINTS.USER.MY_PROFILE);
  } catch (error) {
    console.error('Error fetching my info:', error);
    throw error;
  }
};

/**
 * Update user profile
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<{data: any, status: number}>}
 */
export const updateProfile = async (profileData) => {
  if (!profileData || typeof profileData !== 'object') {
    throw new Error('Profile data is required');
  }

  try {
    return await apiFetch(API_ENDPOINTS.USER.UPDATE_PROFILE, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

/**
 * Upload avatar image
 * @param {FormData} formData - FormData containing the image file
 * @returns {Promise<{data: any, status: number}>}
 */
export const uploadAvatar = async (formData) => {
  if (!formData || !(formData instanceof FormData)) {
    throw new Error('FormData is required');
  }

  try {
    return await apiFetch(API_ENDPOINTS.USER.UPDATE_AVATAR, {
      method: 'PUT',
      body: formData,
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};

/**
 * Upload background/cover image
 * @param {FormData} formData - FormData containing the image file
 * @returns {Promise<{data: any, status: number}>}
 */
export const uploadBackground = async (formData) => {
  if (!formData || !(formData instanceof FormData)) {
    throw new Error('FormData is required');
  }

  try {
    return await apiFetch(API_ENDPOINTS.USER.UPDATE_BACKGROUND, {
      method: 'PUT',
      body: formData,
    });
  } catch (error) {
    console.error('Error uploading background:', error);
    throw error;
  }
};

/**
 * Search users
 * @param {string} keyword - Search keyword
 * @returns {Promise<{data: any, status: number}>}
 */
export const search = async (keyword) => {
  if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
    throw new Error('Keyword is required');
  }

  try {
    return await apiFetch(API_ENDPOINTS.USER.SEARCH, {
      method: 'POST',
      body: JSON.stringify({ keyword: keyword.trim() }),
    });
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

/**
 * Get user profile by ID
 * @param {string} userId - User ID
 * @param {boolean} suppress404 - If true, suppress 404 errors (default: true)
 * @returns {Promise<{data: any, status: number}>}
 */
export const getUserProfileById = async (userId, suppress404 = true) => {
  if (!userId || typeof userId !== 'string') {
    throw new Error('User ID is required');
  }

  try {
    const endpoint = API_ENDPOINTS.USER.GET_PROFILE.replace(':id', encodeURIComponent(String(userId).trim()));
    return await apiFetch(endpoint, { suppress404 });
  } catch (error) {
    // If 404 and not suppressed, return empty data instead of throwing
    if (error?.response?.status === 404) {
      return { data: null, status: 404 };
    }
    // Re-throw other errors
    console.error('Error fetching user profile:', error);
    throw error;
  }
};
