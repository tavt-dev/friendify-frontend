import httpClient from "../configurations/httpClient";
import { API } from "../configurations/configuration";
import { getToken } from "./localStorageService";
import { API_ENDPOINTS } from "../config/apiConfig";
import { apiFetch } from "./apiHelper";

/**
 * Get current user's profile information
 * @returns {Promise<{data: any, status: number}>}
 */
export const getMyInfo = async () => {
  try {
    // Use direct endpoint for my-profile
    const endpoint = '/profile/users/my-profile';
    const response = await apiFetch(endpoint);
    return response;
  } catch (error) {
    console.warn('Failed to load profile with new endpoint, trying fallback:', error);
    // Fallback to old method if new endpoint fails
    try {
      const fallbackResponse = await httpClient.get(API.MY_INFO, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      return fallbackResponse;
    } catch (fallbackError) {
      console.error('Both endpoints failed:', fallbackError);
      throw error; // Throw original error
    }
  }
};

/**
 * Update user profile
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<{data: any, status: number}>}
 */
export const updateProfile = async (profileData) => {
  try {
    const endpoint = API_ENDPOINTS.USER.GET_PROFILE.replace(':id', 'my-profile');
    return await apiFetch(endpoint, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  } catch (error) {
    // Fallback to old method
    return await httpClient.put(API.UPDATE_PROFILE, profileData, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });
  }
};

/**
 * Upload avatar image
 * @param {FormData} formData - FormData containing the image file
 * @returns {Promise<{data: any, status: number}>}
 */
export const uploadAvatar = async (formData) => {
  try {
    const endpoint = '/profile/users/avatar';
    return await apiFetch(endpoint, {
      method: 'PUT',
      body: formData,
    });
  } catch (error) {
    // Fallback to old method
    return await httpClient.put(API.UPDATE_AVATAR, formData, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "multipart/form-data",
      },
    });
  }
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
  try {
    return await apiFetch(API_ENDPOINTS.USER.SEARCH, {
      method: 'POST',
      body: JSON.stringify({ keyword }),
    });
  } catch (error) {
    // Fallback to old method
    return await httpClient.post(
      API.SEARCH_USER,
      { keyword: keyword },
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      }
    );
  }
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