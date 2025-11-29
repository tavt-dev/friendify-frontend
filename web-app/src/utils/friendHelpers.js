import { getUserProfileById } from "../services/userService";

/**
 * Get user full name from profile
 * Vietnamese format: LastName FirstName (like Facebook)
 */
export const getUserFullName = (profile) => {
  if (!profile) return null;
  
  const firstName = profile.firstName || '';
  const lastName = profile.lastName || '';
  
  // Vietnamese format: LastName FirstName (like Facebook)
  if (firstName || lastName) return `${lastName} ${firstName}`.trim();
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
  
  // Determine the user ID - prioritize userId field (backend standard):
  // - For friend requests: senderId (userId field in FriendshipResponse)
  // - For sent requests: recipientId (friendId field in FriendshipResponse)  
  // - For friends: friendId (the other person in the friendship)
  // - For following: followingId (the person being followed)
  // - For followers: followerId (the person who is following)
  // - For suggestions/search: userId (ProfileResponse) - this is the primary field
  const normalizedId = item.userId  // ProfileResponse uses userId as primary identifier
    || item.senderId 
    || item.recipientId 
    || item.followingId 
    || item.followerId
    || item.friendId 
    || item.id 
    || item.friend?.userId 
    || item.friend?.id
    || item.user?.userId 
    || item.user?.id 
    || 'unknown';
  
  // Determine the name:
  // Priority: friendName (already enriched) > firstName+lastName > username > name
  let normalizedName = null;
  if (item.friendName && !item.friendName.startsWith('User ')) {
    normalizedName = item.friendName;
  } else if (item.firstName || item.lastName) {
    // Vietnamese format: LastName FirstName
    normalizedName = `${item.lastName || ''} ${item.firstName || ''}`.trim();
  } else if (item.username) {
    normalizedName = item.username;
  } else if (item.name && !item.name.startsWith('User ')) {
    normalizedName = item.name;
  } else if (item.userName && !item.userName.startsWith('User ')) {
    normalizedName = item.userName;
  } else if (item.friend?.firstName || item.friend?.lastName) {
    normalizedName = `${item.friend?.lastName || ''} ${item.friend?.firstName || ''}`.trim();
  } else if (item.friend?.name) {
    normalizedName = item.friend.name;
  } else if (item.user?.firstName || item.user?.lastName) {
    normalizedName = `${item.user?.lastName || ''} ${item.user?.firstName || ''}`.trim();
  } else if (item.user?.name) {
    normalizedName = item.user.name;
  }
  
  if (!normalizedName || normalizedName.trim() === '') {
    normalizedName = normalizedId !== 'unknown' ? 'Người dùng' : 'Unknown';
  }
  
  // Determine avatar:
  const normalizedAvatar = item.friendAvatar 
    || item.userAvatar 
    || item.avatar 
    || item.friend?.avatar 
    || item.user?.avatar 
    || null;
  
  return {
    id: normalizedId,
    name: normalizedName,
    avatar: normalizedAvatar,
    mutualFriends: item.mutualFriends || 0,
    time: item.createdDate || item.time || item.createdAt || item.updatedAt || '',
    status: item.status || item.friendshipStatus || 'PENDING',
    // Keep all original fields for reference
    ...item,
  };
};

