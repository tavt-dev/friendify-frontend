export const USE_MOCK_DATA_FOR_READS = true;

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.example.com';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY: '/auth/verify',
    RESEND_VERIFICATION: '/auth/resend-verification',
  },
  USER: {
    ME: '/user/me',
    UPDATE_PROFILE: '/user/profile',
    UPLOAD_AVATAR: '/user/avatar',
    SEARCH: '/user/search',
  },
  POST: {
    LIST: '/posts',
    CREATE: '/posts',
    UPDATE: '/posts/:id',
    DELETE: '/posts/:id',
    MY_POSTS: '/posts/me',
  },
  FRIEND: {
    REQUESTS: '/friends/requests',
    SUGGESTIONS: '/friends/suggestions',
    LIST: '/friends',
    ACCEPT: '/friends/accept/:id',
    DECLINE: '/friends/decline/:id',
    REMOVE: '/friends/:id',
    ADD: '/friends/add/:id',
  },
  GROUP: {
    MY_GROUPS: '/groups/my',
    SUGGESTED: '/groups/suggested',
    DISCOVER: '/groups/discover',
    DETAIL: '/groups/:id',
    MEMBERS: '/groups/:id/members',
    POSTS: '/groups/:id/posts',
    CREATE: '/groups',
    JOIN: '/groups/:id/join',
    LEAVE: '/groups/:id/leave',
  },
  CHAT: {
    CONVERSATIONS: '/chat/conversations',
    MESSAGES: '/chat/conversations/:id/messages',
    SEND: '/chat/conversations/:id/messages',
    CREATE_CONVERSATION: '/chat/conversations',
  },
  MARKETPLACE: {
    ITEMS: '/marketplace/items',
    CATEGORIES: '/marketplace/categories',
  },
  PAGE: {
    LIST: '/pages',
    SUGGESTED: '/pages/suggested',
    FOLLOW: '/pages/:id/follow',
    UNFOLLOW: '/pages/:id/unfollow',
  },
  SAVED: {
    ITEMS: '/saved',
    ADD: '/saved',
    REMOVE: '/saved/:id',
  },
};

export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};
