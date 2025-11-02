const MOCK_USER = {
  id: 1,
  username: 'demo_user',
  email: 'demo@example.com',
  avatar: null,
};

export const login = (username, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (username && password) {
        localStorage.setItem('mock_user', JSON.stringify(MOCK_USER));
        localStorage.setItem('mock_token', 'mock-jwt-token-' + Date.now());
        resolve({ user: MOCK_USER, token: 'mock-jwt-token' });
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 500);
  });
};

export const register = (username, email, password) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newUser = { id: Date.now(), username, email, avatar: null };
      localStorage.setItem('mock_user', JSON.stringify(newUser));
      localStorage.setItem('mock_token', 'mock-jwt-token-' + Date.now());
      resolve({ user: newUser, token: 'mock-jwt-token' });
    }, 500);
  });
};

export const logout = () => {
  localStorage.removeItem('mock_user');
  localStorage.removeItem('mock_token');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('mock_token');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('mock_user');
  return userStr ? JSON.parse(userStr) : null;
};
