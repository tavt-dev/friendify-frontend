import { API_ENDPOINTS } from '../config/apiConfig';
import { apiFetch } from './apiHelper';

export const getFriendRequests = async (page = 1, size = 20) => {
  return apiFetch(`${API_ENDPOINTS.FRIEND.RECEIVED_REQUESTS}?page=${page}&size=${size}`);
};

export const getFriendSuggestions = async (page = 1, size = 20) => {
  return apiFetch(API_ENDPOINTS.FRIEND.SUGGESTIONS);
};

export const getAllFriends = async (userId = null, page = 1, size = 20) => {
  // If userId is provided, get friends of that user, otherwise get current user's friends
  const endpoint = userId 
    ? `${API_ENDPOINTS.FRIEND.LIST_FRIENDS}?userId=${userId}&page=${page}&size=${size}`
    : `${API_ENDPOINTS.FRIEND.LIST_FRIENDS}?page=${page}&size=${size}`;
  return apiFetch(endpoint);
};

export const acceptFriendRequest = async (friendId) => {
  return apiFetch(API_ENDPOINTS.FRIEND.ACCEPT_REQUEST.replace(':id', friendId), {
    method: 'POST',
  });
};

export const declineFriendRequest = async (friendId) => {
  return apiFetch(API_ENDPOINTS.FRIEND.REJECT_REQUEST.replace(':id', friendId), {
    method: 'POST',
  });
};

export const addFriend = async (userId) => {
  const endpoint = API_ENDPOINTS.FRIEND.SEND_REQUEST.replace(':id', userId);
  console.log('Sending friend request to:', endpoint);
  try {
    const response = await apiFetch(endpoint, {
      method: 'POST',
    });
    console.log('Friend request response:', response);
    return response;
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
};

export const removeFriend = async (friendId) => {
  return apiFetch(API_ENDPOINTS.FRIEND.REMOVE_FRIEND.replace(':id', friendId), {
    method: 'DELETE',
  });
};

export const getSentFriendRequests = async (page = 1, size = 20) => {
  return apiFetch(`${API_ENDPOINTS.FRIEND.SENT_REQUESTS}?page=${page}&size=${size}`);
};

export const cancelFriendRequest = async (userId) => {
  // Cancel sent friend request - use DELETE on the same endpoint as SEND_REQUEST
  return apiFetch(API_ENDPOINTS.FRIEND.SEND_REQUEST.replace(':id', userId), {
    method: 'DELETE',
  });
};

/**
 * Search friends with friendship status
 * @param {string} keyword - Search keyword
 * @returns {Promise<{data: {result: ProfileResponse[]}, status: number}>}
 */
export const searchFriends = async (keyword) => {
  if (!keyword || keyword.trim().length === 0) {
    return { data: { result: [] }, status: 200 };
  }

  return apiFetch(`${API_ENDPOINTS.FRIEND.SEARCH}?keyword=${encodeURIComponent(keyword.trim())}`);
};

// Follow functions
export const followUser = async (userId) => {
  const endpoint = API_ENDPOINTS.FRIEND.FOLLOW.replace(':id', userId);
  console.log('Following user:', endpoint);
  try {
    const response = await apiFetch(endpoint, {
      method: 'POST',
    });
    console.log('Follow response:', response);
    return response;
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

export const unfollowUser = async (userId) => {
  return apiFetch(API_ENDPOINTS.FRIEND.UNFOLLOW.replace(':id', userId), {
    method: 'DELETE',
  });
};

export const getFollowingList = async (userId, page = 1, size = 20) => {
  const endpoint = `${API_ENDPOINTS.FRIEND.FOLLOWING_LIST.replace(':id', userId)}?page=${page}&size=${size}`;
  return apiFetch(endpoint);
};

export const getFollowerList = async (userId, page = 1, size = 20) => {
  const endpoint = `${API_ENDPOINTS.FRIEND.FOLLOWER_LIST.replace(':id', userId)}?page=${page}&size=${size}`;
  return apiFetch(endpoint);
};

export const getSocialInfo = async (userId) => {
  const endpoint = API_ENDPOINTS.FRIEND.SOCIAL_INFO.replace(':id', userId);
  console.log('Getting social info from:', endpoint);
  try {
    const response = await apiFetch(endpoint);
    console.log('Social info response:', response);
    return response;
  } catch (error) {
    console.error('Error getting social info:', error);
    throw error;
  }
};

// Block functions
export const blockUser = async (userId) => {
  return apiFetch(API_ENDPOINTS.FRIEND.BLOCK.replace(':id', userId), {
    method: 'POST',
  });
};

export const unblockUser = async (userId) => {
  return apiFetch(API_ENDPOINTS.FRIEND.UNBLOCK.replace(':id', userId), {
    method: 'DELETE',
  });
};

export const getBlockedList = async (page = 1, size = 20) => {
  const endpoint = `${API_ENDPOINTS.FRIEND.BLOCK_LIST}?page=${page}&size=${size}`;
  return apiFetch(endpoint);
};