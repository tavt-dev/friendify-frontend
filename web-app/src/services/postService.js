import { API_ENDPOINTS } from '../config/apiConfig';
import { apiFetch } from './apiHelper';

/**
 * Get my posts with pagination
 * @param {number} page - Page number (default: 1)
 * @param {number} size - Page size (default: 10)
 * @returns {Promise<{data: {result: PageResponse<PostResponse>}, status: number}>}
 */
export const getMyPosts = async (page = 1, size = 10) => {
  return apiFetch(`${API_ENDPOINTS.POST.MY_POSTS}?page=${page}&size=${size}`);
};

/**
 * Get public posts with pagination
 * @param {number} page - Page number (default: 1)
 * @param {number} size - Page size (default: 10)
 * @returns {Promise<{data: {result: PageResponse<PostResponse>}, status: number}>}
 */
export const getPublicPosts = async (page = 1, size = 10) => {
  return apiFetch(`${API_ENDPOINTS.POST.PUBLIC_POSTS}?page=${page}&size=${size}`);
};

/**
 * Get post by ID
 * @param {string} postId - Post ID
 * @returns {Promise<{data: {result: PostResponse}, status: number}>}
 */
export const getPostById = async (postId) => {
  return apiFetch(API_ENDPOINTS.POST.GET_BY_ID.replace(':id', postId));
};

/**
 * Create a new post
 * @param {Object} postData - Post data
 * @param {string} [postData.content] - Post content
 * @param {File[]} [postData.images] - Array of image files
 * @param {string} [postData.privacy] - Privacy type: 'PUBLIC' or 'PRIVATE'
 * @returns {Promise<{data: {result: PostResponse}, status: number}>}
 */
export const createPost = async (postData) => {
  const formData = new FormData();
  
  // Backend: @RequestParam(value = "content", required = false) String content
  // Backend: @RequestPart(value = "images", required = false) List<MultipartFile> images
  // Backend: @RequestParam(value = "privacy", required = false) PrivacyType privacy
  
  // Content - append only if it has actual content (not empty after trim)
  // If empty but has images, still append empty string to satisfy @RequestParam
  const contentValue = postData.content !== undefined && postData.content !== null 
    ? String(postData.content).trim() 
    : '';
  formData.append('content', contentValue);
  
  // Append images - backend uses @RequestPart(value = "images")
  // Each file must be appended with the same key "images" for Spring to bind to List<MultipartFile>
  if (postData.images && Array.isArray(postData.images) && postData.images.length > 0) {
    postData.images.forEach((image) => {
      if (image instanceof File) {
        formData.append('images', image);
      }
    });
  }

  // Privacy - backend defaults to PUBLIC if not provided
  const privacy = postData.privacy || 'PUBLIC';
  formData.append('privacy', privacy);

  // Debug log
  console.log('Creating post - FormData:', {
    content: contentValue,
    contentLength: contentValue.length,
    hasImages: postData.images?.length > 0,
    imageCount: postData.images?.length || 0,
    privacy: privacy,
    endpoint: API_ENDPOINTS.POST.CREATE
  });

  return apiFetch(API_ENDPOINTS.POST.CREATE, {
    method: 'POST',
    body: formData,
  });
};

/**
 * Update a post
 * @param {string} postId - Post ID
 * @param {Object} postData - Post data to update
 * @param {string} [postData.content] - Post content
 * @param {File[]} [postData.images] - Array of image files
 * @param {string} [postData.privacy] - Privacy type
 * @returns {Promise<{data: {result: PostResponse}, status: number}>}
 */
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

/**
 * Delete a post
 * @param {string} postId - Post ID
 * @returns {Promise<{data: {result: void}, status: number}>}
 */
export const deletePost = async (postId) => {
  return apiFetch(API_ENDPOINTS.POST.DELETE.replace(':id', postId), {
    method: 'DELETE',
  });
};

/**
 * Save a post
 * @param {string} postId - Post ID
 * @returns {Promise<{data: {result: void}, status: number}>}
 */
export const savePost = async (postId) => {
  return apiFetch(API_ENDPOINTS.POST.SAVE.replace(':id', postId), {
    method: 'POST',
  });
};

/**
 * Unsave a post
 * @param {string} postId - Post ID
 * @returns {Promise<{data: {result: void}, status: number}>}
 */
