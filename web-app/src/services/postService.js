import { API_ENDPOINTS } from '../config/apiConfig';
import { apiFetch } from './apiHelper';

export const getMyPosts = async (page = 1, size = 10) => {
  return apiFetch(`${API_ENDPOINTS.POST.MY_POSTS}?page=${page}&size=${size}`);
};

export const getPublicPosts = async (page = 1, size = 10) => {
  return apiFetch(`${API_ENDPOINTS.POST.PUBLIC_POSTS}?page=${page}&size=${size}`);
};

export const getPostById = async (postId) => {
  return apiFetch(API_ENDPOINTS.POST.GET_BY_ID.replace(':id', postId));
};

export const createPost = async (postData) => {
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
  
  return apiFetch(API_ENDPOINTS.POST.CREATE, {
    method: 'POST',
    body: formData,
  });
};

export const updatePost = async (postId, postData) => {
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

  return apiFetch(API_ENDPOINTS.POST.UPDATE.replace(':id', postId), {
    method: 'PUT',
    body: formData,
  });
};

export const deletePost = async (postId) => {
  return apiFetch(API_ENDPOINTS.POST.DELETE.replace(':id', postId), {
    method: 'DELETE',
  });
};

export const savePost = async (postId) => {
  return apiFetch(API_ENDPOINTS.POST.SAVE.replace(':id', postId), {
    method: 'POST',
  });
};

export const unsavePost = async (postId) => {
  return apiFetch(API_ENDPOINTS.POST.UNSAVE.replace(':id', postId), {
    method: 'DELETE',
  });
};

export const getSavedPosts = async (page = 1, size = 10) => {
  return apiFetch(`${API_ENDPOINTS.POST.SAVED_POSTS}?page=${page}&size=${size}`);
};

export const getSharedPosts = async (userId, page = 1, size = 10) => {
  const endpoint = `${API_ENDPOINTS.POST.SHARED_POSTS.replace(':id', userId)}?page=${page}&size=${size}`;
  return apiFetch(endpoint);
};

export const getShareCount = async (postId) => {
  return apiFetch(API_ENDPOINTS.POST.SHARE_COUNT.replace(':id', postId));
};

export const isPostSaved = async (postId) => {
  return apiFetch(API_ENDPOINTS.POST.IS_SAVED.replace(':id', postId));
};

export const getUserPosts = async (userId, page = 1, size = 10) => {
  const endpoint = `${API_ENDPOINTS.POST.USER_POSTS.replace(':id', userId)}?page=${page}&size=${size}`;
  return apiFetch(endpoint);
};

export const getMySharedPosts = async (page = 1, size = 10) => {
  return apiFetch(`${API_ENDPOINTS.POST.MY_SHARED_POSTS}?page=${page}&size=${size}`);
};

export const getSavedCount = async () => {
  return apiFetch(API_ENDPOINTS.POST.SAVED_COUNT);
};

export const searchPosts = async (keyword, page = 1, size = 10) => {
  if (!keyword || keyword.trim().length === 0) {
    return { data: { result: { content: [], totalElements: 0, totalPages: 0 } }, status: 200 };
  }
  const endpoint = `${API_ENDPOINTS.POST.SEARCH}?keyword=${encodeURIComponent(keyword.trim())}&page=${page}&size=${size}`;
  return apiFetch(endpoint);
};

export const searchFriendsPosts = async (keyword, page = 1, size = 10) => {
  if (!keyword || keyword.trim().length === 0) {
    return { data: { result: { content: [], totalElements: 0, totalPages: 0 } }, status: 200 };
  }
  const endpoint = `${API_ENDPOINTS.POST.SEARCH_FRIENDS}?keyword=${encodeURIComponent(keyword.trim())}&page=${page}&size=${size}`;
  return apiFetch(endpoint);
};
