import { API_ENDPOINTS } from '../config/apiConfig';
import { apiFetch } from './apiHelper';

/**
 * Get current user's posts with pagination
 * @param {number} page - Page number (default: 1)
 * @param {number} size - Page size (default: 10)
 * @returns {Promise<{data: any, status: number}>}
 */
export const getMyPosts = async (page = 1, size = 10) => {
  if (page < 1) {
    throw new Error('Page must be greater than 0');
  }
  if (size < 1) {
    throw new Error('Size must be greater than 0');
  }

  try {
    return await apiFetch(`${API_ENDPOINTS.POST.MY_POSTS}?page=${page}&size=${size}`);
  } catch (error) {
    console.error('Error fetching my posts:', error);
    throw error;
  }
};

/**
 * Get public posts with pagination
 * @param {number} page - Page number (default: 1)
 * @param {number} size - Page size (default: 10)
 * @returns {Promise<{data: any, status: number}>}
 */
export const getPublicPosts = async (page = 1, size = 10) => {
  if (page < 1) {
    throw new Error('Page must be greater than 0');
  }
  if (size < 1) {
    throw new Error('Size must be greater than 0');
  }

  try {
    return await apiFetch(`${API_ENDPOINTS.POST.PUBLIC_POSTS}?page=${page}&size=${size}`);
  } catch (error) {
    console.error('Error fetching public posts:', error);
    throw error;
  }
};

/**
 * Get post by ID
 * @param {string} postId - The post ID
 * @returns {Promise<{data: any, status: number}>}
 */
export const getPostById = async (postId) => {
  if (!postId || typeof postId !== 'string') {
    throw new Error('Post ID is required');
  }

  try {
    return await apiFetch(API_ENDPOINTS.POST.GET_BY_ID.replace(':id', postId));
  } catch (error) {
    console.error('Error fetching post:', error);
    throw error;
  }
};

/**
 * Create a new post
 * @param {Object} postData - Post data { content?, images?, privacy? }
 * @returns {Promise<{data: any, status: number}>}
 */
