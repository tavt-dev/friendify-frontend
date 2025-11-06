import { USE_MOCK_DATA_FOR_READS, getApiUrl, API_ENDPOINTS } from '../config/apiConfig';
import { mockGroups, mockSuggestedGroups, mockGroupMembers, mockGroupPosts } from '../utils/comprehensiveMockData';
import { getToken } from './localStorageService';

const mockDelay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const getMyGroups = async () => {
  if (USE_MOCK_DATA_FOR_READS) {
    await mockDelay();
    return {
      data: { result: mockGroups.filter(g => g.isMember) },
      status: 200,
    };
  }

  const response = await fetch(getApiUrl(API_ENDPOINTS.GROUP.MY_GROUPS), {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
  return { data: await response.json(), status: response.status };
};

export const getSuggestedGroups = async () => {
  if (USE_MOCK_DATA_FOR_READS) {
    await mockDelay();
    return {
      data: { result: mockSuggestedGroups },
      status: 200,
    };
  }

  const response = await fetch(getApiUrl(API_ENDPOINTS.GROUP.SUGGESTED), {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
  return { data: await response.json(), status: response.status };
};

export const getDiscoverGroups = async () => {
  if (USE_MOCK_DATA_FOR_READS) {
    await mockDelay();
    return {
      data: { result: [...mockGroups, ...mockSuggestedGroups] },
      status: 200,
    };
  }

  const response = await fetch(getApiUrl(API_ENDPOINTS.GROUP.DISCOVER), {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
  return { data: await response.json(), status: response.status };
};

export const getGroupDetail = async (groupId) => {
  if (USE_MOCK_DATA_FOR_READS) {
    await mockDelay();
    const group = mockGroups.find(g => g.id === parseInt(groupId));
    return {
      data: { result: group || null },
      status: group ? 200 : 404,
    };
  }

  const response = await fetch(getApiUrl(API_ENDPOINTS.GROUP.DETAIL.replace(':id', groupId)), {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
  return { data: await response.json(), status: response.status };
};

export const getGroupMembers = async (groupId) => {
  if (USE_MOCK_DATA_FOR_READS) {
    await mockDelay();
    return {
      data: { result: mockGroupMembers[groupId] || [] },
      status: 200,
    };
  }

  const response = await fetch(getApiUrl(API_ENDPOINTS.GROUP.MEMBERS.replace(':id', groupId)), {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
  return { data: await response.json(), status: response.status };
};

export const getGroupPosts = async (groupId) => {
  if (USE_MOCK_DATA_FOR_READS) {
    await mockDelay();
    return {
      data: { result: mockGroupPosts[groupId] || [] },
      status: 200,
    };
  }

  const response = await fetch(getApiUrl(API_ENDPOINTS.GROUP.POSTS.replace(':id', groupId)), {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
  return { data: await response.json(), status: response.status };
};

export const createGroup = async (groupData) => {
  await mockDelay(400);
  
  const newGroup = {
    ...groupData,
    id: Date.now(),
    members: 1,
    createdAt: new Date().toISOString(),
    isAdmin: true,
    isMember: true,
  };

  const currentGroups = JSON.parse(localStorage.getItem('user_groups') || '[]');
  currentGroups.push(newGroup);
  localStorage.setItem('user_groups', JSON.stringify(currentGroups));

  const response = await fetch(getApiUrl(API_ENDPOINTS.GROUP.CREATE), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(groupData),
  });

  return { data: await response.json(), status: response.status };
};

export const joinGroup = async (groupId) => {
  await mockDelay(400);
  
  localStorage.setItem(`group_joined_${groupId}`, Date.now().toString());

  const response = await fetch(getApiUrl(API_ENDPOINTS.GROUP.JOIN.replace(':id', groupId)), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });

  return { data: await response.json(), status: response.status };
};

export const leaveGroup = async (groupId) => {
  await mockDelay(400);
  
  localStorage.removeItem(`group_joined_${groupId}`);

  const response = await fetch(getApiUrl(API_ENDPOINTS.GROUP.LEAVE.replace(':id', groupId)), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });

  return { data: await response.json(), status: response.status };
};

export const createGroupPost = async (groupId, postData) => {
  await mockDelay(400);
  
  const newPost = {
    ...postData,
    id: `gp-${Date.now()}`,
    timestamp: 'Just now',
    likes: 0,
    comments: 0,
    shares: 0,
    isLiked: false,
  };

  const storageKey = `group_${groupId}_posts`;
  const currentPosts = JSON.parse(localStorage.getItem(storageKey) || '[]');
  currentPosts.unshift(newPost);
  localStorage.setItem(storageKey, JSON.stringify(currentPosts));

  const response = await fetch(getApiUrl(API_ENDPOINTS.GROUP.POSTS.replace(':id', groupId)), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
  });

  return { data: await response.json(), status: response.status };
};
