import { API_ENDPOINTS } from '../config/apiConfig';
import { apiFetch } from './apiHelper';

export const getPages = async () => {
  return apiFetch(API_ENDPOINTS.PAGE.LIST);
};

export const getSuggestedPages = async () => {
  return apiFetch(API_ENDPOINTS.PAGE.SUGGESTED);
};

export const followPage = async (pageId) => {
  return apiFetch(API_ENDPOINTS.PAGE.FOLLOW.replace(':id', pageId), {
    method: 'POST',
  });
};

export const unfollowPage = async (pageId) => {
  return apiFetch(API_ENDPOINTS.PAGE.UNFOLLOW.replace(':id', pageId), {
    method: 'POST',
  });
};
