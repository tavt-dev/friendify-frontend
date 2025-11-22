import { API_ENDPOINTS } from '../config/apiConfig';
import { apiFetch } from './apiHelper';

export const getSavedItems = async (filters = {}) => {
  const queryParams = new URLSearchParams(
    Object.fromEntries(Object.entries(filters).filter(([_, v]) => v != null && v !== ''))
  );
  const endpoint = queryParams.toString() 
    ? `${API_ENDPOINTS.SAVED.ITEMS}?${queryParams}` 
    : API_ENDPOINTS.SAVED.ITEMS;
  return apiFetch(endpoint);
};

export const addSavedItem = async (postId) => {
  return apiFetch(API_ENDPOINTS.SAVED.ADD.replace(':id', postId), {
    method: 'POST',
  });
};

export const removeSavedItem = async (itemId) => {
  return apiFetch(API_ENDPOINTS.SAVED.REMOVE.replace(':id', itemId), {
    method: 'DELETE',
  });
};
