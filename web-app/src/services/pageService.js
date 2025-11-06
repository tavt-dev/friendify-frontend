import { USE_MOCK_DATA_FOR_READS, getApiUrl, API_ENDPOINTS } from '../config/apiConfig';
import { mockPages, mockSuggestedPages } from '../utils/comprehensiveMockData';
import { getToken } from './localStorageService';

const mockDelay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const getPages = async () => {
  if (USE_MOCK_DATA_FOR_READS) {
    await mockDelay();
    return {
      data: { result: mockPages },
      status: 200,
    };
  }

  const response = await fetch(getApiUrl(API_ENDPOINTS.PAGE.LIST), {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
  return { data: await response.json(), status: response.status };
};

export const getSuggestedPages = async () => {
  if (USE_MOCK_DATA_FOR_READS) {
    await mockDelay();
    return {
      data: { result: mockSuggestedPages },
      status: 200,
    };
  }

  const response = await fetch(getApiUrl(API_ENDPOINTS.PAGE.SUGGESTED), {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
  return { data: await response.json(), status: response.status };
};

export const followPage = async (pageId) => {
  await mockDelay(400);
  
  localStorage.setItem(`page_followed_${pageId}`, Date.now().toString());

  const response = await fetch(getApiUrl(API_ENDPOINTS.PAGE.FOLLOW.replace(':id', pageId)), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });

  return { data: await response.json(), status: response.status };
};

export const unfollowPage = async (pageId) => {
  await mockDelay(400);
  
  localStorage.removeItem(`page_followed_${pageId}`);

  const response = await fetch(getApiUrl(API_ENDPOINTS.PAGE.UNFOLLOW.replace(':id', pageId)), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });

  return { data: await response.json(), status: response.status };
};
