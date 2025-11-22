import { API_ENDPOINTS } from '../config/apiConfig';
import { apiFetch } from './apiHelper';

export const getMarketplaceItems = async (filters = {}) => {
  const queryParams = new URLSearchParams(
    Object.fromEntries(Object.entries(filters).filter(([_, v]) => v != null && v !== ''))
  );
  const endpoint = queryParams.toString() 
    ? `${API_ENDPOINTS.MARKETPLACE.ITEMS}?${queryParams}` 
    : API_ENDPOINTS.MARKETPLACE.ITEMS;
  return apiFetch(endpoint);
};

export const getMarketplaceCategories = async () => {
  return apiFetch(API_ENDPOINTS.MARKETPLACE.CATEGORIES);
};
