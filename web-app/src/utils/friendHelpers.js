import { getUserProfileById } from "../services/userService";

/**
 * Get user full name from profile
 */
export const getUserFullName = (profile) => {
  if (!profile) return null;
  
  const firstName = profile.firstName || '';
  const lastName = profile.lastName || '';
  
  if (firstName && lastName) return `${firstName} ${lastName}`.trim();
  if (firstName) return firstName;
  if (lastName) return lastName;
  if (profile.username) return profile.username;
  if (profile.name) return profile.name;
  
  return null;
};

/**
 * Enrich friend request with profile data
 */
export const enrichRequestWithProfile = async (request, userId, isSender = false) => {
  if (!userId) {
    const fallbackId = request.friendId || request.userId || request.id;
    return {
      ...request,
      friendId: fallbackId,
      friendName: 'Người dùng',
      friendAvatar: null,
    };
  }

  try {
    const profileResponse = await getUserProfileById(userId);
    const profile = profileResponse?.data?.result || profileResponse?.data || profileResponse;
    const fullName = getUserFullName(profile) || 'Người dùng';
    
    return {
      ...request,
      friendId: userId,
      friendName: fullName,
      friendAvatar: profile?.avatar || null,
      username: profile?.username || null,
      email: profile?.email || null,
      firstName: profile?.firstName || null,
      lastName: profile?.lastName || null,
    };
  } catch (error) {
    return {
      ...request,
      friendId: userId,
      friendName: 'Người dùng',
      friendAvatar: null,
    };
  }
};

/**
 * Extract friend IDs from friends list
 */
export const extractFriendIds = (friends) => {
  const friendIds = new Set();
  friends.forEach(f => {
    const friendId = f.friendId || f.id || f.userId;
    const userId = f.userId || f.id;
    if (friendId) friendIds.add(String(friendId).trim());
    if (userId) friendIds.add(String(userId).trim());
  });
  return Array.from(friendIds);
};

/**
 * Normalize friend data from API response
 */
export const normalizeFriendData = (item) => {
  if (!item) {
    return {
      id: 'unknown',
      name: 'Unknown',
      avatar: null,
      mutualFriends: 0,
      time: '',
      status: 'PENDING',
    };
  }
  
  const normalizedId = item.friendId || item.userId || item.id || item.friend?.id || item.user?.id || 'unknown';
  
  let normalizedName = null;
  if (item.friendName && !item.friendName.startsWith('User ')) {
    normalizedName = item.friendName;
  } else if (item.firstName || item.lastName) {
    normalizedName = `${item.firstName || ''} ${item.lastName || ''}`.trim();
  } else if (item.userName && !item.userName.startsWith('User ')) {
    normalizedName = item.userName;
  } else if (item.name && !item.name.startsWith('User ')) {
    normalizedName = item.name;
  } else if (item.username) {
    normalizedName = item.username;
  } else if (item.friend?.name) {
    normalizedName = item.friend.name;
  } else if (item.user?.name) {
    normalizedName = item.user.name;
  } else if (item.friend?.firstName || item.friend?.lastName) {
    normalizedName = `${item.friend?.firstName || ''} ${item.friend?.lastName || ''}`.trim();
  }
  
  if (!normalizedName || normalizedName.trim() === '') {
    normalizedName = normalizedId !== 'unknown' ? 'Người dùng' : 'Unknown';
  }
  
  return {
    id: normalizedId,
    name: normalizedName || 'Unknown',
    avatar: item.friendAvatar || item.userAvatar || item.avatar || item.friend?.avatar || item.user?.avatar || null,
    mutualFriends: item.mutualFriends || 0,
    time: item.createdDate || item.time || item.createdAt || item.updatedAt || '',
    status: item.status || item.friendshipStatus || 'PENDING',
    ...item,
  };
};

