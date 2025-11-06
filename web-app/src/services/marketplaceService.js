import { USE_MOCK_DATA_FOR_READS, getApiUrl, API_ENDPOINTS } from '../config/apiConfig';
import { mockMarketplaceItems } from '../utils/comprehensiveMockData';
import { getToken } from './localStorageService';

const mockDelay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const getMarketplaceItems = async (filters = {}) => {
  if (USE_MOCK_DATA_FOR_READS) {
    await mockDelay();
    let items = [...mockMarketplaceItems];

    if (filters.category && filters.category !== 'All') {
      items = items.filter(item => item.category === filters.category);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      items = items.filter(item => 
        item.title.toLowerCase().includes(searchLower) ||
        item.location.toLowerCase().includes(searchLower)
      );
    }

    return {
      data: { result: items },
      status: 200,
    };
  }

  const queryParams = new URLSearchParams(filters);
  const response = await fetch(getApiUrl(`${API_ENDPOINTS.MARKETPLACE.ITEMS}?${queryParams}`), {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
  return { data: await response.json(), status: response.status };
};

export const getMarketplaceCategories = async () => {
  if (USE_MOCK_DATA_FOR_READS) {
    await mockDelay();
    const categories = ['All', ...new Set(mockMarketplaceItems.map(item => item.category))];
    return {
      data: { result: categories },
      status: 200,
    };
  }

  const response = await fetch(getApiUrl(API_ENDPOINTS.MARKETPLACE.CATEGORIES), {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
  return { data: await response.json(), status: response.status };
};
