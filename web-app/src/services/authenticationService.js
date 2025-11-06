import { getToken, removeToken, setToken } from "./localStorageService";
import { getApiUrl, API_ENDPOINTS } from '../config/apiConfig';

const MOCK_USER = {
  id: 1,
  username: 'demo_user',
  email: 'demo@example.com',
  firstName: 'Demo',
  lastName: 'User',
  avatar: null,
};

export const logIn = async (username, password) => {
  try {
    const response = await fetch(getApiUrl(API_ENDPOINTS.AUTH.LOGIN), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok && data.result?.token) {
      const { token, user } = data.result;
      setToken(token);
      localStorage.setItem('mock_user', JSON.stringify(user));
      return { data, status: response.status };
    } else {
      throw new Error(data.message || 'Invalid credentials');
    }
  } catch (error) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (username && password) {
          const token = 'mock-jwt-token-' + Date.now();
          setToken(token);
          localStorage.setItem('mock_user', JSON.stringify(MOCK_USER));
          resolve({
            data: {
              result: {
                token,
                user: MOCK_USER
              }
            },
            status: 200
          });
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 500);
    });
  }
};

export const logOut = () => {
  removeToken();
  localStorage.removeItem('mock_user');
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const registerAccount = async ({ username, email, password }) => {
  try {
    const response = await fetch(getApiUrl(API_ENDPOINTS.AUTH.REGISTER), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (response.ok && data.result?.token) {
      const { token, user } = data.result;
      setToken(token);
      localStorage.setItem('mock_user', JSON.stringify(user));
      return { data, status: response.status };
    }

    return { data, status: response.status };
  } catch (error) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser = {
          id: Date.now(),
          username,
          email,
          avatar: null
        };
        const token = 'mock-jwt-token-' + Date.now();
        setToken(token);
        localStorage.setItem('mock_user', JSON.stringify(newUser));
        resolve({
          data: {
            result: {
              token,
              user: newUser
            }
          },
          status: 201
        });
      }, 500);
    });
  }
};

export const requestPasswordReset = async (email) => {
  try {
    const response = await fetch(getApiUrl(API_ENDPOINTS.AUTH.FORGOT_PASSWORD), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    return { data, status: response.status };
  } catch (error) {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.setItem('password_reset_email', email);
        resolve({
          data: {
            message: 'Password reset email sent'
          },
          status: 200
        });
      }, 500);
    });
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const response = await fetch(getApiUrl(API_ENDPOINTS.AUTH.RESET_PASSWORD), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('password_reset_success', Date.now().toString());
    }

    return { data, status: response.status };
  } catch (error) {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.setItem('password_reset_success', Date.now().toString());
        resolve({
          data: {
            message: 'Password reset successful'
          },
          status: 200
        });
      }, 500);
    });
  }
};

export const resendVerification = async (email) => {
  try {
    const response = await fetch(getApiUrl(API_ENDPOINTS.AUTH.RESEND_VERIFICATION), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('verification_resent', Date.now().toString());
    }

    return { data, status: response.status };
  } catch (error) {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.setItem('verification_resent', Date.now().toString());
        resolve({
          data: {
            message: 'Verification email resent'
          },
          status: 200
        });
      }, 500);
    });
  }
};

export const verifyUser = async ({ email, otpCode }) => {
  try {
    const response = await fetch(getApiUrl(API_ENDPOINTS.AUTH.VERIFY), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otpCode }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('user_verified', Date.now().toString());
      localStorage.removeItem('verifyEmail');
      localStorage.removeItem('verifyContext');
      localStorage.removeItem('verifyIssuedAt');
    }

    return { data, status: response.status };
  } catch (error) {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.setItem('user_verified', Date.now().toString());
        localStorage.removeItem('verifyEmail');
        localStorage.removeItem('verifyContext');
        localStorage.removeItem('verifyIssuedAt');
        resolve({
          data: {
            message: 'User verified successfully'
          },
          status: 200
        });
      }, 500);
    });
  }
};
