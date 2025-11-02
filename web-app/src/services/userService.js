import { getToken } from "./localStorageService";

const getMockUser = () => {
  const userStr = localStorage.getItem('mock_user');
  return userStr ? JSON.parse(userStr) : {
    id: 1,
    username: 'demo_user',
    email: 'demo@example.com',
    firstName: 'Demo',
    lastName: 'User',
    city: 'San Francisco',
    dob: '1990-01-01',
    avatar: null,
  };
};

export const getMyInfo = async () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!getToken()) {
        reject({ response: { status: 401 } });
        return;
      }
      
      const user = getMockUser();
      resolve({ 
        data: { 
          result: user 
        },
        status: 200
      });
    }, 300);
  });
};

export const updateProfile = async (profileData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const currentUser = getMockUser();
      const updatedUser = { ...currentUser, ...profileData };
      localStorage.setItem('mock_user', JSON.stringify(updatedUser));
      
      resolve({ 
        data: { 
          result: updatedUser 
        },
        status: 200
      });
    }, 400);
  });
};

export const uploadAvatar = async (formData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const file = formData.get('file');
      const avatarUrl = file ? URL.createObjectURL(file) : null;
      
      const currentUser = getMockUser();
      const updatedUser = { ...currentUser, avatar: avatarUrl };
      localStorage.setItem('mock_user', JSON.stringify(updatedUser));
      
      resolve({ 
        data: { 
          result: { 
            avatar: avatarUrl 
          } 
        },
        status: 200
      });
    }, 500);
  });
};

export const search = async (keyword) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockResults = [
        { id: 1, username: 'alice_johnson', email: 'alice@example.com', avatar: null },
        { id: 2, username: 'bob_smith', email: 'bob@example.com', avatar: null },
        { id: 3, username: 'carol_davis', email: 'carol@example.com', avatar: null },
      ].filter(user => 
        user.username.toLowerCase().includes(keyword.toLowerCase()) ||
        user.email.toLowerCase().includes(keyword.toLowerCase())
      );
      
      resolve({ 
        data: { 
          result: mockResults 
        },
        status: 200
      });
    }, 300);
  });
};
