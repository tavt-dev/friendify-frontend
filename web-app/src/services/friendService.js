import { getApiUrl, API_ENDPOINTS } from '../config/apiConfig';
import { getToken } from './localStorageService';

export const getFriendRequests = async (page = 1, size = 20) => {
  try {
    const url = getApiUrl(`${API_ENDPOINTS.FRIEND.REQUESTS}?page=${page}&size=${size}`);
    console.log('Fetching friend requests from:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Friend requests API error:', response.status, errorData);
      throw { response: { status: response.status, data: errorData } };
    }

    const data = await response.json();
    console.log('Friend requests response:', data);
    return { data, status: response.status };
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    throw error;
  }
};

export const getFriendSuggestions = async (page = 1, size = 20) => {
  try {
    // Backend doesn't have dedicated suggestions endpoint
    // Use /profile/users to get all profiles, then filter out friends and current user
    const url = getApiUrl(API_ENDPOINTS.FRIEND.SUGGESTIONS);
    console.log('Fetching friend suggestions from:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Friend suggestions API error:', response.status, errorData);
      throw { response: { status: response.status, data: errorData } };
    }

    const data = await response.json();
    console.log('Friend suggestions response:', data);
    return { data, status: response.status };
  } catch (error) {
    console.error('Error fetching friend suggestions:', error);
    throw error;
  }
};

export const getAllFriends = async (page = 1, size = 20) => {
  try {
    const url = getApiUrl(`${API_ENDPOINTS.FRIEND.LIST}?page=${page}&size=${size}`);
    console.log('Fetching all friends from:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('All friends API error:', response.status, errorData);
      throw { response: { status: response.status, data: errorData } };
    }

    const data = await response.json();
    console.log('All friends response:', data);
    return { data, status: response.status };
  } catch (error) {
    console.error('Error fetching friends:', error);
    throw error;
  }
};

export const acceptFriendRequest = async (friendId) => {
  try {
    const response = await fetch(getApiUrl(API_ENDPOINTS.FRIEND.ACCEPT.replace(':id', friendId)), {
      method: 'POST',
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
    console.error('Error accepting friend request:', error);
    throw error;
  }
};

export const declineFriendRequest = async (friendId) => {
  try {
    const response = await fetch(getApiUrl(API_ENDPOINTS.FRIEND.DECLINE.replace(':id', friendId)), {
      method: 'POST',
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
    console.error('Error declining friend request:', error);
    throw error;
  }
};

export const addFriend = async (userId) => {
  try {
    const response = await fetch(getApiUrl(API_ENDPOINTS.FRIEND.ADD.replace(':id', userId)), {
      method: 'POST',
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
    console.error('Error adding friend:', error);
    throw error;
  }
};

export const removeFriend = async (friendId) => {
  try {
    const response = await fetch(getApiUrl(API_ENDPOINTS.FRIEND.REMOVE.replace(':id', friendId)), {
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
    console.error('Error removing friend:', error);
    throw error;
  }
};

// Get sent friend requests
export const getSentFriendRequests = async (page = 1, size = 20) => {
  try {
    const url = getApiUrl(`${API_ENDPOINTS.FRIEND.SENT_REQUESTS}?page=${page}&size=${size}`);
    console.log('Fetching sent friend requests from:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Sent friend requests API error:', response.status, errorData);
      throw { response: { status: response.status, data: errorData } };
    }

    const data = await response.json();
    console.log('Sent friend requests response:', data);
    return { data, status: response.status };
  } catch (error) {
    console.error('Error fetching sent friend requests:', error);
    throw error;
  }
};

/**
 * Search friends with friendship status
 * @param {string} keyword - Search keyword
 * @returns {Promise<{data: {result: ProfileResponse[]}, status: number}>}
 */
export const searchFriends = async (keyword) => {
  try {
    if (!keyword || keyword.trim().length === 0) {
      return { data: { result: [] }, status: 200 };
    }

    const url = getApiUrl(`${API_ENDPOINTS.FRIEND.SEARCH}?keyword=${encodeURIComponent(keyword.trim())}`);
    console.log('Searching friends from:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Search friends API error:', response.status, errorData);
      throw { response: { status: response.status, data: errorData } };
    }

    const data = await response.json();
    console.log('Search friends response:', data);
    return { data, status: response.status };
  } catch (error) {
    console.error('Error searching friends:', error);
    throw error;
  }
};
