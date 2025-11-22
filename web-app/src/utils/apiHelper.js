import { getToken } from '../services/localStorageService';

export const handleApiError = (error) => {
  if (error.response) {
    return {
      message: error.response.data?.message || 'An error occurred',
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    return {
      message: 'No response from server. Using cached data.',
      status: 0,
      data: null,
    };
  } else {
    return {
      message: error.message || 'An unexpected error occurred',
      status: -1,
      data: null,
    };
  }
};

export const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = getToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const requestOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, requestOptions);
    const data = await response.json();

    if (!response.ok) {
      throw {
        response: {
          status: response.status,
          data,
        },
      };
    }

    return { data, status: response.status };
  } catch (error) {
    throw error;
  }
};

export const withFallback = async (apiCall, fallbackData, useMock = false) => {
  if (useMock) {
    return fallbackData;
  }

  try {
    return await apiCall();
  } catch (error) {
    return fallbackData;
  }
};

export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
};

export const getFromLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Failed to get from localStorage:', error);
    return defaultValue;
  }
};

export const removeFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
    return false;
  }
};

export const clearLocalStorageByPrefix = (prefix) => {
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Extract array from API response with pagination info
 * @param {Object} data - API response data
 * @returns {{items: Array, totalPages: number}}
 */
export const extractArrayFromResponse = (data) => {
  if (!data) return { items: [], totalPages: 1 };
  
  if (data.result?.data && Array.isArray(data.result.data)) {
    return { items: data.result.data, totalPages: data.result.totalPages || 1 };
  }
  if (data.result?.content && Array.isArray(data.result.content)) {
    return { items: data.result.content, totalPages: data.result.totalPages || 1 };
  }
  if (data.result && Array.isArray(data.result)) {
    return { items: data.result, totalPages: 1 };
  }
  if (data.content && Array.isArray(data.content)) {
    return { items: data.content, totalPages: data.totalPages || 1 };
  }
  if (data.data && Array.isArray(data.data)) {
    return { items: data.data, totalPages: data.totalPages || 1 };
  }
  if (Array.isArray(data)) {
    return { items: data, totalPages: 1 };
  }
  
  // Try to find any array in the response object
  if (typeof data === 'object') {
    const arrays = Object.values(data).filter(v => Array.isArray(v));
    if (arrays.length > 0) {
      return { items: arrays[0], totalPages: 1 };
    }
  }
  
  return { items: [], totalPages: 1 };
};
