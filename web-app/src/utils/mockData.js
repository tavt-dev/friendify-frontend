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
  {
    id: 4,
    username: 'David Lee',
    avatar: null,
    created: '2 days ago',
    content: 'Just launched my new portfolio website! Check it out and let me know what you think. Always open to feedback! 🚀',
  },
  {
    id: 5,
    username: 'Emma Wilson',
    avatar: null,
    created: '3 days ago',
    content: 'Beautiful sunset today. Sometimes we need to slow down and appreciate the little things in life. 🌅',
  },
];

export const getPosts = (page = 1, pageSize = 10) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedPosts = mockPosts.slice(start, end);
      
      resolve({
        data: paginatedPosts,
        totalPages: Math.ceil(mockPosts.length / pageSize),
        currentPage: page,
        total: mockPosts.length,
      });
    }, 300);
  });
};

export const createPost = (content) => {
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
      resolve(newPost);
    }, 400);
  });
};

export const updatePost = (id, content) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockPosts = mockPosts.map(post => 
        post.id === id ? { ...post, content } : post
      );
      const updatedPost = mockPosts.find(post => post.id === id);
      resolve(updatedPost);
    }, 300);
  });
};

export const deletePost = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockPosts = mockPosts.filter(post => post.id !== id);
      resolve({ success: true });
    }, 300);
  });
};

export const mockFriends = [
  { id: 1, name: 'Sarah Connor', status: 'online', avatar: null },
  { id: 2, name: 'John Doe', status: 'offline', avatar: null },
  { id: 3, name: 'Jane Smith', status: 'online', avatar: null },
  { id: 4, name: 'Mike Johnson', status: 'away', avatar: null },
];

export const mockGroups = [
  { id: 1, name: 'React Developers', members: 1234, cover: null },
  { id: 2, name: 'Web Design', members: 567, cover: null },
  { id: 3, name: 'Tech Enthusiasts', members: 890, cover: null },
];
