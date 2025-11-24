import { apiFetch } from './apiHelper';
import { API_ENDPOINTS } from '../config/apiConfig';

// --- LIKE ---

export const likePost = async (postId) => {
  // Backend yêu cầu POST body: { postId: "..." }
  return apiFetch(API_ENDPOINTS.INTERACTION.LIKE, {
    method: 'POST',
    body: JSON.stringify({ postId: postId }),
  });
};

export const unlikePost = async (postId) => {
  // Backend yêu cầu DELETE endpoint riêng cho Post
  return apiFetch(API_ENDPOINTS.INTERACTION.UNLIKE_POST.replace(':id', postId), {
    method: 'DELETE',
  });
};

export const getPostLikes = async (postId, page = 1, size = 10) => {
  const endpoint = `${API_ENDPOINTS.INTERACTION.GET_POST_LIKES.replace(':id', postId)}?page=${page}&size=${size}`;
  return apiFetch(endpoint);
};

// --- COMMENT ---

export const commentOnPost = async (postId, commentText, parentCommentId = null) => {
  const body = { postId, content: commentText };
  if (parentCommentId) body.parentCommentId = parentCommentId;

  return apiFetch(API_ENDPOINTS.INTERACTION.CREATE_COMMENT, {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

export const getPostComments = async (postId, page = 1, size = 20) => {
  const endpoint = `${API_ENDPOINTS.INTERACTION.GET_POST_COMMENTS.replace(':id', postId)}?page=${page}&size=${size}`;
  return apiFetch(endpoint);
};

export const updateComment = async (commentId, commentText) => {
  return apiFetch(API_ENDPOINTS.INTERACTION.UPDATE_COMMENT.replace(':id', commentId), {
    method: 'PUT',
    body: JSON.stringify({ content: commentText }),
  });
};

export const deleteComment = async (commentId) => {
  return apiFetch(API_ENDPOINTS.INTERACTION.DELETE_COMMENT.replace(':id', commentId), {
    method: 'DELETE',
  });
};

// --- POST ---

export const sharePost = async (postId, content) => {
  // Backend Post Service dùng @RequestParam cho content
  const url = API_ENDPOINTS.POST.SHARE.replace(':id', postId);
  const finalUrl = content 
    ? `${url}?content=${encodeURIComponent(content)}` 
    : url;

  return apiFetch(finalUrl, {
    method: 'POST',
  });
};

export const updatePost = async (postId, postData) => {
  // postData là FormData nếu có ảnh
  return apiFetch(API_ENDPOINTS.POST.UPDATE.replace(':id', postId), {
    method: 'PUT',
    body: postData, 
  });
};

export const deletePost = async (postId) => {
  return apiFetch(API_ENDPOINTS.POST.DELETE.replace(':id', postId), {
    method: 'DELETE',
  });
};