// API Gateway configuration
export const CONFIG = {
  API_GATEWAY: "http://localhost:8080/api/v1",
  IDENTITY_SERVICE: "http://localhost:8081/identity",
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  // If endpoint already starts with http, return as is
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  
  // If endpoint starts with /, use API_GATEWAY
  if (endpoint.startsWith('/')) {
    return `${CONFIG.API_GATEWAY}${endpoint}`;
  }
  
  // Otherwise, append to API_GATEWAY with /
  return `${CONFIG.API_GATEWAY}/${endpoint}`;
};

// API Endpoints configuration
export const API_ENDPOINTS = {
  POST: {
    CREATE: '/post/create',
    MY_POSTS: '/post/my-posts',
    GET_BY_ID: '/post/:id',
    UPDATE: '/post/:id',
    DELETE: '/post/:id',
    SAVE: '/post/save/:id',
    UNSAVE: '/post/unsave/:id',
    SAVED_POSTS: '/post/saved-posts',
    SHARE: '/post/share/:id',
    SHARED_POSTS: '/post/shared-posts/:id',
    SHARE_COUNT: '/post/share-count/:id',
    IS_SAVED: '/post/is-saved/:id',
    USER_POSTS: '/post/user/:id',
    MY_SHARED_POSTS: '/post/my-shared-posts',
    SAVED_COUNT: '/post/saved-count',
    SEARCH: '/post/search',
    PUBLIC_POSTS: '/post/public',
    SEARCH_FRIENDS: '/post/friends/search',
  },
  FRIEND: {
    LIST: '/social/friendships/friends',
    REQUESTS: '/social/friendships/received-requests',
    SENT_REQUESTS: '/social/friendships/sent-requests',
    ADD: '/social/friendships/:id',
    ACCEPT: '/social/friendships/:id/accept',
    DECLINE: '/social/friendships/:id/reject',
    REMOVE: '/social/friendships/:id',
    SEARCH: '/social/friendships/search',
    SUGGESTIONS: '/profile/users', // Get all profiles as suggestions (backend doesn't have dedicated suggestions endpoint)
  },
  USER: {
    SEARCH: '/profile/users/search',
    GET_PROFILE: '/profile/:id',
    UPDATE_BACKGROUND: '/profile/users/background',
  },
  CHAT: {
    CONVERSATIONS: '/chat/conversations/my-conversations',
    MESSAGES: '/chat/messages/:id',
    SEND: '/chat/messages/:id',
    CREATE_CONVERSATION: '/chat/conversations/create',
  },
  GROUP: {
    MY_GROUPS: '/group/my-groups',
    SUGGESTED: '/group/suggested',
    DISCOVER: '/group/discover',
    DETAIL: '/group/:id',
    MEMBERS: '/group/:id/members',
    POSTS: '/group/:id/posts',
    CREATE: '/group/create',
    JOIN: '/group/:id/join',
    LEAVE: '/group/:id/leave',
  },
  SAVED: {
    ITEMS: '/post/saved-posts',
    ADD: '/post/save/:id',
    REMOVE: '/post/unsave/:id',
  },
  PAGE: {
    LIST: '/page/list',
    SUGGESTED: '/page/suggested',
    FOLLOW: '/page/:id/follow',
    UNFOLLOW: '/page/:id/unfollow',
  },
  MARKETPLACE: {
    ITEMS: '/marketplace/items',
    CATEGORIES: '/marketplace/categories',
  },
};

