import { apiFetch } from './apiHelper';
import { API_ENDPOINTS } from '../config/apiConfig';

export const likePost = async (postId) => {
  return apiFetch('/api/likes', {
    method: 'POST',
    body: JSON.stringify({ postId }),
  });
};

export const unlikePost = async (postId) => {
  return apiFetch(`/api/likes/post/${postId}`, {
    method: 'DELETE',
  });
};

export const commentOnPost = async (postId, content, parentCommentId = null) => {
  const body = { postId, content };
  if (parentCommentId) {
    body.parentCommentId = parentCommentId;
  }
  return apiFetch('/api/comments', {
    method: 'POST',
    body: JSON.stringify(body),
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
  return apiFetch(`/api/comments/post/${postId}?page=${page}&size=${size}`);
};

export const updateComment = async (commentId, content) => {
  return apiFetch(`/api/comments/${commentId}`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
  });
};

export const deleteComment = async (commentId) => {
  return apiFetch(`/api/comments/${commentId}`, {
    method: 'DELETE',
  });
};

export const likeComment = async (commentId) => {
  return apiFetch('/api/likes', {
    method: 'POST',
    body: JSON.stringify({ commentId }),
  });
};

export const unlikeComment = async (commentId) => {
  return apiFetch(`/api/likes/comment/${commentId}`, {
    method: 'DELETE',
  });
};
