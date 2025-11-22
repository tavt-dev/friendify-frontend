export const CONFIG = {
  API_GATEWAY: "/api/v1",
  IDENTITY_SERVICE: "/identity",
};

export const API = {
  
  LOGIN: "/identity/auth/token", // Will become /api/v1/identity/auth/token via API gateway
  MY_INFO: "/profile/users/my-profile",
  MY_POST: "/post/my-posts",
  CREATE_POST: "/post/create",
  UPDATE_PROFILE: "/profile/users/my-profile",
  UPDATE_AVATAR: "/profile/users/avatar",
  UPDATE_BACKGROUND: "/profile/users/background",
  SEARCH_USER: "/profile/users/search",
  MY_CONVERSATIONS: "/chat/conversations/my-conversations",
  CREATE_CONVERSATION: "/chat/conversations/create",
  CREATE_MESSAGE: "/chat/messages/create",
  GET_CONVERSATION_MESSAGES: "/chat/messages",
  REGISTER: "/identity/auth/registration",
  VERIFY_USER: "/identity/auth/verify-user",
  RESEND_OTP: "/identity/auth/resend-verification",
  GOOGLE_LOGIN: "/oauth2/authorization/google",
};