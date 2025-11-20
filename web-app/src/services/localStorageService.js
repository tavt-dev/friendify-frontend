export const KEY_TOKEN = "accessToken";

// Custom event name for token changes
export const TOKEN_CHANGED_EVENT = 'tokenChanged';

export const setToken = (token) => {
  localStorage.setItem(KEY_TOKEN, token);
  // Dispatch custom event when token is set
  window.dispatchEvent(new CustomEvent(TOKEN_CHANGED_EVENT, { detail: { token } }));
};

export const getToken = () => {
  return localStorage.getItem(KEY_TOKEN);
};

export const removeToken = () => {
  localStorage.removeItem(KEY_TOKEN);
  // Dispatch custom event when token is removed
  window.dispatchEvent(new CustomEvent(TOKEN_CHANGED_EVENT, { detail: { token: null } }));
};
