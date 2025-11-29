import { API_ENDPOINTS } from '../config/apiConfig';
import { apiFetch } from './apiHelper';

/**
 * Get current user's groups
 * @returns {Promise<{data: any, status: number}>}
 */
export const getMyGroups = async () => {
  try {
    return await apiFetch(API_ENDPOINTS.GROUP.MY_GROUPS);
  } catch (error) {
    console.error('Error fetching my groups:', error);
    throw error;
  }
};

/**
 * Get suggested groups
 * @returns {Promise<{data: any, status: number}>}
 */
export const getSuggestedGroups = async () => {
  try {
    return await apiFetch(API_ENDPOINTS.GROUP.SUGGESTED);
  } catch (error) {
    console.error('Error fetching suggested groups:', error);
    throw error;
  }
};

/**
 * Get discover groups
 * @returns {Promise<{data: any, status: number}>}
 */
export const getDiscoverGroups = async () => {
  try {
    return await apiFetch(API_ENDPOINTS.GROUP.DISCOVER);
  } catch (error) {
    console.error('Error fetching discover groups:', error);
    throw error;
  }
};

/**
 * Get group detail by ID
 * @param {string} groupId - The group ID
 * @returns {Promise<{data: any, status: number}>}
 */
export const getGroupDetail = async (groupId) => {
  if (!groupId || typeof groupId !== 'string') {
    throw new Error('Group ID is required');
  }

  try {
    return await apiFetch(API_ENDPOINTS.GROUP.DETAIL.replace(':id', groupId));
  } catch (error) {
    console.error('Error fetching group detail:', error);
    throw error;
  }
};

/**
 * Get group members
 * @param {string} groupId - The group ID
 * @returns {Promise<{data: any, status: number}>}
 */
export const getGroupMembers = async (groupId) => {
  if (!groupId || typeof groupId !== 'string') {
    throw new Error('Group ID is required');
  }

  try {
    return await apiFetch(API_ENDPOINTS.GROUP.MEMBERS.replace(':id', groupId));
  } catch (error) {
    console.error('Error fetching group members:', error);
    throw error;
  }
};

/**
 * Get group posts with pagination
 * @param {string} groupId - The group ID
 * @param {number} page - Page number (default: 1)
 * @param {number} size - Page size (default: 20)
 * @returns {Promise<{data: any, status: number}>}
 */
export const getGroupPosts = async (groupId, page = 1, size = 20) => {
  if (!groupId || typeof groupId !== 'string') {
    throw new Error('Group ID is required');
  }
  if (page < 1) {
    throw new Error('Page must be greater than 0');
  }
  if (size < 1) {
    throw new Error('Size must be greater than 0');
  }

  try {
    const endpoint = `${API_ENDPOINTS.GROUP.POSTS.replace(':id', groupId)}?page=${page}&size=${size}`;
    return await apiFetch(endpoint);
  } catch (error) {
    console.error('Error fetching group posts:', error);
    throw error;
  }
};

/**
 * Create a new group
 * @param {Object} groupData - Group data
 * @returns {Promise<{data: any, status: number}>}
 */
export const createGroup = async (groupData) => {
  if (!groupData || typeof groupData !== 'object') {
    throw new Error('Group data is required');
  }

  try {
    return await apiFetch(API_ENDPOINTS.GROUP.CREATE, {
      method: 'POST',
      body: JSON.stringify(groupData),
    });
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};

/**
 * Join a group
 * @param {string} groupId - The group ID
 * @returns {Promise<{data: any, status: number}>}
 */
export const joinGroup = async (groupId) => {
  if (!groupId || typeof groupId !== 'string') {
    throw new Error('Group ID is required');
  }

  try {
    return await apiFetch(API_ENDPOINTS.GROUP.JOIN.replace(':id', groupId), {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error joining group:', error);
    throw error;
  }
};

/**
 * Leave a group
 * @param {string} groupId - The group ID
 * @returns {Promise<{data: any, status: number}>}
 */
export const leaveGroup = async (groupId) => {
  if (!groupId || typeof groupId !== 'string') {
    throw new Error('Group ID is required');
  }

  try {
    return await apiFetch(API_ENDPOINTS.GROUP.LEAVE.replace(':id', groupId), {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error leaving group:', error);
    throw error;
  }
};

/**
 * Create a post in a group
 * @param {string} groupId - The group ID
 * @param {Object} postData - Post data
 * @returns {Promise<{data: any, status: number}>}
 */
export const createGroupPost = async (groupId, postData) => {
  if (!groupId || typeof groupId !== 'string') {
    throw new Error('Group ID is required');
  }
  if (!postData || typeof postData !== 'object') {
    throw new Error('Post data is required');
  }

  try {
    return await apiFetch(API_ENDPOINTS.GROUP.POSTS.replace(':id', groupId), {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  } catch (error) {
    console.error('Error creating group post:', error);
    throw error;
  }
};
