import { getToken } from './localStorageService';
import { getApiUrl } from '../config/apiConfig';

/**
 * Generic fetch helper with error handling
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @param {boolean} options.suppress404 - If true, don't throw error for 404, return null data instead
 * @returns {Promise<{data: any, status: number}>}
 */
export const apiFetch = async (endpoint, options = {}) => {
  const { suppress404 = false, ...fetchOptions } = options;
  const url = endpoint.startsWith('http') ? endpoint : getApiUrl(endpoint);
  const token = getToken();

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...fetchOptions,
    headers: {
      ...defaultHeaders,
      ...fetchOptions.headers,
    },
  };

  // Don't set Content-Type for FormData - browser will set it with boundary
  if (fetchOptions.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  try {
    const response = await fetch(url, config);

    // Handle 404 specially if suppress404 is true
    if (!response.ok && response.status === 404 && suppress404) {
      return { data: null, status: 404 };
    }

    if (!response.ok) {
      let errorData = {};
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
        } else {
          const text = await response.text();
          errorData = { message: text || `HTTP ${response.status} ${response.statusText}` };
        }
      } catch (parseError) {
        errorData = { message: `HTTP ${response.status} ${response.statusText}` };
      }
      
      throw { response: { status: response.status, data: errorData } };
    }

    const data = await response.json().catch(() => ({}));
    return { data, status: response.status };
  } catch (error) {
    // If it's already formatted error, re-throw
    if (error.response) {
      throw error;
    }
    // Otherwise, wrap it
    throw { 
      response: { 
        status: error.status || 500, 
        data: { 
          message: error.message || 'Network error',
          error: error.name || 'NetworkError'
        } 
      } 
    };
  }
};

