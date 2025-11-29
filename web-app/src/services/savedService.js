import { API_ENDPOINTS } from '../config/apiConfig';
import { apiFetch } from './apiHelper';

/**
 * Get saved items with optional filters
 * @param {Object} filters - Filter options
 * @returns {Promise<{data: any, status: number}>}
 */
export const getSavedItems = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([_, v]) => v != null && v !== ''))
    );
    const endpoint = queryParams.toString() 
      ? `${API_ENDPOINTS.SAVED.ITEMS}?${queryParams}` 
      : API_ENDPOINTS.SAVED.ITEMS;
    return await apiFetch(endpoint);
  } catch (error) {
    console.error('Error fetching saved items:', error);
    throw error;
  }
};

/**
 * Add a saved item (post)
 * @param {string} postId - The post ID to save
 * @returns {Promise<{data: any, status: number}>}
 */
export const addSavedItem = async (postId) => {
  if (!postId || typeof postId !== 'string') {
    throw new Error('Post ID is required');
  }

  try {
    return await apiFetch(API_ENDPOINTS.SAVED.ADD.replace(':id', postId), {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error adding saved item:', error);
    throw error;
  }
};

/**
 * Remove a saved item
 * @param {string} itemId - The saved item ID
 * @returns {Promise<{data: any, status: number}>}
 */
export const removeSavedItem = async (itemId) => {
  if (!itemId || typeof itemId !== 'string') {
    throw new Error('Item ID is required');
  }

  try {
    return await apiFetch(API_ENDPOINTS.SAVED.REMOVE.replace(':id', itemId), {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error removing saved item:', error);
    throw error;
  }
};
