import { apiFetch } from './apiHelper';
import { API_ENDPOINTS } from '../config/apiConfig';

export const likePost = async (postId) => {
  return apiFetch(API_ENDPOINTS.POST.LIKE.replace(':id', postId), {
    method: 'POST',
  });
};

export const unlikePost = async (postId) => {
  return apiFetch(API_ENDPOINTS.POST.LIKE.replace(':id', postId), {
    method: 'DELETE',
  });
};

export const commentOnPost = async (postId, commentText) => {
  return apiFetch(API_ENDPOINTS.POST.COMMENTS.replace(':id', postId), {
    method: 'POST',
    body: JSON.stringify({ text: commentText }),
  });
};

export const sharePost = async (postId, shareData = {}) => {
  return apiFetch(API_ENDPOINTS.POST.SHARE.replace(':id', postId), {
    method: 'POST',
    body: JSON.stringify(shareData),
  });
};

export const updatePost = async (postId, postData) => {
  return apiFetch(API_ENDPOINTS.POST.UPDATE.replace(':id', postId), {
    method: 'PUT',
    body: JSON.stringify(postData),
  });
};

export const deletePost = async (postId) => {
  return apiFetch(API_ENDPOINTS.POST.DELETE.replace(':id', postId), {
    method: 'DELETE',
  });
};

export const getPostComments = async (postId, page = 1, size = 20) => {
  const endpoint = `${API_ENDPOINTS.POST.COMMENTS.replace(':id', postId)}?page=${page}&size=${size}`;
  return apiFetch(endpoint);
};

/**
 * Update a comment
 * @param {string} commentId - Comment ID
 * @param {string} commentText - Updated comment text
 * @returns {Promise<{data: any, status: number}>}
 */
export const updateComment = async (commentId, commentText) => {
  return apiFetch(`/post/comments/${commentId}`, {
    method: 'PUT',
    body: JSON.stringify({ text: commentText }),
  });
};

/**
 * Delete a comment
 * @param {string} commentId - Comment ID
 * @returns {Promise<{data: any, status: number}>}
 */
export const deleteComment = async (commentId) => {
  return apiFetch(`/post/comments/${commentId}`, {
    method: 'DELETE',
  });
};
