// src/config/apiConfig.js

// Cấu hình API Gateway
export const CONFIG = {
  // Tất cả request đi qua Gateway ở port 8080
  API_GATEWAY: "/api/v1",
  
  // WebSocket Endpoint (Đi qua Gateway vào Chat Service)
  // Backend Config: server.servlet.context-path: /chat
  WS_URL: "/chat/ws", 
};

// Helper function 
export const getApiUrl = (endpoint) => {
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  // Nếu endpoint chưa có prefix gateway 
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
    // Backend Controller map: /{profileId} nhưng Gateway ép buộc prefix /users/
    // Bạn CẦN sửa Backend: Thêm @RequestMapping("/users") vào ProfileController
    GET_PROFILE: '/profile/users/:id', 
    BATCH_PROFILES: '/profile/internal/users/batch',
  },

  // --- POST SERVICE (Port 8084) ---
  POST: {
    CREATE: '/post',
    MY_POSTS: '/post/my-posts',
    GET_BY_ID: '/post/:id',
    UPDATE: '/post/:id',
    DELETE: '/post/:id',
    // Share dùng Query Param: ?content=...
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
  },

  // --- INTERACTION SERVICE (Port 8088) ---
  INTERACTION: {
    // Comments - Backend: @RequestMapping("/comments")
    CREATE_COMMENT: '/interaction/comments',
    GET_POST_COMMENTS: '/interaction/comments/post/:id',
    UPDATE_COMMENT: '/interaction/comments/:id',
    DELETE_COMMENT: '/interaction/comments/:id',
    
    // Likes - Backend: @RequestMapping("/likes")
    LIKE: '/interaction/likes',
    UNLIKE_BY_ID: '/interaction/likes/:id',
    UNLIKE_POST: '/interaction/likes/post/:id',
    UNLIKE_COMMENT: '/interaction/likes/comment/:id',
    GET_POST_LIKES: '/interaction/likes/post/:id',
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
    CREATE_CONVERSATION: '/chat/conversations/create',
    UPDATE_CONVERSATION: '/chat/conversations/:id',
    DELETE_CONVERSATION: '/chat/conversations/:id',
    ADD_PARTICIPANTS: '/chat/conversations/:id/participants',
    REMOVE_PARTICIPANT: '/chat/conversations/:id/participants/:participantId',
    LEAVE_CONVERSATION: '/chat/conversations/:id/leave',
    ADD_ADMIN: '/chat/conversations/:id/admins',
    REMOVE_ADMIN: '/chat/conversations/:id/admins/:participantId',
    
    MESSAGES: '/chat/messages',
    MESSAGES_PAGINATED: '/chat/messages/paginated',
    CREATE_MESSAGE: '/chat/messages/create',
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
    SEND_EMAIL: '/notification/email/send',
  }
};