import httpClient from "../configurations/httpClient";
import { API, CONFIG } from "../configurations/configuration";
import { getToken } from "./localStorageService";
import { getApiUrl, API_ENDPOINTS } from "../config/apiConfig";

export const getMyInfo = async () => {
  return await httpClient.get(API.MY_INFO, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

export const updateProfile = async (profileData) => {
  return await httpClient.put(API.UPDATE_PROFILE, profileData, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
};

export const uploadAvatar = async (formData) => {
  return await httpClient.put(API.UPDATE_AVATAR, formData, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

export const uploadBackground = async (formData) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No token found');
    }

    console.log('Uploading background to:', `${CONFIG.API_GATEWAY}${API.UPDATE_BACKGROUND}`);

    // Use fetch directly for FormData to avoid axios issues with multipart/form-data
    const response = await fetch(`${CONFIG.API_GATEWAY}${API.UPDATE_BACKGROUND}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type - browser will set it with boundary for FormData
      },
      body: formData,
    });

    console.log('Background upload response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Background upload error:', errorData);
      throw { response: { status: response.status, data: errorData } };
    }

    const data = await response.json();
    console.log('Background upload success:', data);
    return { data, status: response.status };
  } catch (error) {
    console.error('Error uploading background:', error);
    // If it's already formatted error, re-throw
    if (error.response) {
      throw error;
    }
    // Otherwise, wrap it
    throw { response: { status: error.status || 500, data: { message: error.message } } };
  }
};

export const search = async (keyword) => {
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
};

/**
 * Get user profile by ID
 * @param {string} userId - User ID
 * @returns {Promise<{data: any, status: number}>}
 */
export const getUserProfileById = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const endpoint = API_ENDPOINTS.USER.GET_PROFILE.replace(':id', encodeURIComponent(String(userId).trim()));
    const url = getApiUrl(endpoint);
    
    console.log('Fetching user profile from:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Get user profile API error:', response.status, errorData);
      throw { response: { status: response.status, data: errorData } };
    }

    const data = await response.json();
    console.log('User profile response:', data);
    return { data, status: response.status };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};