export const unsavePost = async (postId) => {
  return apiFetch(API_ENDPOINTS.POST.UNSAVE.replace(':id', postId), {
    method: 'DELETE',
  });
};

/**
 * Get saved posts
 * @param {number} page - Page number (default: 1)
 * @param {number} size - Page size (default: 10)
 * @returns {Promise<{data: {result: PageResponse<PostResponse>}, status: number}>}
 */
export const getSavedPosts = async (page = 1, size = 10) => {
  return apiFetch(`${API_ENDPOINTS.POST.SAVED_POSTS}?page=${page}&size=${size}`);
};

/**
 * Get shared posts by user ID
 * @param {string} userId - User ID
 * @param {number} page - Page number (default: 1)
 * @param {number} size - Page size (default: 10)
 * @returns {Promise<{data: {result: PageResponse<PostResponse>}, status: number}>}
 */
export const getSharedPosts = async (userId, page = 1, size = 10) => {
  const endpoint = `${API_ENDPOINTS.POST.SHARED_POSTS.replace(':id', userId)}?page=${page}&size=${size}`;
  return apiFetch(endpoint);
};

/**
 * Get share count for a post
 * @param {string} postId - Post ID
 * @returns {Promise<{data: {result: number}, status: number}>}
 */
export const getShareCount = async (postId) => {
  return apiFetch(API_ENDPOINTS.POST.SHARE_COUNT.replace(':id', postId));
};

/**
 * Check if a post is saved
 * @param {string} postId - Post ID
 * @returns {Promise<{data: {result: boolean}, status: number}>}
 */
export const isPostSaved = async (postId) => {
  return apiFetch(API_ENDPOINTS.POST.IS_SAVED.replace(':id', postId));
};

/**
 * Get posts by user ID
 * @param {string} userId - User ID
 * @param {number} page - Page number (default: 1)
 * @param {number} size - Page size (default: 10)
 * @returns {Promise<{data: {result: PageResponse<PostResponse>}, status: number}>}
 */
export const getUserPosts = async (userId, page = 1, size = 10) => {
  const endpoint = `${API_ENDPOINTS.POST.USER_POSTS.replace(':id', userId)}?page=${page}&size=${size}`;
  return apiFetch(endpoint);
};

/**
 * Get my shared posts
 * @param {number} page - Page number (default: 1)
 * @param {number} size - Page size (default: 10)
 * @returns {Promise<{data: {result: PageResponse<PostResponse>}, status: number}>}
 */
export const getMySharedPosts = async (page = 1, size = 10) => {
  return apiFetch(`${API_ENDPOINTS.POST.MY_SHARED_POSTS}?page=${page}&size=${size}`);
};

/**
 * Get saved posts count
 * @returns {Promise<{data: {result: number}, status: number}>}
 */
export const getSavedCount = async () => {
  return apiFetch(API_ENDPOINTS.POST.SAVED_COUNT);
};

/**
 * Search posts
 * @param {string} keyword - Search keyword
 * @param {number} page - Page number (default: 1)
 * @param {number} size - Page size (default: 10)
 * @returns {Promise<{data: {result: PageResponse<PostResponse>}, status: number}>}
 */
export const searchPosts = async (keyword, page = 1, size = 10) => {
  if (!keyword || keyword.trim().length === 0) {
    return { data: { result: { content: [], totalElements: 0, totalPages: 0 } }, status: 200 };
  }
  const endpoint = `${API_ENDPOINTS.POST.SEARCH}?keyword=${encodeURIComponent(keyword.trim())}&page=${page}&size=${size}`;
  return apiFetch(endpoint);
};

/**
 * Search posts from friends
 * @param {string} keyword - Search keyword
 * @param {number} page - Page number (default: 1)
 * @param {number} size - Page size (default: 10)
 * @returns {Promise<{data: {result: PageResponse<PostResponse>}, status: number}>}
 */
export const searchFriendsPosts = async (keyword, page = 1, size = 10) => {
  if (!keyword || keyword.trim().length === 0) {
    return { data: { result: { content: [], totalElements: 0, totalPages: 0 } }, status: 200 };
  }
  const endpoint = `${API_ENDPOINTS.POST.SEARCH_FRIENDS}?keyword=${encodeURIComponent(keyword.trim())}&page=${page}&size=${size}`;
  return apiFetch(endpoint);
};
