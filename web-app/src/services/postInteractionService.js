import { getApiUrl } from '../config/apiConfig';
import { getToken } from './localStorageService';

const mockDelay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const likePost = async (postId) => {
  await mockDelay(300);
  
  const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '[]');
  if (!likedPosts.includes(postId)) {
    likedPosts.push(postId);
    localStorage.setItem('liked_posts', JSON.stringify(likedPosts));
  }

  try {
    const response = await fetch(getApiUrl(`/posts/${postId}/like`), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });

    return { data: await response.json(), status: response.status };
  } catch (error) {
    return {
      data: { result: { success: true, liked: true } },
      status: 200,
    };
  }
};

export const unlikePost = async (postId) => {
  await mockDelay(300);
  
  const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '[]');
  const updatedLikes = likedPosts.filter(id => id !== postId);
  localStorage.setItem('liked_posts', JSON.stringify(updatedLikes));

  try {
    const response = await fetch(getApiUrl(`/posts/${postId}/like`), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });

    return { data: await response.json(), status: response.status };
  } catch (error) {
    return {
      data: { result: { success: true, liked: false } },
      status: 200,
    };
  }
};

export const commentOnPost = async (postId, commentText) => {
  await mockDelay(400);
  
  const newComment = {
    id: Date.now(),
    postId,
    text: commentText,
    author: 'demo_user',
    created: new Date().toISOString(),
  };

  const storageKey = `post_${postId}_comments`;
  const currentComments = JSON.parse(localStorage.getItem(storageKey) || '[]');
  currentComments.unshift(newComment);
  localStorage.setItem(storageKey, JSON.stringify(currentComments));

  try {
    const response = await fetch(getApiUrl(`/posts/${postId}/comments`), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: commentText }),
    });

    return { data: await response.json(), status: response.status };
  } catch (error) {
    return {
      data: { result: newComment },
      status: 201,
    };
  }
};

export const sharePost = async (postId, shareData = {}) => {
  await mockDelay(400);
  
  const shareRecord = {
    postId,
    sharedAt: Date.now(),
    ...shareData,
  };

  const sharedPosts = JSON.parse(localStorage.getItem('shared_posts') || '[]');
  sharedPosts.unshift(shareRecord);
  localStorage.setItem('shared_posts', JSON.stringify(sharedPosts));

  try {
    const response = await fetch(getApiUrl(`/posts/${postId}/share`), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shareData),
    });

    return { data: await response.json(), status: response.status };
  } catch (error) {
    return {
      data: { result: { success: true } },
      status: 200,
    };
  }
};

export const updatePost = async (postId, postData) => {
  await mockDelay(400);
  
  const storageKey = 'user_posts';
  const currentPosts = JSON.parse(localStorage.getItem(storageKey) || '[]');
  const updatedPosts = currentPosts.map(post => 
    post.id === postId ? { ...post, ...postData, updated: new Date().toISOString() } : post
  );
  localStorage.setItem(storageKey, JSON.stringify(updatedPosts));

  try {
    const response = await fetch(getApiUrl(`/posts/${postId}`), {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    return { data: await response.json(), status: response.status };
  } catch (error) {
    const updatedPost = updatedPosts.find(p => p.id === postId);
    return {
      data: { result: updatedPost },
      status: 200,
    };
  }
};

export const deletePost = async (postId) => {
  await mockDelay(400);
  
  const storageKey = 'user_posts';
  const currentPosts = JSON.parse(localStorage.getItem(storageKey) || '[]');
  const updatedPosts = currentPosts.filter(post => post.id !== postId);
  localStorage.setItem(storageKey, JSON.stringify(updatedPosts));
  
  localStorage.setItem(`post_${postId}_deleted`, Date.now().toString());

  try {
    const response = await fetch(getApiUrl(`/posts/${postId}`), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });

    return { data: await response.json(), status: response.status };
  } catch (error) {
    return {
      data: { result: { success: true } },
      status: 200,
    };
  }
};

export const getPostComments = async (postId) => {
  await mockDelay(300);
  
  const storageKey = `post_${postId}_comments`;
  const comments = JSON.parse(localStorage.getItem(storageKey) || '[]');

  try {
    const response = await fetch(getApiUrl(`/posts/${postId}/comments`), {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });

    return { data: await response.json(), status: response.status };
  } catch (error) {
    return {
      data: { result: comments },
      status: 200,
    };
  }
};
