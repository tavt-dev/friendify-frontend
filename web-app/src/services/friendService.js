import { USE_MOCK_DATA_FOR_READS, getApiUrl, API_ENDPOINTS } from '../config/apiConfig';
import { mockFriendRequests, mockFriendSuggestions, mockAllFriends } from '../utils/comprehensiveMockData';
import { getToken } from './localStorageService';

const mockDelay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const getFriendRequests = async () => {
  if (USE_MOCK_DATA_FOR_READS) {
    await mockDelay();
    return {
      data: { result: mockFriendRequests },
      status: 200,
    };
  }

  const response = await fetch(getApiUrl(API_ENDPOINTS.FRIEND.REQUESTS), {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
  return { data: await response.json(), status: response.status };
};

export const getFriendSuggestions = async () => {
  if (USE_MOCK_DATA_FOR_READS) {
    await mockDelay();
    return {
      data: { result: mockFriendSuggestions },
      status: 200,
    };
  }

  const response = await fetch(getApiUrl(API_ENDPOINTS.FRIEND.SUGGESTIONS), {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
  return { data: await response.json(), status: response.status };
};

export const getAllFriends = async () => {
  if (USE_MOCK_DATA_FOR_READS) {
    await mockDelay();
    return {
      data: { result: mockAllFriends },
      status: 200,
    };
  }

  const response = await fetch(getApiUrl(API_ENDPOINTS.FRIEND.LIST), {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
  return { data: await response.json(), status: response.status };
};

export const acceptFriendRequest = async (requestId) => {
  await mockDelay(400);
  
  const currentRequests = JSON.parse(localStorage.getItem('friend_requests') || JSON.stringify(mockFriendRequests));
  const updatedRequests = currentRequests.filter(req => req.id !== requestId);
  localStorage.setItem('friend_requests', JSON.stringify(updatedRequests));

  const response = await fetch(getApiUrl(API_ENDPOINTS.FRIEND.ACCEPT.replace(':id', requestId)), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });

  return { data: await response.json(), status: response.status };
};

export const declineFriendRequest = async (requestId) => {
  await mockDelay(400);
  
  const currentRequests = JSON.parse(localStorage.getItem('friend_requests') || JSON.stringify(mockFriendRequests));
  const updatedRequests = currentRequests.filter(req => req.id !== requestId);
  localStorage.setItem('friend_requests', JSON.stringify(updatedRequests));

  const response = await fetch(getApiUrl(API_ENDPOINTS.FRIEND.DECLINE.replace(':id', requestId)), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });

  return { data: await response.json(), status: response.status };
};

export const addFriend = async (userId) => {
  await mockDelay(400);
  
  const timestamp = Date.now();
  localStorage.setItem(`friend_request_sent_${userId}`, timestamp.toString());

  const response = await fetch(getApiUrl(API_ENDPOINTS.FRIEND.ADD.replace(':id', userId)), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });

  return { data: await response.json(), status: response.status };
};

export const removeFriend = async (friendId) => {
  await mockDelay(400);
  
  const currentFriends = JSON.parse(localStorage.getItem('friends_list') || JSON.stringify(mockAllFriends));
  const updatedFriends = currentFriends.filter(friend => friend.id !== friendId);
  localStorage.setItem('friends_list', JSON.stringify(updatedFriends));

  const response = await fetch(getApiUrl(API_ENDPOINTS.FRIEND.REMOVE.replace(':id', friendId)), {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });

  return { data: await response.json(), status: response.status };
};
