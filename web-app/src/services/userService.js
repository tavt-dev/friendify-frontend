import { getToken } from "./localStorageService";
import { USE_MOCK_DATA_FOR_READS, getApiUrl, API_ENDPOINTS } from '../config/apiConfig';
import { mockUsers } from '../utils/comprehensiveMockData';

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
  if (USE_MOCK_DATA_FOR_READS) {
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
  }

  try {
    const response = await fetch(getApiUrl(API_ENDPOINTS.USER.ME), {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok && data.result) {
      localStorage.setItem('mock_user', JSON.stringify(data.result));
    }

    return { data, status: response.status };
  } catch (error) {
    const user = getMockUser();
    return {
      data: { result: user },
      status: 200
    };
  }
};

export const updateProfile = async (profileData) => {
  const currentUser = getMockUser();
  const updatedUser = { ...currentUser, ...profileData };
  localStorage.setItem('mock_user', JSON.stringify(updatedUser));

  try {
    const response = await fetch(getApiUrl(API_ENDPOINTS.USER.UPDATE_PROFILE), {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();

    if (response.ok && data.result) {
      localStorage.setItem('mock_user', JSON.stringify(data.result));
      return { data, status: response.status };
    }

    return { data, status: response.status };
  } catch (error) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            result: updatedUser
          },
          status: 200
        });
      }, 400);
    });
  }
};

export const uploadAvatar = async (formData) => {
  const file = formData.get('file');
  const avatarUrl = file ? URL.createObjectURL(file) : null;

  const currentUser = getMockUser();
  const updatedUser = { ...currentUser, avatar: avatarUrl };
  localStorage.setItem('mock_user', JSON.stringify(updatedUser));

  try {
    const response = await fetch(getApiUrl(API_ENDPOINTS.USER.UPLOAD_AVATAR), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (response.ok && data.result?.avatar) {
      const updatedWithServerUrl = { ...currentUser, avatar: data.result.avatar };
      localStorage.setItem('mock_user', JSON.stringify(updatedWithServerUrl));
      return { data, status: response.status };
    }

    return {
      data: {
        result: { avatar: avatarUrl }
      },
      status: 200
    };
  } catch (error) {
    return new Promise((resolve) => {
      setTimeout(() => {
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
  }
};

export const search = async (keyword) => {
  if (USE_MOCK_DATA_FOR_READS) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockResults = mockUsers.filter(user =>
          user.username.toLowerCase().includes(keyword.toLowerCase()) ||
          user.email.toLowerCase().includes(keyword.toLowerCase()) ||
          (user.firstName + ' ' + user.lastName).toLowerCase().includes(keyword.toLowerCase())
        );

        resolve({
          data: {
            result: mockResults
          },
          status: 200
        });
      }, 300);
    });
  }

  try {
    const response = await fetch(getApiUrl(`${API_ENDPOINTS.USER.SEARCH}?q=${encodeURIComponent(keyword)}`), {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });

    return { data: await response.json(), status: response.status };
  } catch (error) {
    const mockResults = mockUsers.filter(user =>
      user.username.toLowerCase().includes(keyword.toLowerCase()) ||
      user.email.toLowerCase().includes(keyword.toLowerCase())
    );
    return {
      data: { result: mockResults },
      status: 200
    };
  }
};
