// API Gateway configuration
export const CONFIG = {
  API_GATEWAY: "/api/v1",
  IDENTITY_SERVICE: "/identity",
  // WebSocket URLs - use gateway for production, direct service for development
  WS_URL: "/ws", // Via API Gateway
  WS_DIRECT_URL: "/ws", // Direct to chat service (using same path as gateway)
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
    LIKE: '/post/:id/like',
    COMMENTS: '/post/:id/comments',
    SHARE: '/post/:id/share',
    SAVE: '/post/save/:id',
    UNSAVE: '/post/unsave/:id',
    SAVED_POSTS: '/post/saved-posts',
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
    GET_PROFILE: '/profile/users/:id', // Note: Backend needs /users/{id} endpoint in ProfileController. Currently using /{profileId} which doesn't match API Gateway routing
    UPDATE_BACKGROUND: '/profile/users/background',
  },
  CHAT: {
    CONVERSATIONS: '/chat/conversations/my-conversations',
    CONVERSATION_DETAIL: '/chat/conversations/:id',
    MESSAGES: '/chat/messages', // GET /chat/messages?conversationId=xxx&page=1&size=50
    MESSAGES_PAGINATED: '/chat/messages/paginated', // GET /chat/messages/paginated?conversationId=xxx&page=1&size=50
    CREATE_MESSAGE: '/chat/messages/create', // POST /chat/messages/create
    MESSAGE_DETAIL: '/chat/messages/:id', // GET /chat/messages/:id
    UPDATE_MESSAGE: '/chat/messages/:id', // PUT /chat/messages/:id
    DELETE_MESSAGE: '/chat/messages/:id', // DELETE /chat/messages/:id
    MARK_READ: '/chat/messages/:id/read', // POST /chat/messages/:id/read
    READ_RECEIPTS: '/chat/messages/:id/read-receipts', // GET /chat/messages/:id/read-receipts
    UNREAD_COUNT: '/chat/messages/unread-count', // GET /chat/messages/unread-count?conversationId=xxx
    CREATE_CONVERSATION: '/chat/conversations/create', // POST /chat/conversations/create
    UPDATE_CONVERSATION: '/chat/conversations/:id', // PUT /chat/conversations/:id
    DELETE_CONVERSATION: '/chat/conversations/:id', // DELETE /chat/conversations/:id
    ADD_PARTICIPANTS: '/chat/conversations/:id/participants', // POST /chat/conversations/:id/participants
    REMOVE_PARTICIPANT: '/chat/conversations/:id/participants/:participantId', // DELETE /chat/conversations/:id/participants/:participantId
    LEAVE_CONVERSATION: '/chat/conversations/:id/leave', // POST /chat/conversations/:id/leave
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
  NOTIFICATION: {
    LIST: '/notification/list',
    MARK_READ: '/notification/:id/read',
    MARK_ALL_READ: '/notification/read-all',
    DELETE: '/notification/:id',
  },
};

