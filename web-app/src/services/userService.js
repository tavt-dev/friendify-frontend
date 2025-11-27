import { API_ENDPOINTS } from "../config/apiConfig";
import { apiFetch } from "./apiHelper";

/**
 * Get current user's profile information
 * @returns {Promise<{data: any, status: number}>}
 */
export const getMyInfo = async () => {
  return await apiFetch(API_ENDPOINTS.USER.MY_PROFILE);
};

/**
 * Update user profile
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<{data: any, status: number}>}
 */
export const updateProfile = async (profileData) => {
  return await apiFetch(API_ENDPOINTS.USER.UPDATE_PROFILE, {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
};

/**
 * Upload avatar image
 * @param {FormData} formData - FormData containing the image file
 * @returns {Promise<{data: any, status: number}>}
 */
export const uploadAvatar = async (formData) => {
  return await apiFetch(API_ENDPOINTS.USER.UPDATE_AVATAR, {
    method: 'PUT',
    body: formData,
  });
};

/**
 * Upload background/cover image
 * @param {FormData} formData - FormData containing the image file
 * @returns {Promise<{data: any, status: number}>}
 */
export const uploadBackground = async (formData) => {
  return apiFetch(API_ENDPOINTS.USER.UPDATE_BACKGROUND, {
    method: 'PUT',
    body: formData,
  });
};

/**
 * Search users
 * @param {string} keyword - Search keyword
 * @returns {Promise<{data: any, status: number}>}
 */
export const search = async (keyword) => {
  return await apiFetch(API_ENDPOINTS.USER.SEARCH, {
    method: 'POST',
    body: JSON.stringify({ keyword }),
  });
};

/**
 * Get user profile by ID
 * @param {string} userId - User ID
 * @param {boolean} suppress404 - If true, suppress 404 errors (default: true)
 * @returns {Promise<{data: any, status: number}>}
 */
export const getUserProfileById = async (userId, suppress404 = true) => {
  if (!userId) {
    throw { response: { status: 400, data: { message: 'User ID is required' } } };
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
    throw error;
  }
};