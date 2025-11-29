import { getToken, removeToken, setToken } from "./localStorageService";
import { API_ENDPOINTS, CONFIG } from "../config/apiConfig";
import { apiFetch } from "./apiHelper";

/**
 * Login with username and password
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Promise<{data: any, status: number}>}
 */
export const logIn = async (username, password) => {
  if (!username || typeof username !== 'string') {
    throw new Error('Username is required');
  }
  if (!password || typeof password !== 'string') {
    throw new Error('Password is required');
  }

  try {
    const response = await apiFetch(API_ENDPOINTS.IDENTITY.LOGIN, {
      method: 'POST',
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });

    const token = response.data?.result?.token || response.data?.token || response.data?.data?.token;
    if (token) {
      setToken(token);
    } else {
      console.warn("No token found in response:", response.data);
    }

    return response;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

/**
 * Logout current user
 */
export const logOut = () => {
  removeToken();
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Register a new account
 * @param {Object} userData - User data { username, email, password, firstName, lastName }
 * @returns {Promise<{data: any, status: number}>}
 */
export const registerAccount = async ({ username, email, password, firstName, lastName}) => {
  if (!username || typeof username !== 'string') {
    throw new Error('Username is required');
  }
  if (!email || typeof email !== 'string') {
    throw new Error('Email is required');
  }
  if (!password || typeof password !== 'string') {
    throw new Error('Password is required');
  }
  if (!firstName || typeof firstName !== 'string') {
    throw new Error('First name is required');
  }
  if (!lastName || typeof lastName !== 'string') {
    throw new Error('Last name is required');
  }

  try {
    const response = await apiFetch(API_ENDPOINTS.IDENTITY.REGISTER, {
      method: 'POST',
      body: JSON.stringify({
        username: username,
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
      }),
    });

    return response;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise<{data: any, status: number}>}
 */
export const requestPasswordReset = async (email) => {
  if (!email || typeof email !== 'string') {
    throw new Error('Email is required');
  }

  try {
    const response = await apiFetch(API_ENDPOINTS.IDENTITY.FORGOT_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({
        email: email,
      }),
    });

    return response;
  } catch (error) {
    console.error('Password reset request failed:', error);
    throw error;
  }
};

/**
 * Reset password with OTP
 * @param {Object} resetData - Reset data { email, otpCode, newPassword }
 * @returns {Promise<{data: any, status: number}>}
 */
export const resetPassword = async ({ email, otpCode, newPassword }) => {
  if (!email || typeof email !== 'string') {
    throw new Error('Email is required');
  }
  if (!otpCode || typeof otpCode !== 'string') {
    throw new Error('OTP code is required');
  }
  if (!newPassword || typeof newPassword !== 'string') {
    throw new Error('New password is required');
  }

  try {
    const response = await apiFetch(API_ENDPOINTS.IDENTITY.RESET_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({
        email: email,
        otpCode: otpCode,
        newPassword: newPassword,
      }),
    });

    return response;
  } catch (error) {
    console.error('Password reset failed:', error);
    throw error;
  }
};

/**
 * Resend verification OTP
 * @param {string} email - User email
 * @returns {Promise<{data: any, status: number}>}
 */
export const resendVerification = async (email) => {
  if (!email || typeof email !== 'string') {
    throw new Error('Email is required');
  }

  try {
    const response = await apiFetch(API_ENDPOINTS.IDENTITY.RESEND_OTP, {
      method: 'POST',
      body: JSON.stringify({
        email: email,
      }),
    });

    return response;
  } catch (error) {
    console.error('Resend verification failed:', error);
    throw error;
  }
};

/**
 * Verify user with OTP
 * @param {Object} verifyData - Verify data { email, otpCode }
 * @returns {Promise<{data: any, status: number}>}
 */
export const verifyUser = async ({ email, otpCode }) => {
  if (!email || typeof email !== 'string') {
    throw new Error('Email is required');
  }
  if (!otpCode || typeof otpCode !== 'string') {
    throw new Error('OTP code is required');
  }

  try {
    const response = await apiFetch(API_ENDPOINTS.IDENTITY.VERIFY_USER, {
      method: 'POST',
      body: JSON.stringify({
        email: email,
        otpCode: otpCode,
      }),
    });
    return response;
  } catch (error) {
    console.error('User verification failed:', error);
    throw error;
  }
};

/**
 * Login with Google OAuth
 */
export const loginWithGoogle = () => {
  // Use relative path to go through Vite proxy -> Gateway
  const googleLoginUrl = `/api/v1/identity/oauth2/authorization/google`;
  
  window.location.href = googleLoginUrl;
};
