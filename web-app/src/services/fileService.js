import { API_ENDPOINTS } from '../config/apiConfig';
import { apiFetch } from './apiHelper';

/**
 * Upload a single image file
 * @param {File} file - The image file to upload
 * @param {string} imageType - Image type (e.g., 'POST', 'AVATAR', 'COVER')
 * @param {string} ownerId - Owner ID
 * @param {string} postId - Optional post ID
 * @returns {Promise<{data: any, status: number}>}
 */
export const uploadImage = async (file, imageType = 'POST', ownerId = null, postId = null) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', imageType);
  if (ownerId) {
    formData.append('ownerId', ownerId);
  }
  if (postId) {
    formData.append('postId', postId);
  }

  return apiFetch(API_ENDPOINTS.FILE.UPLOAD, {
    method: 'POST',
    body: formData,
  });
};

/**
 * Upload multiple image files
 * @param {File[]} files - Array of image files to upload
 * @param {string} imageType - Image type (e.g., 'POST', 'AVATAR', 'COVER')
 * @param {string} ownerId - Owner ID
 * @param {string} postId - Optional post ID
 * @returns {Promise<{data: any, status: number}>}
 */
export const uploadMultipleImages = async (files, imageType = 'POST', ownerId = null, postId = null) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  formData.append('type', imageType);
  if (ownerId) {
    formData.append('ownerId', ownerId);
  }
  if (postId) {
    formData.append('postId', postId);
  }

  return apiFetch(API_ENDPOINTS.FILE.UPLOAD_MULTIPLE, {
    method: 'POST',
    body: formData,
  });
};

/**
 * Upload image and extract URL from response
 * @param {File} file - The image file to upload
 * @param {string} imageType - Image type
 * @param {string} ownerId - Owner ID
 * @param {string} postId - Optional post ID
 * @returns {Promise<string>} The uploaded image URL
 */
export const uploadImageAndGetUrl = async (file, imageType = 'POST', ownerId = null, postId = null) => {
  const response = await uploadImage(file, imageType, ownerId, postId);
  return response?.data?.result?.url || response?.data?.url || response?.data?.data?.url || null;
};

/**
 * Upload multiple images and extract URLs from response
 * @param {File[]} files - Array of image files to upload
 * @param {string} imageType - Image type
 * @param {string} ownerId - Owner ID
 * @param {string} postId - Optional post ID
 * @returns {Promise<string[]>} Array of uploaded image URLs
 */
export const uploadMultipleImagesAndGetUrls = async (files, imageType = 'POST', ownerId = null, postId = null) => {
  const response = await uploadMultipleImages(files, imageType, ownerId, postId);
  if (Array.isArray(response?.data?.result)) {
    return response.data.result.map(item => item.url || item.data?.url).filter(Boolean);
  }
  if (Array.isArray(response?.data)) {
    return response.data.map(item => item.url || item.data?.url).filter(Boolean);
  }
  return [];
};

