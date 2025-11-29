import { API_ENDPOINTS } from '../config/apiConfig';
import { apiFetch } from './apiHelper';

/**
 * Get friend requests with pagination
 * @param {number} page - Page number (default: 1)
 * @param {number} size - Page size (default: 20)
 * @returns {Promise<{data: any, status: number}>}
 */
export const getFriendRequests = async (page = 1, size = 20) => {
  if (page < 1) {
    throw new Error('Page must be greater than 0');
  }
  if (size < 1) {
    throw new Error('Size must be greater than 0');
  }

  try {
    return await apiFetch(`${API_ENDPOINTS.FRIEND.RECEIVED_REQUESTS}?page=${page}&size=${size}`);
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    throw error;
  }
};

/**
 * Get friend suggestions
 * @param {number} page - Page number (default: 1)
 * @param {number} size - Page size (default: 20)
 * @returns {Promise<{data: any, status: number}>}
 */
export const getFriendSuggestions = async (page = 1, size = 20) => {
  if (page < 1) {
    throw new Error('Page must be greater than 0');
  }
  if (size < 1) {
    throw new Error('Size must be greater than 0');
  }

  try {
    return await apiFetch(`${API_ENDPOINTS.FRIEND.SUGGESTIONS}?page=${page}&size=${size}`);
  } catch (error) {
    console.error('Error fetching friend suggestions:', error);
    throw error;
  }
};

/**
 * Get all friends with pagination
 * @param {number} page - Page number (default: 1)
 * @param {number} size - Page size (default: 20)
 * @returns {Promise<{data: any, status: number}>}
 */
export const getAllFriends = async (page = 1, size = 20) => {
  if (page < 1) {
    throw new Error('Page must be greater than 0');
  }
  if (size < 1) {
    throw new Error('Size must be greater than 0');
  }

  try {
    return await apiFetch(`${API_ENDPOINTS.FRIEND.LIST_FRIENDS}?page=${page}&size=${size}`);
  } catch (error) {
    console.error('Error fetching friends:', error);
    throw error;
  }
};

/**
 * Accept a friend request
 * @param {string} friendId - The friend/user ID
 * @returns {Promise<{data: any, status: number}>}
 */
export const acceptFriendRequest = async (friendId) => {
  if (!friendId || typeof friendId !== 'string') {
    throw new Error('Friend ID is required');
  }

  try {
    return await apiFetch(API_ENDPOINTS.FRIEND.ACCEPT_REQUEST.replace(':id', friendId), {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    throw error;
  }
};

/**
 * Decline a friend request
 * @param {string} friendId - The friend/user ID
 * @returns {Promise<{data: any, status: number}>}
 */
export const declineFriendRequest = async (friendId) => {
  if (!friendId || typeof friendId !== 'string') {
    throw new Error('Friend ID is required');
  }

  try {
    return await apiFetch(API_ENDPOINTS.FRIEND.REJECT_REQUEST.replace(':id', friendId), {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error declining friend request:', error);
    throw error;
  }
};

/**
 * Send a friend request
 * @param {string} userId - The user ID
 * @returns {Promise<{data: any, status: number}>}
 */
export const addFriend = async (userId) => {
  if (!userId || typeof userId !== 'string') {
    throw new Error('User ID is required');
  }

  try {
    return await apiFetch(API_ENDPOINTS.FRIEND.SEND_REQUEST.replace(':id', userId), {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
};

/**
 * Remove a friend
 * @param {string} friendId - The friend ID
 * @returns {Promise<{data: any, status: number}>}
 */
export const removeFriend = async (friendId) => {
  if (!friendId || typeof friendId !== 'string') {
    throw new Error('Friend ID is required');
  }

  try {
    return await apiFetch(API_ENDPOINTS.FRIEND.REMOVE_FRIEND.replace(':id', friendId), {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error removing friend:', error);
    throw error;
  }
};

/**
 * Get sent friend requests with pagination
 * @param {number} page - Page number (default: 1)
 * @param {number} size - Page size (default: 20)
 * @returns {Promise<{data: any, status: number}>}
 */
export const getSentFriendRequests = async (page = 1, size = 20) => {
  if (page < 1) {
    throw new Error('Page must be greater than 0');
  }
  if (size < 1) {
    throw new Error('Size must be greater than 0');
  }

  try {
    return await apiFetch(`${API_ENDPOINTS.FRIEND.SENT_REQUESTS}?page=${page}&size=${size}`);
  } catch (error) {
    console.error('Error fetching sent friend requests:', error);
    throw error;
  }
};

/**
 * Search friends with friendship status
 * @param {string} keyword - Search keyword
 * @returns {Promise<{data: {result: Array}, status: number}>}
 */
export const searchFriends = async (keyword) => {
  if (!keyword || keyword.trim().length === 0) {
    return { data: { result: [] }, status: 200 };
  }

  try {
    return await apiFetch(`${API_ENDPOINTS.FRIEND.SEARCH}?keyword=${encodeURIComponent(keyword.trim())}`);
  } catch (error) {
    console.error('Error searching friends:', error);
    throw error;
  }
};
