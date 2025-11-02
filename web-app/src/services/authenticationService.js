import { getToken, removeToken, setToken } from "./localStorageService";

const MOCK_USER = {
  id: 1,
  username: 'demo_user',
  email: 'demo@example.com',
  avatar: null,
};

export const logIn = async (username, password) => {
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
};

export const logOut = () => {
  removeToken();
  localStorage.removeItem('mock_user');
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const registerAccount = async ({ username, email, password }) => {
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
};

export const requestPasswordReset = async (email) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ 
        data: { 
          message: 'Password reset email sent' 
        },
        status: 200
      });
    }, 500);
  });
};

export const resetPassword = async (token, newPassword) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ 
        data: { 
          message: 'Password reset successful' 
        },
        status: 200
      });
    }, 500);
  });
};

export const resendVerification = async (email) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ 
        data: { 
          message: 'Verification email resent' 
        },
        status: 200
      });
    }, 500);
  });
};

export const verifyUser = async ({ email, otpCode }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ 
        data: { 
          message: 'User verified successfully' 
        },
        status: 200
      });
    }, 500);
  });
};
