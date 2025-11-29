import { API_ENDPOINTS } from '../config/apiConfig';
import { apiFetch } from './apiHelper';

/**
 * Get all pages
 * @returns {Promise<{data: any, status: number}>}
 */
export const getPages = async () => {
  try {
    return await apiFetch(API_ENDPOINTS.PAGE.LIST);
  } catch (error) {
    console.error('Error fetching pages:', error);
    throw error;
  }
};

/**
 * Get suggested pages
 * @returns {Promise<{data: any, status: number}>}
 */
export const getSuggestedPages = async () => {
  try {
    return await apiFetch(API_ENDPOINTS.PAGE.SUGGESTED);
  } catch (error) {
    console.error('Error fetching suggested pages:', error);
    throw error;
  }
};

/**
 * Follow a page
 * @param {string} pageId - The page ID
 * @returns {Promise<{data: any, status: number}>}
 */
export const followPage = async (pageId) => {
  if (!pageId || typeof pageId !== 'string') {
    throw new Error('Page ID is required');
  }

  try {
    return await apiFetch(API_ENDPOINTS.PAGE.FOLLOW.replace(':id', pageId), {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error following page:', error);
    throw error;
  }
};

/**
 * Unfollow a page
 * @param {string} pageId - The page ID
 * @returns {Promise<{data: any, status: number}>}
 */
export const unfollowPage = async (pageId) => {
  if (!pageId || typeof pageId !== 'string') {
    throw new Error('Page ID is required');
  }

  try {
    return await apiFetch(API_ENDPOINTS.PAGE.UNFOLLOW.replace(':id', pageId), {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error unfollowing page:', error);
    throw error;
  }
};
