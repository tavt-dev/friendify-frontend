import { USE_MOCK_DATA_FOR_READS, getApiUrl, API_ENDPOINTS } from '../config/apiConfig';
import { mockSavedItems } from '../utils/comprehensiveMockData';
import { getToken } from './localStorageService';

const mockDelay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const getSavedItems = async (filters = {}) => {
  if (USE_MOCK_DATA_FOR_READS) {
    await mockDelay();
    let items = [...mockSavedItems];

    if (filters.type && filters.type !== 'all') {
      items = items.filter(item => item.type === filters.type);
    }

    if (filters.category && filters.category !== 'All') {
      items = items.filter(item => item.category === filters.category);
    }

    return {
      data: { result: items },
      status: 200,
    };
  }

  const queryParams = new URLSearchParams(filters);
  const response = await fetch(getApiUrl(`${API_ENDPOINTS.SAVED.ITEMS}?${queryParams}`), {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
  return { data: await response.json(), status: response.status };
};

export const addSavedItem = async (itemData) => {
  await mockDelay(400);
  
  const newItem = {
    ...itemData,
    id: Date.now(),
    savedDate: 'Just now',
  };

  const currentItems = JSON.parse(localStorage.getItem('saved_items') || '[]');
  currentItems.unshift(newItem);
  localStorage.setItem('saved_items', JSON.stringify(currentItems));

  const response = await fetch(getApiUrl(API_ENDPOINTS.SAVED.ADD), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(itemData),
  });

  return { data: await response.json(), status: response.status };
};

export const removeSavedItem = async (itemId) => {
  await mockDelay(400);
  
  const currentItems = JSON.parse(localStorage.getItem('saved_items') || '[]');
  const updatedItems = currentItems.filter(item => item.id !== itemId);
  localStorage.setItem('saved_items', JSON.stringify(updatedItems));

  const response = await fetch(getApiUrl(API_ENDPOINTS.SAVED.REMOVE.replace(':id', itemId)), {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });

  return { data: await response.json(), status: response.status };
};
