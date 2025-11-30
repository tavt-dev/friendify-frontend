// src/config/apiConfig.js

// Cấu hình API Gateway
export const CONFIG = {
  API_GATEWAY: "/api/v1",
  

  WS_URL: "/chat/ws", 
};

// Helper function 
export const getApiUrl = (endpoint) => {
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (cleanEndpoint.startsWith(CONFIG.API_GATEWAY)) {
    return cleanEndpoint;
  }
  return `${CONFIG.API_GATEWAY}${cleanEndpoint}`;
};

export const API_ENDPOINTS = {
  // --- IDENTITY SERVICE (Port 8081) ---
  IDENTITY: {
    LOGIN: '/identity/auth/token',
    REGISTER: '/identity/auth/registration',
    VERIFY_USER: '/identity/auth/verify-user',
    RESEND_OTP: '/identity/auth/resend-verification',
    REFRESH_TOKEN: '/identity/auth/refresh',
    LOGOUT: '/identity/auth/logout',
    FORGOT_PASSWORD: '/identity/auth/forgot-password',
    RESET_PASSWORD: '/identity/auth/reset-password',
    INTROSPECT: '/identity/auth/introspect',
    MY_INFO: '/identity/users/myInfo',
    CHANGE_PASSWORD: '/identity/users/change-password',
  },

  // --- PROFILE SERVICE (Port 8082) ---
  USER: {
    // Gateway Route: /profile/users/**
    MY_PROFILE: '/profile/users/my-profile',
    UPDATE_PROFILE: '/profile/users/my-profile',
    SEARCH: '/profile/users/search',
    UPDATE_AVATAR: '/profile/users/avatar',
    UPDATE_BACKGROUND: '/profile/users/background',
    GET_ALL_PROFILES: '/profile/users',
    GET_PROFILE: '/profile/users/:id', 
    BATCH_PROFILES: '/profile/internal/users/batch',
  },

  // --- POST SERVICE (Port 8084) ---
  POST: {
    CREATE: '/post/create',
    CREATE_JSON: '/post/json',
    MY_POSTS: '/post/my-posts',
    GET_BY_ID: '/post/:id',
    UPDATE: '/post/:id',
    UPDATE_JSON: '/post/:id/json',
    DELETE: '/post/:id',
    SHARE: '/post/share/:id', 
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
    FEED: '/post/feed',
    GROUP_POSTS: '/post/group/:id',
  },

  // --- INTERACTION SERVICE (Port 8088) ---
  INTERACTION: {
    CREATE_COMMENT: '/interaction/comments',
    GET_POST_COMMENTS: '/interaction/comments/post/:id',
    GET_COMMENT_BY_ID: '/interaction/comments/:id',
    GET_COMMENT_REPLIES: '/interaction/comments/:id/replies',
    UPDATE_COMMENT: '/interaction/comments/:id',
    DELETE_COMMENT: '/interaction/comments/:id',
    
    // Likes - Backend: @RequestMapping("/likes")
    LIKE: '/interaction/likes',
    UNLIKE_BY_ID: '/interaction/likes/:id',
    UNLIKE_POST: '/interaction/likes/post/:id',
    UNLIKE_COMMENT: '/interaction/likes/comment/:id',
    GET_POST_LIKES: '/interaction/likes/post/:id',
    
    // Internal APIs
    INTERNAL_LIKE_COUNT: '/interaction/internal/likes/post/:id/count',
    INTERNAL_IS_LIKED: '/interaction/internal/likes/post/:id/is-liked',
    INTERNAL_COMMENT_COUNT: '/interaction/internal/comments/post/:id/count',
  },

  // --- GROUP SERVICE (Port 8089) ---
  // Gateway route: /api/v1/group/** -> backend: /group/groups/**
  GROUP: {
    CREATE: '/group/groups',
    GET_ALL: '/group/groups',
    UPDATE: '/group/groups/:id',
    DELETE: '/group/groups/:id',
    DETAIL: '/group/groups/:id',
    UPLOAD_AVATAR: '/group/groups/:id/avatar',
    UPLOAD_COVER: '/group/groups/:id/cover',
    MY_GROUPS: '/group/groups/my-groups',
    JOINED_GROUPS: '/group/groups/joined-groups',
    SEARCH: '/group/groups/search',
    JOIN: '/group/groups/:id/join',
    LEAVE: '/group/groups/:id/leave',
    MEMBERS: '/group/groups/:id/members',
    ADD_MEMBER: '/group/groups/:id/members/:userId',
    REMOVE_MEMBER: '/group/groups/:id/members/:userId',
    UPDATE_MEMBER_ROLE: '/group/groups/:id/members/:userId/role',
    JOIN_REQUESTS: '/group/groups/:id/join-requests',
    MY_JOIN_REQUESTS: '/group/groups/my-join-requests',
    PROCESS_JOIN_REQUEST: '/group/groups/:id/join-requests/:requestId/process',
    CANCEL_JOIN_REQUEST: '/group/groups/:id/join-requests/:requestId',
  },

  // --- SOCIAL SERVICE (Port 8087) ---
  FRIEND: {
    // Friendships
    SEND_REQUEST: '/social/friendships/:id', // POST
    ACCEPT_REQUEST: '/social/friendships/:id/accept', // POST
    REJECT_REQUEST: '/social/friendships/:id/reject', // POST
    REMOVE_FRIEND: '/social/friendships/:id', // DELETE
    LIST_FRIENDS: '/social/friendships/friends',
    SENT_REQUESTS: '/social/friendships/sent-requests',
    RECEIVED_REQUESTS: '/social/friendships/received-requests',
    SEARCH: '/social/friendships/search',
    SUGGESTIONS: '/social/friendships/suggestions',
    
    // Follows
    FOLLOW: '/social/follows/:id', // POST
    UNFOLLOW: '/social/follows/:id', // DELETE
    FOLLOWING_LIST: '/social/follows/following/:id',
    FOLLOWER_LIST: '/social/follows/followers/:id',
    SOCIAL_INFO: '/social/follows/info/:id',

    // Blocks
    BLOCK: '/social/blocks/:id', // POST
    UNBLOCK: '/social/blocks/:id', // DELETE
    BLOCK_LIST: '/social/blocks',
  },

  // --- CHAT SERVICE (Port 8086) ---
  CHAT: {
    CONVERSATIONS: '/chat/conversations/my-conversations',
    CONVERSATION_DETAIL: '/chat/conversations/:id',
    CREATE_CONVERSATION: '/chat/conversations',
    UPDATE_CONVERSATION: '/chat/conversations/:id',
    DELETE_CONVERSATION: '/chat/conversations/:id',
    ADD_PARTICIPANTS: '/chat/conversations/:id/participants',
    REMOVE_PARTICIPANT: '/chat/conversations/:id/participants/:participantId',
    LEAVE_CONVERSATION: '/chat/conversations/:id/leave',
    ADD_ADMIN: '/chat/conversations/:id/admins',
    REMOVE_ADMIN: '/chat/conversations/:id/admins/:participantId',
    PROMOTE_TO_ADMIN: '/chat/conversations/:id/admins',
    DEMOTE_FROM_ADMIN: '/chat/conversations/:id/admins/:participantId',
    
    MESSAGES: '/chat/messages',
    MESSAGES_PAGINATED: '/chat/messages/paginated',
    CREATE_MESSAGE: '/chat/messages',
    MESSAGE_DETAIL: '/chat/messages/:id',
    UPDATE_MESSAGE: '/chat/messages/:id',
    DELETE_MESSAGE: '/chat/messages/:id',
    MARK_READ: '/chat/messages/:id/read',
    READ_RECEIPTS: '/chat/messages/:id/read-receipts',
    UNREAD_COUNT: '/chat/messages/unread-count',
  },

  // --- FILE SERVICE (Port 8085) ---
  FILE: {
    UPLOAD: '/file/images/upload-form-data',
    UPLOAD_MULTIPLE: '/file/images/upload-multiple-form-data',
  },

  // --- NOTIFICATION SERVICE (Port 8083) ---
  NOTIFICATION: {
    LIST: '/notification/notifications',
    MARK_READ: '/notification/notifications/:id/read',
    MARK_ALL_READ: '/notification/notifications/read-all',
    UNREAD_COUNT: '/notification/notifications/unread-count',
    SEND_EMAIL: '/notification/email/send',
  }
};