export const createPost = async (postData) => {
  if (!postData || typeof postData !== 'object') {
    throw new Error('Post data is required');
  }

  try {
    const formData = new FormData();
    const contentValue = postData.content !== undefined && postData.content !== null 
      ? String(postData.content).trim() 
      : '';
    formData.append('content', contentValue);
    
    if (postData.images && Array.isArray(postData.images) && postData.images.length > 0) {
      postData.images.forEach((image) => {
        if (image instanceof File) {
          formData.append('images', image);
        }
      });
    }

    const privacy = postData.privacy || 'PUBLIC';
    formData.append('privacy', privacy);
    
    return await apiFetch(API_ENDPOINTS.POST.CREATE, {
      method: 'POST',
      body: formData,
    });
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

/**
 * Update a post
 * @param {string} postId - The post ID
 * @param {Object} postData - Post data { content?, images?, privacy? }
 * @returns {Promise<{data: any, status: number}>}
 */
export const updatePost = async (postId, postData) => {
  if (!postId || typeof postId !== 'string') {
    throw new Error('Post ID is required');
  }
  if (!postData || typeof postData !== 'object') {
    throw new Error('Post data is required');
  }

  try {
    const formData = new FormData();
    
    if (postData.content) {
      formData.append('content', postData.content);
    }
    
    if (postData.images && Array.isArray(postData.images)) {
      postData.images.forEach((image) => {
        if (image instanceof File) {
          formData.append('images', image);
        }
      });
    }

    if (postData.privacy) {
      formData.append('privacy', postData.privacy);
    }

    return await apiFetch(API_ENDPOINTS.POST.UPDATE.replace(':id', postId), {
      method: 'PUT',
      body: formData,
    });
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

/**
 * Delete a post
 * @param {string} postId - The post ID
 * @returns {Promise<{data: any, status: number}>}
 */
export const deletePost = async (postId) => {
  if (!postId || typeof postId !== 'string') {
    throw new Error('Post ID is required');
  }

  try {
    return await apiFetch(API_ENDPOINTS.POST.DELETE.replace(':id', postId), {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

/**
 * Save a post
 * @param {string} postId - The post ID
 * @returns {Promise<{data: any, status: number}>}
 */
export const savePost = async (postId) => {
  if (!postId || typeof postId !== 'string') {
    throw new Error('Post ID is required');
  }

  try {
    return await apiFetch(API_ENDPOINTS.POST.SAVE.replace(':id', postId), {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error saving post:', error);
    throw error;
  }
};

/**
 * Unsave a post
 * @param {string} postId - The post ID
 * @returns {Promise<{data: any, status: number}>}
 */
export const unsavePost = async (postId) => {
  if (!postId || typeof postId !== 'string') {
    throw new Error('Post ID is required');
  }

  try {
    return await apiFetch(API_ENDPOINTS.POST.UNSAVE.replace(':id', postId), {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error unsaving post:', error);
    throw error;
  }
};

/**
 * Get saved posts with pagination
 * @param {number} page - Page number (default: 1)
 * @param {number} size - Page size (default: 10)
 * @returns {Promise<{data: any, status: number}>}
 */
export const getSavedPosts = async (page = 1, size = 10) => {
  if (page < 1) {
    throw new Error('Page must be greater than 0');
  }
  if (size < 1) {
    throw new Error('Size must be greater than 0');
  }

  try {
    return await apiFetch(`${API_ENDPOINTS.POST.SAVED_POSTS}?page=${page}&size=${size}`);
  } catch (error) {
    console.error('Error fetching saved posts:', error);
    throw error;
  }
};

/**
 * Get shared posts by user ID with pagination
 * @param {string} userId - The user ID
 * @param {number} page - Page number (default: 1)
 * @param {number} size - Page size (default: 10)
 * @returns {Promise<{data: any, status: number}>}
 */
export const getSharedPosts = async (userId, page = 1, size = 10) => {
  if (!userId || typeof userId !== 'string') {
    throw new Error('User ID is required');
  }
  if (page < 1) {
    throw new Error('Page must be greater than 0');
  }
  if (size < 1) {
    throw new Error('Size must be greater than 0');
  }

  try {
    const endpoint = `${API_ENDPOINTS.POST.SHARED_POSTS.replace(':id', userId)}?page=${page}&size=${size}`;
    return await apiFetch(endpoint);
  } catch (error) {
    console.error('Error fetching shared posts:', error);
    throw error;
  }
};

/**
 * Get share count for a post
 * @param {string} postId - The post ID
 * @returns {Promise<{data: any, status: number}>}
 */
export const getShareCount = async (postId) => {
  if (!postId || typeof postId !== 'string') {
    throw new Error('Post ID is required');
  }

  try {
    return await apiFetch(API_ENDPOINTS.POST.SHARE_COUNT.replace(':id', postId));
  } catch (error) {
    console.error('Error fetching share count:', error);
    throw error;
  }
};

/**
 * Check if a post is saved
 * @param {string} postId - The post ID
 * @returns {Promise<{data: any, status: number}>}
 */
export const isPostSaved = async (postId) => {
  if (!postId || typeof postId !== 'string') {
    throw new Error('Post ID is required');
  }

  try {
    return await apiFetch(API_ENDPOINTS.POST.IS_SAVED.replace(':id', postId));
  } catch (error) {
    console.error('Error checking if post is saved:', error);
    throw error;
  }
};

/**
 * Get posts by user ID with pagination
 * @param {string} userId - The user ID
 * @param {number} page - Page number (default: 1)
 * @param {number} size - Page size (default: 10)
 * @returns {Promise<{data: any, status: number}>}
 */
export const getUserPosts = async (userId, page = 1, size = 10) => {
  if (!userId || typeof userId !== 'string') {
    throw new Error('User ID is required');
  }
  if (page < 1) {
    throw new Error('Page must be greater than 0');
  }
  if (size < 1) {
    throw new Error('Size must be greater than 0');
  }

  try {
    const endpoint = `${API_ENDPOINTS.POST.USER_POSTS.replace(':id', userId)}?page=${page}&size=${size}`;
    return await apiFetch(endpoint);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    throw error;
  }
};

/**
 * Get current user's shared posts with pagination
 * @param {number} page - Page number (default: 1)
 * @param {number} size - Page size (default: 10)
 * @returns {Promise<{data: any, status: number}>}
 */
export const getMySharedPosts = async (page = 1, size = 10) => {
  if (page < 1) {
    throw new Error('Page must be greater than 0');
  }
  if (size < 1) {
    throw new Error('Size must be greater than 0');
  }

  try {
    return await apiFetch(`${API_ENDPOINTS.POST.MY_SHARED_POSTS}?page=${page}&size=${size}`);
  } catch (error) {
    console.error('Error fetching my shared posts:', error);
    throw error;
  }
};

/**
 * Get saved posts count
 * @returns {Promise<{data: any, status: number}>}
 */
export const getSavedCount = async () => {
  try {
    return await apiFetch(API_ENDPOINTS.POST.SAVED_COUNT);
  } catch (error) {
    console.error('Error fetching saved count:', error);
    throw error;
  }
};

/**
 * Search posts by keyword with pagination
 * @param {string} keyword - Search keyword
 * @param {number} page - Page number (default: 1)
 * @param {number} size - Page size (default: 10)
 * @returns {Promise<{data: any, status: number}>}
 */
export const searchPosts = async (keyword, page = 1, size = 10) => {
  if (!keyword || keyword.trim().length === 0) {
    return { data: { result: { content: [], totalElements: 0, totalPages: 0 } }, status: 200 };
  }
  if (page < 1) {
    throw new Error('Page must be greater than 0');
  }
  if (size < 1) {
    throw new Error('Size must be greater than 0');
  }

  try {
    const endpoint = `${API_ENDPOINTS.POST.SEARCH}?keyword=${encodeURIComponent(keyword.trim())}&page=${page}&size=${size}`;
    return await apiFetch(endpoint);
  } catch (error) {
    console.error('Error searching posts:', error);
    throw error;
  }
};

/**
 * Search friends' posts by keyword with pagination
 * @param {string} keyword - Search keyword
 * @param {number} page - Page number (default: 1)
 * @param {number} size - Page size (default: 10)
 * @returns {Promise<{data: any, status: number}>}
 */
export const searchFriendsPosts = async (keyword, page = 1, size = 10) => {
  if (!keyword || keyword.trim().length === 0) {
    return { data: { result: { content: [], totalElements: 0, totalPages: 0 } }, status: 200 };
  }
  if (page < 1) {
    throw new Error('Page must be greater than 0');
  }
  if (size < 1) {
    throw new Error('Size must be greater than 0');
  }

  try {
    const endpoint = `${API_ENDPOINTS.POST.SEARCH_FRIENDS}?keyword=${encodeURIComponent(keyword.trim())}&page=${page}&size=${size}`;
    return await apiFetch(endpoint);
  } catch (error) {
    console.error('Error searching friends posts:', error);
    throw error;
  }
};
