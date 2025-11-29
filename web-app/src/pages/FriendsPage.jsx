// src/pages/Friends.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  Typography,
  Avatar,
  Button,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Grid,
  Chip,
  IconButton,
  Divider,
  Stack,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import { alpha } from "@mui/material/styles";
import PageLayout from "./PageLayout";
import {
  getFriendRequests,
  getAllFriends,
  acceptFriendRequest,
  declineFriendRequest,
  addFriend,
  removeFriend,
  searchFriends,
  getSentFriendRequests,
  followUser,
  unfollowUser,
  getFollowingList,
  getFollowerList,
  getSocialInfo,
  blockUser,
  unblockUser,
  getBlockedList,
} from "../services/friendService";
import { extractArrayFromResponse } from "../utils/apiHelper";
import { 
  enrichRequestWithProfile, 
  extractFriendIds, 
  normalizeFriendData 
} from "../utils/friendHelpers";
import { useUser } from "../contexts/UserContext";
import { getUserProfileById } from "../services/userService";

export default function FriendsPage() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [friendRequests, setFriendRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [allFriends, setAllFriends] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [friendsList, setFriendsList] = useState([]);
  const [sentRequestsList, setSentRequestsList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [followersList, setFollowersList] = useState([]);
  const [blockedList, setBlockedList] = useState([]);
  const { user: currentUser } = useUser();

  // Get current user ID - prioritize userId field as per backend structure
  const getCurrentUserId = () => {
    if (!currentUser) {
      console.log('getCurrentUserId - No currentUser object');
      return null;
    }
    // Backend uses userId field, not id
    const userId = currentUser.userId || currentUser.id || null;
    console.log('getCurrentUserId - currentUser:', currentUser);
    console.log('getCurrentUserId - extracted userId:', userId);
    return userId;
  };

  useEffect(() => {
    if (getCurrentUserId()) {
      loadFriendshipData();
    }
  }, [currentUser]);

  useEffect(() => {
    if (getCurrentUserId()) {
      loadData();
    }
  }, [tabValue, currentUser]);

  // Load friends and sent requests for status checking
  const loadFriendshipData = async () => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      console.warn('LoadFriendshipData - No current user ID, skipping');
      return;
    }
    
    console.log('LoadFriendshipData - Current user ID:', currentUserId);
    
    try {
      // Load all friends
      try {
        const friendsResponse = await getAllFriends(1, 100);
        const { items: friends } = extractArrayFromResponse(friendsResponse.data);
        setAllFriends(friends || []);
        setFriendsList(extractFriendIds(friends || []));
      } catch (error) {
        console.warn('LoadFriendshipData - Error loading friends:', error);
        // Silently handle 404
      }

      // Load sent requests
      try {
        const sentResponse = await getSentFriendRequests(1, 100);
        const { items: sentRequestsData } = extractArrayFromResponse(sentResponse.data);
        const sentIds = (sentRequestsData || [])
          .map(r => r.friendId || r.id || r.userId)
          .filter(Boolean)
          .map(id => String(id).trim());
        setSentRequestsList(sentIds);
      } catch (error) {
        console.warn('LoadFriendshipData - Error loading sent requests:', error);
        setSentRequestsList([]);
      }
    } catch (error) {
      console.error('LoadFriendshipData - Unexpected error:', error);
      // Error handled silently
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (tabValue === 0) {
        await loadFriendRequests();
      } else if (tabValue === 1) {
        await loadAllFriends();
      } else if (tabValue === 2) {
        await loadSentRequests();
      } else if (tabValue === 3) {
        if (friendsList.length === 0 && sentRequestsList.length === 0) {
          await loadFriendshipData();
        }
      } else if (tabValue === 4) {
        await loadFollowing();
      } else if (tabValue === 5) {
        await loadFollowers();
      }
    } catch (error) {
      if (error.response?.status !== 404 && error.response?.status !== 401) {
        setSnackbar({ 
          open: true, 
          message: "Không thể tải dữ liệu. Vui lòng thử lại.", 
          severity: "error" 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const loadFriendRequests = async () => {
    try {
      const response = await getFriendRequests(1, 20);
      let { items: requests } = extractArrayFromResponse(response.data);
      
      if (!Array.isArray(requests)) {
        requests = [];
      }

      if (requests.length > 0) {
        // For received friend requests: 
        // - userId = sender (the one who sent the request)
        // - friendId = currentUserId (the receiver)
        const enrichedRequests = await Promise.all(
          requests.map(async (request) => {
            try {
              const senderId = request.userId; // This is the sender
              
              if (!senderId) return null;
              
              // Get sender's profile
              const profileResponse = await getUserProfileById(senderId);
              const profile = profileResponse?.data?.result || profileResponse?.data || profileResponse;
              
              const firstName = profile?.firstName || '';
              const lastName = profile?.lastName || '';
              const fullName = firstName || lastName 
                ? `${lastName} ${firstName}`.trim() 
                : profile?.username || 'Người dùng';
              
              return {
                ...request,
                id: senderId,
                senderId: senderId,
                friendId: senderId, // For display purposes
                friendName: fullName,
                friendAvatar: profile?.avatar || null,
                firstName: profile?.firstName || null,
                lastName: profile?.lastName || null,
                username: profile?.username || null,
                avatar: profile?.avatar || null,
                createdAt: request.createdAt || request.createdDate,
              };
            } catch (error) {
              const senderId = request.userId;
              return senderId ? {
                ...request,
                friendId: senderId,
                senderId: senderId,
                id: senderId,
                friendName: 'Người dùng',
                friendAvatar: null,
              } : null;
            }
          })
        );

        const validRequests = enrichedRequests.filter(req => req !== null && req.senderId);
        setFriendRequests(validRequests);
      } else {
        setFriendRequests([]);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setFriendRequests([]);
      } else if (error.response?.status === 401) {
        setFriendRequests([]);
        setSnackbar({ open: true, message: "Vui lòng đăng nhập lại.", severity: "warning" });
      } else {
        setFriendRequests([]);
        if (error.response?.status >= 500) {
          setSnackbar({ open: true, message: "Lỗi server. Vui lòng thử lại sau.", severity: "error" });
        }
      }
    }
  };


  const loadAllFriends = async () => {
    try {
      const response = await getAllFriends(1, 100);
      console.log('LoadAllFriends - Full API response:', response);
      
      // Extract data from response - backend returns ApiResponse<PageResponse<FriendshipResponse>>
      // Structure: response.data.result.data or response.data.result
      let friends = [];
      
      if (response?.data?.result?.data && Array.isArray(response.data.result.data)) {
        friends = response.data.result.data;
      } else if (response?.data?.result && Array.isArray(response.data.result)) {
        friends = response.data.result;
      } else {
        const extracted = extractArrayFromResponse(response.data);
        friends = extracted.items || [];
      }
      
      console.log('LoadAllFriends - Extracted friendships:', friends);
      console.log('LoadAllFriends - Friends count:', friends.length);
      
      if (friends && friends.length > 0) {
        // Get current user ID - ensure we get the correct ID
        const currentUserId = getCurrentUserId();
        console.log('LoadAllFriends - Current user object:', currentUser);
        console.log('LoadAllFriends - Current user ID:', currentUserId);
        
        if (!currentUserId) {
          console.error('LoadAllFriends - No current user ID found!');
          setSnackbar({
            open: true,
            message: "Không thể xác định người dùng. Vui lòng đăng nhập lại.",
            severity: "error"
          });
          setAllFriends([]);
          setFriendsList([]);
          return;
        }
        
        // Process each friendship to determine the friend (the one who is NOT current user)
        const enrichedFriends = await Promise.all(
          friends.map(async (friendship) => {
            try {
              console.log('LoadAllFriends - Processing friendship:', friendship);
              
              // Determine which user is the friend
              // In FriendshipResponse: userId and friendId are both USER IDs (not profile IDs)
              // One of them is current user, the other is the friend
              let friendUserId = null;
              
              if (currentUserId) {
                // Compare as strings to ensure correct matching
                const friendshipUserId = String(friendship.userId || '').trim();
                const friendshipFriendId = String(friendship.friendId || '').trim();
                const currentUserIdStr = String(currentUserId).trim();
                
                console.log('LoadAllFriends - Comparing:', {
                  friendshipUserId,
                  friendshipFriendId,
                  currentUserIdStr
                });
                
                if (friendshipUserId === currentUserIdStr) {
                  // Current user is userId, so friend is friendId (userId)
                  friendUserId = friendshipFriendId;
                } else if (friendshipFriendId === currentUserIdStr) {
                  // Current user is friendId, so friend is userId
                  friendUserId = friendshipUserId;
                } else {
                  // Should not happen if backend is correct, but use friendId as fallback
                  console.warn('LoadAllFriends - Current user ID not found in friendship, using friendId');
                  friendUserId = friendshipFriendId || friendshipUserId;
                }
              } else {
                // If we don't have current user ID, use friendId as fallback
                friendUserId = friendship.friendId || friendship.userId;
                console.warn('LoadAllFriends - No current user ID, using friendId as fallback');
              }
              
              if (!friendUserId || friendUserId === '') {
                console.warn('LoadAllFriends - No valid friendUserId found in friendship:', friendship);
                return null;
              }
              
              console.log('LoadAllFriends - Determined friendUserId (to get profile):', friendUserId);
              
              // Get friend's profile information using userId (not profileId)
              // API endpoint accepts userId and returns profile
              const profileResponse = await getUserProfileById(friendUserId);
              const profile = profileResponse?.data?.result || profileResponse?.data || profileResponse;
              
              if (!profile) {
                console.warn('LoadAllFriends - Profile not found for friendUserId:', friendUserId);
                // Still return basic info so user can see the friend exists
                return {
                  ...friendship,
                  id: friendUserId, // Use userId
                  userId: friendUserId, // This is the userId (not profileId)
                  friendId: friendUserId,
                  friendName: 'Người dùng',
                  firstName: null,
                  lastName: null,
                  username: null,
                  friendAvatar: null,
                  avatar: null,
                  createdAt: friendship.createdAt || friendship.createdDate,
                };
              }
              
              console.log('LoadAllFriends - Profile found:', profile);
              
              // ProfileResponse has both id (profileId) and userId (userId)
              // We need userId for navigation and display
              const profileUserId = profile.userId || friendUserId; // Use userId from profile, fallback to friendUserId
              
              // Format name: LastName FirstName (Vietnamese format)
              const firstName = profile.firstName || '';
              const lastName = profile.lastName || '';
              const fullName = firstName || lastName 
                ? `${lastName} ${firstName}`.trim() 
                : profile.username || 'Người dùng';
              
              return {
                ...friendship,
                id: profileUserId, // Use userId for navigation/identification
                userId: profileUserId, // Store userId (this is what we use for user operations)
                friendId: profileUserId, // Also store as friendId for compatibility
                friendName: fullName,
                friendAvatar: profile.avatar || null,
                firstName: profile.firstName || null,
                lastName: profile.lastName || null,
                username: profile.username || null,
                avatar: profile.avatar || null,
                createdAt: friendship.createdAt || friendship.createdDate,
              };
            } catch (error) {
              console.error('LoadAllFriends - Error processing friendship:', error);
              console.error('LoadAllFriends - Friendship data:', friendship);
              
              // Even if profile fetch fails, return basic info
              // These are userIds (not profileIds) from FriendshipResponse
              let friendUserId = null;
              const currentUserIdForError = getCurrentUserId();
              if (currentUserIdForError) {
                const friendshipUserId = String(friendship.userId || '').trim();
                const friendshipFriendId = String(friendship.friendId || '').trim();
                const currentUserIdStr = String(currentUserIdForError).trim();
                
                if (friendshipUserId === currentUserIdStr) {
                  friendUserId = friendshipFriendId; // friend is friendId (userId)
                } else if (friendshipFriendId === currentUserIdStr) {
                  friendUserId = friendshipUserId; // friend is userId
                } else {
                  friendUserId = friendshipFriendId || friendshipUserId;
                }
              } else {
                friendUserId = friendship.friendId || friendship.userId;
              }
              
              return friendUserId ? {
                ...friendship,
                id: friendUserId, // userId
                userId: friendUserId, // This is userId (not profileId)
                friendId: friendUserId,
                friendName: 'Người dùng',
                friendAvatar: null,
                avatar: null,
              } : null;
            }
          })
        );
        
        const validFriends = enrichedFriends.filter(f => f !== null);
        console.log('LoadAllFriends - Valid enriched friends:', validFriends);
        console.log('LoadAllFriends - Valid friends count:', validFriends.length);
        
        setAllFriends(validFriends);
        // Use userId for friend list
        setFriendsList(validFriends.map(f => String(f.userId || f.friendId || f.id).trim()));
      } else {
        console.log('LoadAllFriends - No friends found in response');
        setAllFriends([]);
        setFriendsList([]);
      }
    } catch (error) {
      console.error('LoadAllFriends - Error:', error);
      console.error('LoadAllFriends - Error response:', error.response);
      
      if (error.response?.status === 404) {
        setAllFriends([]);
        setFriendsList([]);
      } else {
        const errorMsg = error.response?.data?.message || error.message || "Không thể tải danh sách bạn bè";
        setSnackbar({ 
          open: true, 
          message: errorMsg, 
          severity: "error" 
        });
        setAllFriends([]);
        setFriendsList([]);
      }
    }
  };

  const loadSentRequests = async () => {
    try {
      const response = await getSentFriendRequests(1, 20);
      const { items: requests } = extractArrayFromResponse(response.data);
      
      if (requests.length > 0) {
        // For sent friend requests:
        // - userId = currentUserId (the sender)
        // - friendId = recipient (the one who receives the request)
        const enrichedRequests = await Promise.all(
          requests.map(async (request) => {
            try {
              const recipientId = request.friendId; // This is the recipient
              
              if (!recipientId) return null;
              
              // Get recipient's profile
              const profileResponse = await getUserProfileById(recipientId);
              const profile = profileResponse?.data?.result || profileResponse?.data || profileResponse;
              
              const firstName = profile?.firstName || '';
              const lastName = profile?.lastName || '';
              const fullName = firstName || lastName 
                ? `${lastName} ${firstName}`.trim() 
                : profile?.username || 'Người dùng';
              
              return {
                ...request,
                id: recipientId,
                recipientId: recipientId,
                friendId: recipientId,
                friendName: fullName,
                friendAvatar: profile?.avatar || null,
                firstName: profile?.firstName || null,
                lastName: profile?.lastName || null,
                username: profile?.username || null,
                avatar: profile?.avatar || null,
                createdAt: request.createdAt || request.createdDate,
              };
            } catch (error) {
              const recipientId = request.friendId;
              return recipientId ? {
                ...request,
                friendId: recipientId,
                recipientId: recipientId,
                id: recipientId,
                friendName: 'Người dùng',
                friendAvatar: null,
              } : null;
            }
          })
        );

        const validRequests = enrichedRequests.filter(req => req !== null && req.recipientId);
        setSentRequests(validRequests);
      } else {
        setSentRequests([]);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setSentRequests([]);
      } else if (error.response?.status === 401) {
        setSentRequests([]);
        setSnackbar({ open: true, message: "Vui lòng đăng nhập lại.", severity: "warning" });
      } else {
        setSentRequests([]);
        if (error.response?.status >= 500) {
          setSnackbar({ open: true, message: "Lỗi server. Vui lòng thử lại sau.", severity: "error" });
        }
      }
    }
  };

  // Get friendship status for a user
  const getFriendshipStatus = (userId) => {
    if (!userId) return 'NONE';
    
    const normalizedUserId = String(userId).trim();
    const isFriend = friendsList.some(id => String(id).trim() === normalizedUserId);
    if (isFriend) return 'ACCEPTED';
    
    const hasSentRequest = sentRequestsList.some(id => String(id).trim() === normalizedUserId);
    if (hasSentRequest) return 'PENDING';
    
    return 'NONE';
  };

  // Handle search with debounce
  const handleSearch = async (keyword) => {
    if (!keyword || keyword.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await searchFriends(keyword.trim());
      const { items: results } = extractArrayFromResponse(response.data);
      
      const resultsWithStatus = results.map(user => {
        const userId = user.userId || user.id;
        return {
          ...user,
          friendshipStatus: getFriendshipStatus(userId),
        };
      });
      setSearchResults(resultsWithStatus);
    } catch (error) {
      setSnackbar({ open: true, message: "Không thể tìm kiếm. Vui lòng thử lại.", severity: "error" });
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (tabValue === 3) {
      const timeoutId = setTimeout(() => {
        handleSearch(searchQuery);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, tabValue]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleAcceptRequest = async (senderId) => {
    try {
      // senderId is the userId of the person who sent the request
      await acceptFriendRequest(senderId);
      
      setFriendRequests((prev) => prev.filter((req) => {
        const requestSenderId = req.senderId || req.userId || req.id;
        return String(requestSenderId).trim() !== String(senderId).trim();
      }));
      
      setSnackbar({ open: true, message: "Đã chấp nhận lời mời kết bạn!", severity: "success" });
      
      await loadFriendshipData();
      
      if (tabValue === 0 || tabValue === 2) {
        loadData();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Không thể chấp nhận lời mời. Vui lòng thử lại.";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    }
  };

  const handleDeclineRequest = async (senderId) => {
    try {
      // senderId is the userId of the person who sent the request
      await declineFriendRequest(senderId);
      
      setFriendRequests((prev) => prev.filter((req) => {
        const requestSenderId = req.senderId || req.userId || req.id;
        return String(requestSenderId).trim() !== String(senderId).trim();
      }));
      
      setSnackbar({ open: true, message: "Đã từ chối lời mời kết bạn!", severity: "info" });
      
      await loadFriendshipData();
      
      if (tabValue === 0) {
        loadData();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Không thể từ chối lời mời. Vui lòng thử lại.";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    }
  };

  const handleAddFriend = async (userId) => {
    try {
      await addFriend(userId);
      
      const normalizedUserId = String(userId).trim();
      
      // Reload sent requests
      try {
        const sentResponse = await getSentFriendRequests(1, 100);
        const { items: sentRequestsData } = extractArrayFromResponse(sentResponse.data);
        const sentIds = sentRequestsData
          .map(r => r.friendId || r.id || r.userId)
          .filter(Boolean)
          .map(id => String(id).trim());
        setSentRequestsList(sentIds);
      } catch (error) {
        setSentRequestsList((prev) => {
          const prevNormalized = prev.map(id => String(id).trim());
          if (!prevNormalized.includes(normalizedUserId)) {
            return [...prev, normalizedUserId];
          }
          return prev;
        });
      }
      
      setSearchResults((prev) => prev.map((user) => {
        const id = String(user.id || user.userId).trim();
        if (id === normalizedUserId) {
          return { 
            ...user, 
            friendshipStatus: 'PENDING', 
            status: 'PENDING',
            requestSent: true
          };
        }
        return user;
      }));
      
      if (tabValue === 0 || tabValue === 2) {
        loadData();
      }
      
      setSnackbar({ open: true, message: "Đã gửi lời mời kết bạn!", severity: "success" });
    } catch (error) {
      setSnackbar({ open: true, message: "Không thể gửi lời mời. Vui lòng thử lại.", severity: "error" });
    }
  };


  const handleUnfriend = async (friendId) => {
    try {
      await removeFriend(friendId);
      setAllFriends((prev) => prev.filter((friend) => {
        const id = friend.friendId || friend.id || friend.userId;
        return id !== friendId;
      }));
      setFriendsList((prev) => prev.filter(id => String(id).trim() !== String(friendId).trim()));
      setSnackbar({ open: true, message: "Đã hủy kết bạn!", severity: "warning" });
      await loadFriendshipData();
    } catch (error) {
      setSnackbar({ open: true, message: "Không thể hủy kết bạn. Vui lòng thử lại.", severity: "error" });
    }
  };

  const loadFollowing = async () => {
    try {
      const currentUserId = getCurrentUserId();
      if (!currentUserId) {
        console.warn('LoadFollowing - No current user ID');
        setFollowingList([]);
        return;
      }
      const response = await getFollowingList(currentUserId, 1, 100);
      const { items: followingData } = extractArrayFromResponse(response.data);
      
      // FollowResponse has followingId which is the user being followed
      // We need to enrich with profile data
      const enrichedFollowing = await Promise.all(
        followingData.map(async (follow) => {
          const followingId = follow.followingId;
          if (!followingId) return null;
          
          try {
            const profileResponse = await getUserProfileById(followingId);
            const profile = profileResponse?.data?.result || profileResponse?.data || profileResponse;
            return {
              ...follow,
              id: followingId,
              userId: followingId,
              ...profile,
            };
          } catch (error) {
            return {
              ...follow,
              id: followingId,
              userId: followingId,
              firstName: '',
              lastName: '',
              username: 'Người dùng',
            };
          }
        })
      );
      
      setFollowingList(enrichedFollowing.filter(u => u !== null));
    } catch (error) {
      if (error.response?.status !== 404 && error.response?.status !== 401) {
        console.error('Error loading following:', error);
      }
      setFollowingList([]);
    }
  };

  const loadFollowers = async () => {
    try {
      const currentUserId = getCurrentUserId();
      if (!currentUserId) {
        console.warn('LoadFollowers - No current user ID');
        setFollowersList([]);
        return;
      }
      const response = await getFollowerList(currentUserId, 1, 100);
      const { items: followersData } = extractArrayFromResponse(response.data);
      
      // FollowResponse has followerId which is the user who is following
      // We need to enrich with profile data
      const enrichedFollowers = await Promise.all(
        followersData.map(async (follow) => {
          const followerId = follow.followerId;
          if (!followerId) return null;
          
          try {
            const profileResponse = await getUserProfileById(followerId);
            const profile = profileResponse?.data?.result || profileResponse?.data || profileResponse;
            return {
              ...follow,
              id: followerId,
              userId: followerId,
              ...profile,
            };
          } catch (error) {
            return {
              ...follow,
              id: followerId,
              userId: followerId,
              firstName: '',
              lastName: '',
              username: 'Người dùng',
            };
          }
        })
      );
      
      setFollowersList(enrichedFollowers.filter(u => u !== null));
    } catch (error) {
      if (error.response?.status !== 404 && error.response?.status !== 401) {
        console.error('Error loading followers:', error);
      }
      setFollowersList([]);
    }
  };

  const handleFollow = async (userId) => {
    try {
      await followUser(userId);
      setSnackbar({ open: true, message: "Đã theo dõi!", severity: "success" });
      await loadFollowers();
      if (tabValue === 4) {
        await loadFollowing();
      }
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || "Không thể theo dõi", severity: "error" });
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await unfollowUser(userId);
      setFollowingList((prev) => prev.filter((user) => {
        const id = user.id || user.userId || user.followingId;
        return String(id).trim() !== String(userId).trim();
      }));
      setSnackbar({ open: true, message: "Đã hủy theo dõi!", severity: "info" });
      await loadFollowing();
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || "Không thể hủy theo dõi", severity: "error" });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const filteredFriends = allFriends
    .map(normalizeFriendData)
    .filter((friend) => {
      const searchLower = searchQuery.toLowerCase();
      return friend.name.toLowerCase().includes(searchLower);
    });

  return (
    <PageLayout>
      <Box sx={{ display: "flex", justifyContent: "center", width: "100%", mt: 4, pl: 0, pr: 2 }}>
        <Box sx={{ width: "100%", maxWidth: 1200 }}>
          {/* Header */}
          <Card
            elevation={0}
            sx={(t) => ({
              borderRadius: 4,
              p: 3,
              mb: 3,
              ml: 2.5,
              boxShadow: t.shadows[1],
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            })}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Typography
                sx={{
                  fontSize: 26,
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Bạn bè
              </Typography>
              <Chip
                icon={<PeopleIcon />}
                label={`${allFriends.length} bạn bè`}
                sx={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  fontWeight: 600,
                }}
              />
            </Box>

            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontSize: 15,
                  fontWeight: 600,
                  minHeight: 48,
                },
                "& .Mui-selected": {
                  color: "primary.main",
                },
              }}
            >
              <Tab label={`Lời mời (${friendRequests.length})`} />
              <Tab label="Tất cả bạn bè" />
              <Tab label={`Đã gửi (${sentRequests.length})`} />
              <Tab label="Tìm kiếm" />
              <Tab label={`Đang theo dõi (${followingList.length})`} />
              <Tab label={`Người theo dõi (${followersList.length})`} />
            </Tabs>
          </Card>

          {/* Tab 0: Friend Requests */}
          {tabValue === 0 && (
            <Box>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : friendRequests.length === 0 ? (
                <Card
                  elevation={0}
                  sx={(t) => ({
                    borderRadius: 4,
                    p: 6,
                    ml: 2.5,
                    textAlign: "center",
                    boxShadow: t.shadows[1],
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  })}
                >
                  <PersonIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Không có lời mời kết bạn nào
                  </Typography>
                </Card>
              ) : (
                <Grid container spacing={2.5}>
                  {friendRequests.map((request, index) => {
                    const normalized = normalizeFriendData(request);
                    const uniqueKey = normalized.id || request.id || `friend-request-${index}`;
                    // Use senderId for friend requests (the person who sent the request)
                    const profileId = request.senderId || normalized.id;
                    return (
                    <Grid item xs={12} sm={6} md={4} key={uniqueKey}>
                      <Card
                        elevation={0}
                        onClick={(e) => {
                          if (e.target.closest('button')) {
                            return;
                          }
                          navigate(`/profile/${profileId}`);
                        }}
                        sx={(t) => ({
                          borderRadius: 4,
                          p: 2.5,
                          boxShadow: t.shadows[1],
                          border: "1px solid",
                          borderColor: "divider",
                          bgcolor: "background.paper",
                          transition: "all 0.3s ease",
                          cursor: "pointer",
                          "&:hover": {
                            boxShadow: t.shadows[4],
                            transform: "translateY(-4px)",
                            borderColor: t.palette.primary.main,
                          },
                        })}
                      >
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <Avatar
                            src={normalized.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(normalized.name || 'User')}&background=667eea&color=fff&size=128`}
                            sx={{
                              width: 96,
                              height: 96,
                              mb: 2,
                              border: "3px solid",
                              borderColor: "divider",
                              bgcolor: normalized.avatar ? 'transparent' : 'primary.main',
                            }}
                          >
                            {(normalized.name && normalized.name.length > 0) ? normalized.name.charAt(0).toUpperCase() : 'U'}
                          </Avatar>
                          <Typography variant="h6" fontWeight={700} mb={0.5} textAlign="center">
                            {normalized.name}
                          </Typography>
                          {normalized.mutualFriends > 0 && (
                            <Typography variant="body2" color="text.secondary" mb={1}>
                              {normalized.mutualFriends} bạn chung
                            </Typography>
                          )}
                          {normalized.time && (
                            <Typography variant="caption" color="text.disabled" mb={2}>
                              {normalized.time}
                            </Typography>
                          )}

                          <Stack direction="row" spacing={1} width="100%">
                            <Button
                              fullWidth
                              variant="contained"
                              startIcon={<CheckIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                const senderId = request.senderId || normalized.id;
                                handleAcceptRequest(senderId);
                              }}
                              sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                borderRadius: 2.5,
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                "&:hover": {
                                  background: "linear-gradient(135deg, #5568d3 0%, #63428a 100%)",
                                },
                              }}
                            >
                              Xác nhận
                            </Button>
                            <Button
                              fullWidth
                              variant="outlined"
                              onClick={(e) => {
                                e.stopPropagation();
                                const senderId = request.senderId || normalized.id;
                                handleDeclineRequest(senderId);
                              }}
                              sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                borderRadius: 2.5,
                                borderColor: "divider",
                                color: "text.secondary",
                                "&:hover": {
                                  borderColor: "error.main",
                                  color: "error.main",
                                  bgcolor: "rgba(211, 47, 47, 0.04)",
                                },
                              }}
                            >
                              Xóa
                            </Button>
                          </Stack>
                        </Box>
                      </Card>
                    </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>
          )}

          {/* Tab 1: All Friends */}
          {tabValue === 1 && (
            <Box>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
              <>
              <Card
                elevation={0}
                sx={(t) => ({
                  borderRadius: 4,
                  p: 2.5,
                  mb: 3,
                  ml: 2.5,
                  boxShadow: t.shadows[1],
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                })}
              >
                <TextField
                  fullWidth
                  placeholder="Tìm kiếm bạn bè..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      bgcolor: (t) =>
                        t.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "background.default",
                      "& fieldset": { borderColor: "divider" },
                      "&:hover fieldset": { borderColor: "primary.main" },
                      "&.Mui-focused fieldset": { borderColor: "primary.main", borderWidth: 2 },
                    },
                  }}
                />
              </Card>

              <Grid container spacing={2.5}>
                {filteredFriends.map((friend) => {
                  const normalized = normalizeFriendData(friend);
                  return (
                  <Grid item xs={12} sm={6} md={4} key={normalized.id}>
                    <Card
                      elevation={0}
                      onClick={(e) => {
                        if (e.target.closest('button')) {
                          return;
                        }
                        navigate(`/profile/${normalized.id}`);
                      }}
                      sx={(t) => ({
                        borderRadius: 4,
                        p: 2.5,
                        boxShadow: t.shadows[1],
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.paper",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                        "&:hover": {
                          boxShadow: t.shadows[4],
                          transform: "translateY(-4px)",
                          borderColor: t.palette.primary.main,
                        },
                      })}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <Avatar
                          src={normalized.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(normalized.name || 'User')}&background=667eea&color=fff&size=128`}
                          sx={{
                            width: 64,
                            height: 64,
                            mr: 2,
                            border: "2px solid",
                            borderColor: "divider",
                            bgcolor: normalized.avatar ? 'transparent' : 'primary.main',
                          }}
                        >
                          {(normalized.name && normalized.name.length > 0) ? normalized.name.charAt(0).toUpperCase() : 'U'}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight={700} mb={0.5}>
                            {normalized.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" mb={0.3}>
                            {normalized.mutualFriends} bạn chung
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            {friend.since || normalized.time}
                          </Typography>
                        </Box>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Stack direction="row" spacing={1}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/chat`);
                          }}
                          sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            borderRadius: 2.5,
                            borderColor: "divider",
                            color: "text.secondary",
                            "&:hover": {
                              borderColor: "primary.main",
                              color: "primary.main",
                              bgcolor: "rgba(102, 126, 234, 0.04)",
                            },
                          }}
                        >
                          Nhắn tin
                        </Button>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnfriend(normalized.id);
                          }}
                          sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            borderRadius: 2.5,
                            borderColor: "divider",
                            color: "text.secondary",
                            "&:hover": {
                              borderColor: "error.main",
                              color: "error.main",
                              bgcolor: "rgba(211, 47, 47, 0.04)",
                            },
                          }}
                        >
                          Hủy kết bạn
                        </Button>
                      </Stack>
                    </Card>
                  </Grid>
                  );
                })}
              </Grid>
              </>
              )}

              {filteredFriends.length === 0 && !loading && (
                <Card
                  elevation={0}
                  sx={(t) => ({
                    borderRadius: 4,
                    p: 6,
                    ml: 2.5,
                    mt: 1,
                    textAlign: "center",
                    boxShadow: t.shadows[1],
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  })}
                >
                  <PeopleIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    {searchQuery.trim() ? "Không tìm thấy bạn bè nào" : "Chưa có bạn bè nào"}
                  </Typography>
                  {!searchQuery.trim() && (
                    <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                      Hãy kết bạn với mọi người để xem họ ở đây
                    </Typography>
                  )}
                </Card>
              )}
            </Box>
          )}

          {/* Tab 2: Sent Requests */}
          {tabValue === 2 && (
            <Box>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : sentRequests.length === 0 ? (
                <Card
                  elevation={0}
                  sx={(t) => ({
                    borderRadius: 4,
                    p: 6,
                    textAlign: "center",
                    boxShadow: t.shadows[1],
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  })}
                >
                  <PersonIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Chưa gửi lời mời kết bạn nào
                  </Typography>
                </Card>
              ) : (
                <Grid container spacing={2.5}>
                  {sentRequests.map((request, index) => {
                    const normalized = normalizeFriendData(request);
                    const uniqueKey = normalized.id || request.id || `sent-request-${index}`;
                    return (
                    <Grid item xs={12} sm={6} md={4} key={uniqueKey}>
                      <Card
                        elevation={0}
                        sx={(t) => ({
                          borderRadius: 4,
                          p: 2.5,
                          ml: 2.5,
                          boxShadow: t.shadows[1],
                          border: "1px solid",
                          borderColor: "divider",
                          bgcolor: "background.paper",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            boxShadow: t.shadows[4],
                            transform: "translateY(-4px)",
                          },
                        })}
                      >
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <Avatar
                            src={normalized.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(normalized.name || 'User')}&background=667eea&color=fff&size=128`}
                            sx={{
                              width: 96,
                              height: 96,
                              mb: 2,
                              border: "3px solid",
                              borderColor: "divider",
                              bgcolor: normalized.avatar ? 'transparent' : 'primary.main',
                            }}
                          >
                            {(normalized.name && normalized.name.length > 0) ? normalized.name.charAt(0).toUpperCase() : 'U'}
                          </Avatar>
                          <Typography variant="h6" fontWeight={700} mb={0.5} textAlign="center">
                            {normalized.name}
                          </Typography>
                          {normalized.mutualFriends > 0 && (
                            <Typography variant="body2" color="text.secondary" mb={1}>
                              {normalized.mutualFriends} bạn chung
                            </Typography>
                          )}
                          {normalized.time && (
                            <Typography variant="caption" color="text.disabled" mb={2}>
                              Đã gửi: {normalized.time}
                            </Typography>
                          )}

                          <Chip
                            label="Đang chờ phản hồi"
                            color="warning"
                            size="small"
                            sx={{ mb: 2 }}
                          />
                        </Box>
                      </Card>
                    </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>
          )}

          {/* Tab 3: Search Friends */}
          {tabValue === 3 && (
            <Box>
              <Card
                elevation={0}
                sx={(t) => ({
                  borderRadius: 4,
                  p: 2.5,
                  mb: 3,
                  ml: 2.5,
                  boxShadow: t.shadows[1],
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                })}
              >
                <TextField
                  fullWidth
                  placeholder="Tìm kiếm bạn bè để kết bạn..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      bgcolor: (t) =>
                        t.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "background.default",
                      "& fieldset": { borderColor: "divider" },
                      "&:hover fieldset": { borderColor: "primary.main" },
                      "&.Mui-focused fieldset": { borderColor: "primary.main", borderWidth: 2 },
                    },
                  }}
                />
              </Card>

              {searchLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : searchQuery.trim().length === 0 ? (
                <Card
                  elevation={0}
                  sx={(t) => ({
                    borderRadius: 4,
                    p: 6,
                    ml: 2.5,
                    textAlign: "center",
                    boxShadow: t.shadows[1],
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  })}
                >
                  <SearchIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Tìm kiếm bạn bè
                  </Typography>
                  <Typography variant="body2" color="text.disabled">
                    Nhập tên hoặc email để tìm kiếm bạn bè
                  </Typography>
                </Card>
              ) : searchResults.length === 0 ? (
                <Card
                  elevation={0}
                  sx={(t) => ({
                    borderRadius: 4,
                    p: 6,
                    ml: 2.5,
                    textAlign: "center",
                    boxShadow: t.shadows[1],
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  })}
                >
                  <PersonIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Không tìm thấy kết quả
                  </Typography>
                  <Typography variant="body2" color="text.disabled">
                    Thử tìm kiếm với từ khóa khác
                  </Typography>
                </Card>
              ) : (
                <Grid container spacing={2.5}>
                  {searchResults.map((user) => {
                    const userId = user.userId || user.id;
                    const userName = user.firstName && user.lastName 
                      ? `${user.lastName} ${user.firstName}`.trim() 
                      : user.username || user.name || 'Unknown';
                    const userAvatar = user.avatar || null;
                    const friendshipStatus = user.friendshipStatus || user.status || 'NONE';
                    
                    return (
                      <Grid item xs={12} sm={6} md={4} key={userId}>
                        <Card
                          elevation={0}
                          sx={(t) => ({
                            borderRadius: 4,
                            p: 2.5,
                            boxShadow: t.shadows[1],
                            border: "1px solid",
                            borderColor: "divider",
                            bgcolor: "background.paper",
                            transition: "all 0.3s ease",
                            cursor: "pointer",
                            "&:hover": {
                              boxShadow: t.shadows[4],
                              transform: "translateY(-4px)",
                              borderColor: t.palette.primary.main,
                            },
                          })}
                          onClick={(e) => {
                            if (e.target.closest('button')) {
                              return;
                            }
                            navigate(`/profile/${userId}`);
                          }}
                        >
                          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <Avatar
                              src={userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=667eea&color=fff&size=128`}
                              sx={(t) => ({
                                width: 96,
                                height: 96,
                                mb: 2,
                                border: "3px solid",
                                borderColor: t.palette.mode === "dark" 
                                  ? alpha(t.palette.primary.main, 0.3)
                                  : alpha(t.palette.primary.main, 0.2),
                                background: t.palette.mode === "dark"
                                  ? "linear-gradient(135deg, #8b9aff 0%, #9775d4 100%)"
                                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                fontSize: 36,
                                fontWeight: 700,
                                boxShadow: t.palette.mode === "dark"
                                  ? "0 4px 12px rgba(139, 154, 255, 0.3)"
                                  : "0 4px 12px rgba(102, 126, 234, 0.25)",
                              })}
                            >
                              {userName.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="h6" fontWeight={700} mb={0.5} textAlign="center">
                              {userName}
                            </Typography>
                            {user.username && (
                              <Typography variant="body2" color="text.secondary" mb={1}>
                                @{user.username}
                              </Typography>
                            )}
                            {user.email && (
                              <Typography variant="caption" color="text.secondary" mb={2} sx={{ fontSize: 11 }}>
                                {user.email}
                              </Typography>
                            )}

                            {friendshipStatus === 'ACCEPTED' ? (
                              <Chip
                                label="Đã là bạn bè"
                                color="success"
                                size="small"
                                sx={{ mb: 2 }}
                              />
                            ) : friendshipStatus === 'PENDING' ? (
                              <Chip
                                label="Đã gửi lời mời"
                                color="warning"
                                size="small"
                                sx={{ mb: 2 }}
                              />
                            ) : friendshipStatus === 'REQUEST_SENT' ? (
                              <Chip
                                label="Đã gửi lời mời"
                                color="info"
                                size="small"
                                sx={{ mb: 2 }}
                              />
                            ) : (
                              <Button
                                fullWidth
                                variant="contained"
                                startIcon={<PersonAddIcon />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddFriend(userId);
                                }}
                                sx={{
                                  textTransform: "none",
                                  fontWeight: 600,
                                  borderRadius: 2.5,
                                  background: (t) => t.palette.mode === "dark"
                                    ? "linear-gradient(135deg, #8b9aff 0%, #9775d4 100%)"
                                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                  boxShadow: (t) => t.palette.mode === "dark"
                                    ? "0 4px 15px rgba(139, 154, 255, 0.4)"
                                    : "0 4px 15px rgba(102, 126, 234, 0.4)",
                                  "&:hover": {
                                    background: (t) => t.palette.mode === "dark"
                                      ? "linear-gradient(135deg, #7a89e6 0%, #8664bb 100%)"
                                      : "linear-gradient(135deg, #5568d3 0%, #63428a 100%)",
                                    boxShadow: (t) => t.palette.mode === "dark"
                                      ? "0 6px 20px rgba(139, 154, 255, 0.5)"
                                      : "0 6px 20px rgba(102, 126, 234, 0.5)",
                                    transform: "translateY(-2px)",
                                  },
                                  transition: "all 0.3s ease",
                                }}
                              >
                                Gửi lời mời kết bạn
                              </Button>
                            )}
                          </Box>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>
          )}

          {/* Tab 4: Following */}
          {tabValue === 4 && (
            <Box>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : followingList.length === 0 ? (
                <Card
                  elevation={0}
                  sx={(t) => ({
                    borderRadius: 4,
                    p: 6,
                    ml: 2.5,
                    textAlign: "center",
                    boxShadow: t.shadows[1],
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  })}
                >
                  <PersonIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Bạn chưa theo dõi ai
                  </Typography>
                </Card>
              ) : (
                <Grid container spacing={2.5}>
                  {followingList.map((user) => {
                    const normalized = normalizeFriendData(user);
                    return (
                      <Grid item xs={12} sm={6} md={4} key={normalized.id}>
                        <Card
                          elevation={0}
                          onClick={(e) => {
                            if (e.target.closest('button')) return;
                            navigate(`/profile/${normalized.id}`);
                          }}
                          sx={(t) => ({
                            borderRadius: 4,
                            p: 2.5,
                            ml: 2.5,
                            boxShadow: t.shadows[1],
                            border: "1px solid",
                            borderColor: "divider",
                            bgcolor: "background.paper",
                            transition: "all 0.3s ease",
                            cursor: "pointer",
                            "&:hover": {
                              boxShadow: t.shadows[4],
                              transform: "translateY(-4px)",
                              borderColor: t.palette.primary.main,
                            },
                          })}
                        >
                          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <Avatar
                              src={normalized.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(normalized.name || 'User')}&background=667eea&color=fff&size=128`}
                              sx={{ 
                                width: 96, 
                                height: 96, 
                                mb: 2, 
                                border: "3px solid", 
                                borderColor: "divider",
                                bgcolor: normalized.avatar ? 'transparent' : 'primary.main',
                              }}
                            >
                              {(normalized.name && normalized.name.length > 0) ? normalized.name.charAt(0).toUpperCase() : 'U'}
                            </Avatar>
                            <Typography variant="h6" fontWeight={700} mb={0.5} textAlign="center">
                              {normalized.name}
                            </Typography>
                            <Button
                              fullWidth
                              variant="outlined"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnfollow(normalized.id);
                              }}
                              sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                borderRadius: 2.5,
                                mt: 2,
                                borderColor: "divider",
                                "&:hover": {
                                  borderColor: "error.main",
                                  color: "error.main",
                                  bgcolor: "rgba(211, 47, 47, 0.04)",
                                },
                              }}
                            >
                              Hủy theo dõi
                            </Button>
                          </Box>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>
          )}

          {/* Tab 6: Followers */}
          {tabValue === 5 && (
            <Box>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : followersList.length === 0 ? (
                <Card
                  elevation={0}
                  sx={(t) => ({
                    borderRadius: 4,
                    p: 6,
                    ml: 2.5,
                    textAlign: "center",
                    boxShadow: t.shadows[1],
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  })}
                >
                  <PersonIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Chưa có người theo dõi
                  </Typography>
                </Card>
              ) : (
                <Grid container spacing={2.5}>
                  {followersList.map((user) => {
                    const normalized = normalizeFriendData(user);
                    return (
                      <Grid item xs={12} sm={6} md={4} key={normalized.id}>
                        <Card
                          elevation={0}
                          onClick={(e) => {
                            if (e.target.closest('button')) return;
                            navigate(`/profile/${normalized.id}`);
                          }}
                          sx={(t) => ({
                            borderRadius: 4,
                            p: 2.5,
                            boxShadow: t.shadows[1],
                            border: "1px solid",
                            borderColor: "divider",
                            bgcolor: "background.paper",
                            transition: "all 0.3s ease",
                            cursor: "pointer",
                            "&:hover": {
                              boxShadow: t.shadows[4],
                              transform: "translateY(-4px)",
                              borderColor: t.palette.primary.main,
                            },
                          })}
                        >
                          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <Avatar
                              src={normalized.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(normalized.name || 'User')}&background=667eea&color=fff&size=128`}
                              sx={{ 
                                width: 96, 
                                height: 96, 
                                mb: 2, 
                                border: "3px solid", 
                                borderColor: "divider",
                                bgcolor: normalized.avatar ? 'transparent' : 'primary.main',
                              }}
                            >
                              {(normalized.name && normalized.name.length > 0) ? normalized.name.charAt(0).toUpperCase() : 'U'}
                            </Avatar>
                            <Typography variant="h6" fontWeight={700} mb={0.5} textAlign="center">
                              {normalized.name}
                            </Typography>
                            <Button
                              fullWidth
                              variant="contained"
                              startIcon={<PersonAddIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFollow(normalized.id);
                              }}
                              sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                borderRadius: 2.5,
                                mt: 2,
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                "&:hover": {
                                  background: "linear-gradient(135deg, #5568d3 0%, #63428a 100%)",
                                },
                              }}
                            >
                              Theo dõi lại
                            </Button>
                          </Box>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>
          )}

          {/* Tab 6: Followers */}
          {tabValue === 6 && (
            <Box>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : followersList.length === 0 ? (
                <Card
                  elevation={0}
                  sx={(t) => ({
                    borderRadius: 4,
                    p: 6,
                    textAlign: "center",
                    boxShadow: t.shadows[1],
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  })}
                >
                  <PersonIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Chưa có người theo dõi
                  </Typography>
                </Card>
              ) : (
                <Grid container spacing={2.5}>
                  {followersList.map((user) => {
                    const normalized = normalizeFriendData(user);
                    return (
                      <Grid item xs={12} sm={6} md={4} key={normalized.id}>
                        <Card
                          elevation={0}
                          onClick={(e) => {
                            if (e.target.closest('button')) return;
                            navigate(`/profile/${normalized.id}`);
                          }}
                          sx={(t) => ({
                            borderRadius: 4,
                            p: 2.5,
                            boxShadow: t.shadows[1],
                            border: "1px solid",
                            borderColor: "divider",
                            bgcolor: "background.paper",
                            transition: "all 0.3s ease",
                            cursor: "pointer",
                            "&:hover": {
                              boxShadow: t.shadows[4],
                              transform: "translateY(-4px)",
                              borderColor: t.palette.primary.main,
                            },
                          })}
                        >
                          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <Avatar
                              src={normalized.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(normalized.name || 'User')}&background=667eea&color=fff&size=128`}
                              sx={{ 
                                width: 96, 
                                height: 96, 
                                mb: 2, 
                                border: "3px solid", 
                                borderColor: "divider",
                                bgcolor: normalized.avatar ? 'transparent' : 'primary.main',
                              }}
                            >
                              {(normalized.name && normalized.name.length > 0) ? normalized.name.charAt(0).toUpperCase() : 'U'}
                            </Avatar>
                            <Typography variant="h6" fontWeight={700} mb={0.5} textAlign="center">
                              {normalized.name}
                            </Typography>
                            <Button
                              fullWidth
                              variant="contained"
                              startIcon={<PersonAddIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFollow(normalized.id);
                              }}
                              sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                borderRadius: 2.5,
                                mt: 2,
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                "&:hover": {
                                  background: "linear-gradient(135deg, #5568d3 0%, #63428a 100%)",
                                },
                              }}
                            >
                              Theo dõi lại
                            </Button>
                          </Box>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>
          )}

        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ mt: "64px" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: 3, boxShadow: 3, fontWeight: 500 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
}
