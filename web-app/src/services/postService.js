import { getToken } from "./localStorageService";

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
};

export const createPost = async (content) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newPost = {
        id: Date.now(),
        username: 'demo_user',
        avatar: null,
        created: 'Just now',
        content,
      };
      mockPosts = [newPost, ...mockPosts];
      
      resolve({ 
        data: { 
          result: newPost 
        },
        status: 201
      });
    }, 400);
  });
};
