import { getToken } from "./localStorageService";
import { USE_MOCK_DATA_FOR_READS, getApiUrl, API_ENDPOINTS } from '../config/apiConfig';
import { getPosts as getMockPosts } from '../utils/mockData';

let mockPosts = [
  {
    id: 1,
    username: 'Alice Johnson',
    avatar: null,
    created: '2 hours ago',
    content: 'Just finished an amazing hike in the mountains! The view from the top was absolutely breathtaking. 🏔️',
  },
  {
    id: 2,
    username: 'Bob Smith',
    avatar: null,
    created: '5 hours ago',
    content: 'Working on a new React project with Vite. The development experience is so smooth and fast!',
  },
  {
    id: 3,
    username: 'Carol Davis',
    avatar: null,
    created: '1 day ago',
    content: 'Does anyone have good recommendations for coffee shops in the downtown area? Looking for a good place to work remotely ☕',
  },
];

export const getMyPosts = async (page = 1) => {
  if (USE_MOCK_DATA_FOR_READS) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!getToken()) {
          reject({ response: { status: 401 } });
          return;
        }

        const pageSize = 10;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const paginatedPosts = mockPosts.slice(start, end);

        resolve({
          data: {
            result: {
              content: paginatedPosts,
              totalPages: Math.ceil(mockPosts.length / pageSize),
              currentPage: page,
              totalElements: mockPosts.length,
            }
          },
          status: 200
        });
      }, 300);
    });
  }

  try {
    const response = await fetch(getApiUrl(`${API_ENDPOINTS.POST.MY_POSTS}?page=${page}`), {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });

    return { data: await response.json(), status: response.status };
  } catch (error) {
    const pageSize = 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedPosts = mockPosts.slice(start, end);

    return {
      data: {
        result: {
          content: paginatedPosts,
          totalPages: Math.ceil(mockPosts.length / pageSize),
          currentPage: page,
          totalElements: mockPosts.length,
        }
      },
      status: 200
    };
  }
};

export const createPost = async (postData) => {
  const newPost = {
    id: Date.now(),
    username: 'demo_user',
    avatar: null,
    created: 'Just now',
    content: typeof postData === 'string' ? postData : postData.content,
    media: postData.media || [],
  };
  mockPosts = [newPost, ...mockPosts];

  const currentPosts = JSON.parse(localStorage.getItem('user_posts') || '[]');
  currentPosts.unshift(newPost);
  localStorage.setItem('user_posts', JSON.stringify(currentPosts));

  try {
    const response = await fetch(getApiUrl(API_ENDPOINTS.POST.CREATE), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    const data = await response.json();

    if (response.ok && data.result) {
      const updatedPosts = [data.result, ...currentPosts.slice(1)];
      localStorage.setItem('user_posts', JSON.stringify(updatedPosts));
      return { data, status: response.status };
    }

    return {
      data: { result: newPost },
      status: 201
    };
  } catch (error) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            result: newPost
          },
          status: 201
        });
      }, 400);
    });
  }
};
