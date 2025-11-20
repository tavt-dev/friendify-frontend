import { getToken } from "./localStorageService";
import { getApiUrl, API_ENDPOINTS } from '../config/apiConfig';

/**
 * Get my posts with pagination
 * @param {number} page - Page number (default: 1)
 * @param {number} size - Page size (default: 10)
 * @returns {Promise<{data: {result: PageResponse<PostResponse>}, status: number}>}
 */
export const getMyPosts = async (page = 1, size = 10) => {
  try {
    const response = await fetch(getApiUrl(`${API_ENDPOINTS.POST.MY_POSTS}?page=${page}&size=${size}`), {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw { response: { status: response.status, data: errorData } };
    }

    return { data: await response.json(), status: response.status };
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

/**
 * Get public posts with pagination
 * @param {number} page - Page number (default: 1)
 * @param {number} size - Page size (default: 10)
 * @returns {Promise<{data: {result: PageResponse<PostResponse>}, status: number}>}
 */
export const getPublicPosts = async (page = 1, size = 10) => {
  try {
    const url = getApiUrl(`${API_ENDPOINTS.POST.PUBLIC_POSTS}?page=${page}&size=${size}`);
    console.log('Fetching public posts from:', url);
    
    const token = getToken();
    if (!token) {
      throw { response: { status: 401, data: { message: 'No token found' } } };
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error response:', errorData);
      throw { response: { status: response.status, data: errorData } };
    }

    const data = await response.json();
    console.log('Response data:', data);
    return { data, status: response.status };
  } catch (error) {
    console.error('Error fetching public posts:', error);
    // If it's already formatted error, re-throw
    if (error.response) {
      throw error;
    }
    // Otherwise, wrap it
    throw { response: { status: error.status || 500, data: { message: error.message } } };
  }
};

/**
 * Get post by ID
 * @param {string} postId - Post ID
 * @returns {Promise<{data: {result: PostResponse}, status: number}>}
 */
export const getPostById = async (postId) => {
  try {
    const response = await fetch(getApiUrl(API_ENDPOINTS.POST.GET_BY_ID.replace(':id', postId)), {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw { response: { status: response.status, data: errorData } };
    }

    return { data: await response.json(), status: response.status };
  } catch (error) {
    console.error('Error fetching post:', error);
    throw error;
  }
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
  try {
    // Backend expects multipart/form-data
    const formData = new FormData();
    
    // Add content if provided
    if (postData.content) {
      formData.append('content', postData.content);
    }
    
    // Add images if provided (expecting File objects)
    if (postData.images && Array.isArray(postData.images)) {
      postData.images.forEach((image) => {
        if (image instanceof File) {
          formData.append('images', image);
        }
      });
    }

    // Add privacy if provided (PUBLIC, FRIENDS, PRIVATE)
    if (postData.privacy) {
      formData.append('privacy', postData.privacy);
    }

    const response = await fetch(getApiUrl(API_ENDPOINTS.POST.CREATE), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        // Don't set Content-Type header - browser will set it with boundary for FormData
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw { response: { status: response.status, data: errorData } };
    }

    const data = await response.json();
    return { data, status: response.status };
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
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

    const response = await fetch(getApiUrl(API_ENDPOINTS.POST.UPDATE.replace(':id', postId)), {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw { response: { status: response.status, data: errorData } };
    }

    return { data: await response.json(), status: response.status };
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

/**
 * Delete a post
 * @param {string} postId - Post ID
 * @returns {Promise<{data: {result: void}, status: number}>}
 */
export const deletePost = async (postId) => {
  try {
    const response = await fetch(getApiUrl(API_ENDPOINTS.POST.DELETE.replace(':id', postId)), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw { response: { status: response.status, data: errorData } };
    }

    return { data: await response.json(), status: response.status };
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};
