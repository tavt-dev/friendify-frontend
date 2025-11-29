import { apiFetch } from './apiHelper';
import { API_ENDPOINTS } from '../config/apiConfig';

// --- LIKE ---

/**
 * Like a post
 * @param {string} postId - The post ID
 * @returns {Promise<{data: any, status: number}>}
 */
export const likePost = async (postId) => {
  if (!postId || typeof postId !== 'string') {
    throw new Error('Post ID is required');
  }

  try {
    // Backend yêu cầu POST body: { postId: "..." }
    return await apiFetch(API_ENDPOINTS.INTERACTION.LIKE, {
      method: 'POST',
      body: JSON.stringify({ postId: postId }),
    });
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};

/**
 * Unlike a post
 * @param {string} postId - The post ID
 * @returns {Promise<{data: any, status: number}>}
 */
export const unlikePost = async (postId) => {
  if (!postId || typeof postId !== 'string') {
    throw new Error('Post ID is required');
  }

  try {
    // Backend yêu cầu DELETE endpoint riêng cho Post
    return await apiFetch(API_ENDPOINTS.INTERACTION.UNLIKE_POST.replace(':id', postId), {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error unliking post:', error);
    throw error;
  }
};

/**
 * Get post likes with pagination
 * @param {string} postId - The post ID
 * @param {number} page - Page number (default: 1)
 * @param {number} size - Page size (default: 10)
 * @returns {Promise<{data: any, status: number}>}
 */
export const getPostLikes = async (postId, page = 1, size = 10) => {
  if (!postId || typeof postId !== 'string') {
    throw new Error('Post ID is required');
  }
  if (page < 1) {
    throw new Error('Page must be greater than 0');
  }
  if (size < 1) {
    throw new Error('Size must be greater than 0');
  }

  try {
    const endpoint = `${API_ENDPOINTS.INTERACTION.GET_POST_LIKES.replace(':id', postId)}?page=${page}&size=${size}`;
    return await apiFetch(endpoint);
  } catch (error) {
    console.error('Error fetching post likes:', error);
    throw error;
  }
};

// --- COMMENT ---

/**
 * Comment on a post
 * @param {string} postId - The post ID
 * @param {string} commentText - The comment content
 * @param {string|null} parentCommentId - Parent comment ID for replies (optional)
 * @returns {Promise<{data: any, status: number}>}
 */
export const commentOnPost = async (postId, commentText, parentCommentId = null) => {
  if (!postId || typeof postId !== 'string') {
    throw new Error('Post ID is required');
  }
  if (!commentText || typeof commentText !== 'string' || commentText.trim().length === 0) {
    throw new Error('Comment text is required');
  }

  try {
    const body = { postId, content: commentText.trim() };
    if (parentCommentId) {
      if (typeof parentCommentId !== 'string') {
        throw new Error('Parent comment ID must be a string');
      }
      body.parentCommentId = parentCommentId;
    }

    return await apiFetch(API_ENDPOINTS.INTERACTION.CREATE_COMMENT, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.error('Error commenting on post:', error);
    throw error;
  }
};

/**
 * Get post comments with pagination
 * @param {string} postId - The post ID
 * @param {number} page - Page number (default: 1)
 * @param {number} size - Page size (default: 20)
 * @returns {Promise<{data: any, status: number}>}
 */
export const getPostComments = async (postId, page = 1, size = 20) => {
  if (!postId || typeof postId !== 'string') {
    throw new Error('Post ID is required');
  }
  if (page < 1) {
    throw new Error('Page must be greater than 0');
  }
  if (size < 1) {
    throw new Error('Size must be greater than 0');
  }

  try {
    const endpoint = `${API_ENDPOINTS.INTERACTION.GET_POST_COMMENTS.replace(':id', postId)}?page=${page}&size=${size}`;
    return await apiFetch(endpoint);
  } catch (error) {
    console.error('Error fetching post comments:', error);
    throw error;
  }
};

/**
 * Update a comment
 * @param {string} commentId - The comment ID
 * @param {string} commentText - The updated comment content
 * @returns {Promise<{data: any, status: number}>}
 */
export const updateComment = async (commentId, commentText) => {
  if (!commentId || typeof commentId !== 'string') {
    throw new Error('Comment ID is required');
  }
  if (!commentText || typeof commentText !== 'string' || commentText.trim().length === 0) {
    throw new Error('Comment text is required');
  }

  try {
    return await apiFetch(API_ENDPOINTS.INTERACTION.UPDATE_COMMENT.replace(':id', commentId), {
      method: 'PUT',
      body: JSON.stringify({ content: commentText.trim() }),
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    throw error;
  }
};

/**
 * Delete a comment
 * @param {string} commentId - The comment ID
 * @returns {Promise<{data: any, status: number}>}
 */
export const deleteComment = async (commentId) => {
  if (!commentId || typeof commentId !== 'string') {
    throw new Error('Comment ID is required');
  }

  try {
    return await apiFetch(API_ENDPOINTS.INTERACTION.DELETE_COMMENT.replace(':id', commentId), {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

/**
 * Like a comment
 * @param {string} commentId - The comment ID
 * @returns {Promise<{data: any, status: number}>}
 */
export const likeComment = async (commentId) => {
  if (!commentId || typeof commentId !== 'string') {
    throw new Error('Comment ID is required');
  }

  try {
    return await apiFetch(API_ENDPOINTS.INTERACTION.LIKE, {
      method: 'POST',
      body: JSON.stringify({ commentId }),
    });
  } catch (error) {
    console.error('Error liking comment:', error);
    throw error;
  }
};

/**
 * Unlike a comment
 * @param {string} commentId - The comment ID
 * @returns {Promise<{data: any, status: number}>}
 */
export const unlikeComment = async (commentId) => {
  if (!commentId || typeof commentId !== 'string') {
    throw new Error('Comment ID is required');
  }

  try {
    return await apiFetch(API_ENDPOINTS.INTERACTION.UNLIKE_COMMENT.replace(':id', commentId), {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error unliking comment:', error);
    throw error;
  }
};

// --- POST ---

/**
 * Share a post
 * @param {string} postId - The post ID
 * @param {string|null} content - Optional share content
 * @returns {Promise<{data: any, status: number}>}
 */
export const sharePost = async (postId, content = null) => {
  if (!postId || typeof postId !== 'string') {
    throw new Error('Post ID is required');
  }

  try {
    // Backend Post Service dùng @RequestParam cho content
    const url = API_ENDPOINTS.POST.SHARE.replace(':id', postId);
    const finalUrl = content 
      ? `${url}?content=${encodeURIComponent(content)}` 
      : url;

    return await apiFetch(finalUrl, {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error sharing post:', error);
    throw error;
  }
};

/**
 * Update a post
 * @param {string} postId - The post ID
 * @param {FormData|Object} postData - Post data (FormData if has images, Object otherwise)
 * @returns {Promise<{data: any, status: number}>}
 */
export const updatePost = async (postId, postData) => {
  if (!postId || typeof postId !== 'string') {
    throw new Error('Post ID is required');
  }
  if (!postData) {
    throw new Error('Post data is required');
  }

  try {
    // postData là FormData nếu có ảnh
    return await apiFetch(API_ENDPOINTS.POST.UPDATE.replace(':id', postId), {
      method: 'PUT',
      body: postData instanceof FormData ? postData : JSON.stringify(postData), 
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
