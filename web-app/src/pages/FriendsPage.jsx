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
import Scene from "./Scene";
import {
  getFriendRequests,
  getAllFriends,
  getFriendSuggestions,
  acceptFriendRequest,
  declineFriendRequest,
  addFriend,
  removeFriend,
  searchFriends,
  getSentFriendRequests,
} from "../services/friendService";
import { getUserProfileById } from "../services/userService";

export default function Friends() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [friendRequests, setFriendRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]); // Store sent requests with full details
  const [suggestions, setSuggestions] = useState([]);
  const [allFriends, setAllFriends] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [friendsList, setFriendsList] = useState([]); // Store friends IDs for quick lookup
  const [sentRequestsList, setSentRequestsList] = useState([]); // Store sent request IDs
  const searchTimeoutRef = useState(null);

  // Load friendship data on mount to get accurate status
  useEffect(() => {
    loadFriendshipData();
  }, []);

  // Load data based on active tab
  useEffect(() => {
    loadData();
  }, [tabValue]);

  // Load friends and sent requests for status checking
  const loadFriendshipData = async () => {
    console.log('Loading friendship data for status checking...');
    try {
      // Load all friends (ACCEPTED status)
      try {
        const friendsResponse = await getAllFriends(1, 100);
        console.log('Friends response:', friendsResponse);
        
        let friends = [];
        if (friendsResponse.data?.result?.content) {
          friends = friendsResponse.data.result.content;
        } else if (friendsResponse.data?.result && Array.isArray(friendsResponse.data.result)) {
          friends = friendsResponse.data.result;
        } else if (Array.isArray(friendsResponse.data)) {
          friends = friendsResponse.data;
        }
        
        setAllFriends(friends);
        // Extract friend IDs for quick lookup
        // For friends, could be either userId or friendId depending on direction
        const friendIds = new Set();
        friends.forEach(f => {
          const friendId = f.friendId || f.id || f.userId;
          const userId = f.userId || f.id;
          if (friendId) friendIds.add(String(friendId).trim());
          if (userId) friendIds.add(String(userId).trim());
        });
        console.log('Friends list:', Array.from(friendIds));
        setFriendsList(Array.from(friendIds));
      } catch (error) {
        console.error('Error loading friends:', error);
        if (error.response?.status !== 404) {
          console.error('Error loading friends:', error);
        }
      }

      // Load sent requests (PENDING status where current user is sender)
      try {
        const sentResponse = await getSentFriendRequests(1, 100);
        console.log('Sent requests response:', sentResponse);
        console.log('Sent requests response.data:', sentResponse.data);
        console.log('Sent requests response.data.result:', sentResponse.data?.result);
        
        let sentRequestsData = [];
        // Try different response formats
        if (sentResponse.data?.result?.content && Array.isArray(sentResponse.data.result.content)) {
          sentRequestsData = sentResponse.data.result.content;
          console.log('Found sent requests in result.content:', sentRequestsData);
        } else if (sentResponse.data?.result?.data && Array.isArray(sentResponse.data.result.data)) {
          sentRequestsData = sentResponse.data.result.data;
          console.log('Found sent requests in result.data:', sentRequestsData);
        } else if (sentResponse.data?.result && Array.isArray(sentResponse.data.result)) {
          sentRequestsData = sentResponse.data.result;
          console.log('Found sent requests in result array:', sentRequestsData);
        } else if (sentResponse.data?.content && Array.isArray(sentResponse.data.content)) {
          sentRequestsData = sentResponse.data.content;
          console.log('Found sent requests in content:', sentRequestsData);
        } else if (sentResponse.data?.data && Array.isArray(sentResponse.data.data)) {
          sentRequestsData = sentResponse.data.data;
          console.log('Found sent requests in data:', sentRequestsData);
        } else if (Array.isArray(sentResponse.data)) {
          sentRequestsData = sentResponse.data;
          console.log('Found sent requests in data array:', sentRequestsData);
        } else {
          console.warn('No sent requests found in response. Response structure:', JSON.stringify(sentResponse.data, null, 2));
        }
        
        // In sent-requests: userId is current user, friendId is the recipient
        const sentIds = sentRequestsData.map(r => {
          console.log('Processing sent request:', r);
          // friendId is the person we sent request to
          const recipientId = r.friendId || r.id || r.userId;
          console.log('Recipient ID:', recipientId);
          return recipientId;
        }).filter(Boolean).map(id => String(id).trim());
        
        console.log('Sent requests list (final):', sentIds);
        setSentRequestsList(sentIds);
      } catch (error) {
        console.error('Error loading sent requests:', error);
        if (error.response?.status !== 404) {
          console.error('Error loading sent requests:', error);
        }
        setSentRequestsList([]);
      }
    } catch (error) {
      console.error('Error loading friendship data:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    console.log('Loading data for tab:', tabValue);
    try {
      if (tabValue === 0) {
        // Friend requests
        console.log('Loading friend requests...');
        try {
          const response = await getFriendRequests(1, 20);
          console.log('Friend requests response:', response);
          
          let requests = [];
          // Try multiple response formats
          if (response.data?.result?.content && Array.isArray(response.data.result.content)) {
            requests = response.data.result.content;
            console.log('Found friend requests in result.content');
          } else if (response.data?.result?.data && Array.isArray(response.data.result.data)) {
            requests = response.data.result.data;
            console.log('Found friend requests in result.data');
          } else if (response.data?.result && Array.isArray(response.data.result)) {
            requests = response.data.result;
            console.log('Found friend requests in result array');
          } else if (response.data?.content && Array.isArray(response.data.content)) {
            requests = response.data.content;
            console.log('Found friend requests in content');
          } else if (response.data?.data && Array.isArray(response.data.data)) {
            requests = response.data.data;
            console.log('Found friend requests in data');
          } else if (Array.isArray(response.data)) {
            requests = response.data;
            console.log('Found friend requests in data array');
          } else {
            console.warn('No friend requests found in response. Response structure:', JSON.stringify(response.data, null, 2));
            // Try to extract from response directly if structure is different
            if (response.data && typeof response.data === 'object') {
              console.log('Attempting to extract from response.data directly...');
              // Check if response.data itself is an array or has array properties
              const possibleArrays = Object.values(response.data).filter(v => Array.isArray(v));
              if (possibleArrays.length > 0) {
                console.log('Found possible arrays in response.data:', possibleArrays);
                requests = possibleArrays[0]; // Use first array found
                console.log('Using first array found:', requests);
              }
            }
          }
          
          console.log('Raw friend requests (final):', requests, 'Length:', requests?.length || 0);
          
          // Ensure requests is an array
          if (!Array.isArray(requests)) {
            console.warn('Requests is not an array, converting...', requests);
            requests = [];
          }
          
          // Fetch profile information for each friend request
          // For received-requests: friendId is the user who sent the request to current user
          if (requests.length > 0) {
            console.log('Processing', requests.length, 'friend requests');
            const enrichedRequests = await Promise.all(
              requests.map(async (request, index) => {
                try {
                  // In received-requests: 
                  // - If current user is friendId, then userId is the sender
                  // - If current user is userId, then friendId is the sender
                  // Based on the query: WHERE friendId = :userId, so current user is friendId
                  // Therefore, userId in the response is the person who sent the request
                  // But we need to be flexible - try both userId and friendId as potential sender
                  const potentialSenderId = request.userId || request.friendId;
                  const senderId = potentialSenderId; // Use whichever is available
                  
                  console.log(`Request ${index}:`, {
                    id: request.id,
                    userId: request.userId,
                    friendId: request.friendId,
                    potentialSenderId: potentialSenderId,
                    senderId: senderId,
                    status: request.status,
                    createdAt: request.createdAt,
                    updatedAt: request.updatedAt,
                    fullRequest: request
                  });
                  
                  // Always ensure we have a valid ID to work with
                  const validSenderId = senderId || request.friendId || request.userId || request.id;
                  
                  if (!validSenderId) {
                    console.error('No valid ID found in request:', request);
                    return null; // Will be filtered out
                  }
                  
                  // Use senderId if available, otherwise use friendId (might be sender in some API responses)
                  const idToUse = senderId || request.friendId || request.userId;
                  
                  console.log('Fetching profile for senderId:', idToUse);
                  try {
                    const profileResponse = await getUserProfileById(idToUse);
                    const profile = profileResponse?.data?.result || profileResponse?.data || profileResponse;
                    console.log('Profile response for', idToUse, ':', profile);
                    
                    const firstName = profile?.firstName || '';
                    const lastName = profile?.lastName || '';
                    const fullName = firstName && lastName 
                      ? `${firstName} ${lastName}`.trim()
                      : firstName || lastName || profile?.username || profile?.name || `User ${idToUse}`;
                    
                    return {
                      ...request,
                      friendId: idToUse, // This is the sender's ID for accept/decline
                      friendName: fullName,
                      friendAvatar: profile?.avatar || null,
                      username: profile?.username || null,
                      email: profile?.email || null,
                      firstName: profile?.firstName || null,
                      lastName: profile?.lastName || null,
                    };
                  } catch (profileError) {
                    console.warn('Error fetching profile for senderId:', idToUse, profileError);
                    // Still return request with senderId even if profile fetch fails
                    // This ensures the request is still visible
                    // Use a generic name instead of ID
                    return {
                      ...request,
                      friendId: idToUse,
                      friendName: 'Người dùng',
                      friendAvatar: null,
                      username: null,
                      email: null,
                      firstName: null,
                      lastName: null,
                    };
                  }
                } catch (error) {
                  console.warn('Error in friend request processing:', error);
                  // Try to salvage the request with any available ID
                  const fallbackId = request.friendId || request.userId || request.id;
                  if (!fallbackId) {
                    console.error('Cannot salvage request, no ID available:', request);
                    return null; // Will be filtered out
                  }
                  return {
                    ...request,
                    friendId: fallbackId,
                    friendName: 'Người dùng',
                    friendAvatar: null,
                    username: null,
                    email: null,
                    firstName: null,
                    lastName: null,
                  };
                }
              })
            );
            
            console.log('Enriched friend requests (before filter):', enrichedRequests);
            // Filter out any null/undefined requests and ensure they have valid IDs
            // But be more lenient - if request has any ID field, keep it
            const validRequests = enrichedRequests
              .filter(req => {
                if (!req) {
                  console.warn('Filtering out null/undefined request');
                  return false;
                }
                return true; // Keep all non-null requests
              })
              .map(req => {
                // Ensure friendId is set (needed for accept/decline)
                // friendId should be the sender's ID
                if (!req.friendId) {
                  // Try to get from userId (sender) or id field
                  req.friendId = req.userId || req.id;
                  if (req.friendId) {
                    console.log('Setting friendId from userId/id:', req.friendId);
                  }
                }
                // Ensure we have at least one ID
                if (!req.friendId && !req.userId && !req.id) {
                  console.error('Request has no ID fields:', req);
                  return null;
                }
                // Ensure friendName is set - but don't override if it's already a proper name
                if (!req.friendName || req.friendName === 'Unknown' || req.friendName.startsWith('User ')) {
                  // Only set fallback name if we don't have a proper name
                  // Check if we have firstName/lastName or username
                  if (req.firstName || req.lastName) {
                    req.friendName = `${req.firstName || ''} ${req.lastName || ''}`.trim();
                  } else if (req.username) {
                    req.friendName = req.username;
                  } else {
                    // Don't use ID as name - use a generic placeholder
                    req.friendName = 'Người dùng';
                  }
                }
                return req;
              })
              .filter(req => req !== null); // Remove any null requests
            
            console.log('Valid friend requests after filtering:', validRequests.length, validRequests);
            if (validRequests.length === 0 && requests.length > 0) {
              console.error('All requests were filtered out! Original requests:', requests);
              console.error('Enriched requests:', enrichedRequests);
            }
            setFriendRequests(validRequests);
          } else {
            console.log('No friend requests found, setting empty array');
            setFriendRequests([]);
          }
        } catch (error) {
          console.error('Error loading friend requests:', error);
          // If endpoint doesn't exist (404) or other errors, show empty list
          if (error.response?.status === 404) {
            console.warn('Friend requests endpoint not available (404)');
            setFriendRequests([]);
          } else if (error.response?.status === 401) {
            console.warn('Unauthorized (401) - user may need to login');
            setFriendRequests([]);
            setSnackbar({ open: true, message: "Vui lòng đăng nhập lại.", severity: "warning" });
          } else {
            // For other errors, still set empty array to prevent UI crash
            console.warn('Error loading friend requests, setting empty array:', error);
            setFriendRequests([]);
            // Only show error message for non-404/401 errors
            if (error.response?.status && error.response.status >= 500) {
              setSnackbar({ open: true, message: "Lỗi server. Vui lòng thử lại sau.", severity: "error" });
            }
          }
        }
      } else if (tabValue === 1) {
        // Suggestions - use /profile/users endpoint and filter
        console.log('Loading friend suggestions...');
        try {
          const response = await getFriendSuggestions(1, 20);
          console.log('Friend suggestions response:', response);
          
          let allUsers = [];
          if (response.data?.result && Array.isArray(response.data.result)) {
            allUsers = response.data.result;
          } else if (Array.isArray(response.data)) {
            allUsers = response.data;
          }
          
          console.log('All users from API:', allUsers);
          
          // Filter out users who are already friends or have pending requests
          // Note: This is a simple filter, in production you'd want to exclude current user too
          const filteredSuggestions = allUsers.filter(user => {
            const userId = user.id || user.userId;
            // Exclude if already a friend
            const isFriend = friendsList.some(id => String(id).trim() === String(userId).trim());
            // Exclude if we already sent a request
            const hasSentRequest = sentRequestsList.some(id => String(id).trim() === String(userId).trim());
            return !isFriend && !hasSentRequest;
          });
          
          console.log('Filtered suggestions:', filteredSuggestions);
          setSuggestions(filteredSuggestions);
        } catch (error) {
          console.error('Error loading friend suggestions:', error);
          // If endpoint doesn't exist (404), just show empty list
          if (error.response?.status === 404) {
            console.warn('Friend suggestions endpoint not available (404)');
            setSuggestions([]);
          } else {
            throw error;
          }
        }
      } else if (tabValue === 2) {
        // All friends
        console.log('Loading all friends...');
        try {
          const response = await getAllFriends(1, 20);
          console.log('All friends response:', response);
          
          let friends = [];
          // Try multiple response formats
          if (response.data?.result?.content && Array.isArray(response.data.result.content)) {
            friends = response.data.result.content;
            console.log('Found friends in result.content');
          } else if (response.data?.result?.data && Array.isArray(response.data.result.data)) {
            friends = response.data.result.data;
            console.log('Found friends in result.data');
          } else if (response.data?.result && Array.isArray(response.data.result)) {
            friends = response.data.result;
            console.log('Found friends in result array');
          } else if (response.data?.content && Array.isArray(response.data.content)) {
            friends = response.data.content;
            console.log('Found friends in content');
          } else if (response.data?.data && Array.isArray(response.data.data)) {
            friends = response.data.data;
            console.log('Found friends in data');
          } else if (Array.isArray(response.data)) {
            friends = response.data;
            console.log('Found friends in data array');
          } else {
            console.warn('No friends data found in response. Response structure:', JSON.stringify(response.data, null, 2));
          }
          
          if (friends.length > 0) {
            console.log('Setting all friends:', friends);
            setAllFriends(friends);
            // Update friends list for status checking
            const friendIds = new Set();
            friends.forEach(f => {
              const friendId = f.friendId || f.id || f.userId;
              const userId = f.userId || f.id;
              if (friendId) friendIds.add(String(friendId).trim());
              if (userId) friendIds.add(String(userId).trim());
            });
            const friendIdsArray = Array.from(friendIds);
            console.log('Setting friends list:', friendIdsArray);
            setFriendsList(friendIdsArray);
          } else {
            console.warn('No friends found in response');
            setAllFriends([]);
            setFriendsList([]);
          }
        } catch (error) {
          console.error('Error loading all friends:', error);
          // If endpoint doesn't exist (404), just show empty list
          if (error.response?.status === 404) {
            console.warn('Friends endpoint not available (404)');
            setAllFriends([]);
            setFriendsList([]);
          } else {
            throw error;
          }
        }
      } else if (tabValue === 3) {
        // Sent requests tab
        console.log('Loading sent friend requests...');
        try {
          const response = await getSentFriendRequests(1, 20);
          console.log('Sent requests response:', response);
          
          let requests = [];
          // Try multiple response formats - prioritize result.data as seen in console
          if (response.data?.result?.data && Array.isArray(response.data.result.data)) {
            requests = response.data.result.data;
            console.log('Found sent requests in result.data');
          } else if (response.data?.result?.content && Array.isArray(response.data.result.content)) {
            requests = response.data.result.content;
            console.log('Found sent requests in result.content');
          } else if (response.data?.result && Array.isArray(response.data.result)) {
            requests = response.data.result;
            console.log('Found sent requests in result array');
          } else if (response.data?.content && Array.isArray(response.data.content)) {
            requests = response.data.content;
            console.log('Found sent requests in content');
          } else if (response.data?.data && Array.isArray(response.data.data)) {
            requests = response.data.data;
            console.log('Found sent requests in data');
          } else if (Array.isArray(response.data)) {
            requests = response.data;
            console.log('Found sent requests in data array');
          } else {
            console.warn('No sent requests found in response. Response structure:', JSON.stringify(response.data, null, 2));
          }
          
          console.log('Raw sent requests:', requests);
          
          // Fetch profile information for each sent request
          // For sent-requests: friendId is the recipient (person we sent request to)
          if (requests.length > 0) {
            console.log('Processing', requests.length, 'sent requests');
            const enrichedRequests = await Promise.all(
              requests.map(async (request, index) => {
                try {
                  // In sent-requests: friendId is the recipient
                  const recipientId = request.friendId || request.id || request.userId;
                  console.log(`Sent request ${index}:`, {
                    id: request.id,
                    userId: request.userId, // This is the sender (current user)
                    friendId: request.friendId, // This is the recipient
                    recipientId: recipientId,
                    status: request.status,
                    createdAt: request.createdAt,
                    updatedAt: request.updatedAt
                  });
                  
                  if (recipientId) {
                    console.log('Fetching profile for recipientId:', recipientId);
                    try {
                      const profileResponse = await getUserProfileById(recipientId);
                      const profile = profileResponse?.data?.result || profileResponse?.data || profileResponse;
                      console.log('Profile response for', recipientId, ':', profile);
                      
                      const firstName = profile?.firstName || '';
                      const lastName = profile?.lastName || '';
                      const fullName = firstName && lastName 
                        ? `${firstName} ${lastName}`.trim()
                        : firstName || lastName || profile?.username || profile?.name || 'Unknown';
                      
                      return {
                        ...request,
                        friendId: recipientId,
                        friendName: fullName,
                        friendAvatar: profile?.avatar || null,
                        username: profile?.username || null,
                        email: profile?.email || null,
                        firstName: profile?.firstName || null,
                        lastName: profile?.lastName || null,
                      };
                    } catch (profileError) {
                      console.warn('Error fetching profile for recipientId:', recipientId, profileError);
                      // Still return request with recipientId even if profile fetch fails
                      // Use a generic name instead of ID
                      return {
                        ...request,
                        friendId: recipientId,
                        friendName: 'Người dùng',
                        friendAvatar: null,
                        username: null,
                        email: null,
                        firstName: null,
                        lastName: null,
                      };
                    }
                  }
                  console.warn('No recipientId found in sent request:', request);
                  // Try to use friendId as fallback
                  const fallbackId = request.friendId || request.userId || request.id;
                  return {
                    ...request,
                    friendId: fallbackId,
                    friendName: 'Người dùng',
                    friendAvatar: null,
                  };
                } catch (error) {
                  console.warn('Error fetching profile for sent request:', error);
                  const fallbackId = request.friendId || request.userId || request.id;
                  if (!fallbackId) {
                    console.error('Cannot salvage sent request, no ID available:', request);
                    return null; // Will be filtered out
                  }
                  return {
                    ...request,
                    friendId: fallbackId,
                    friendName: 'Người dùng',
                    friendAvatar: null,
                  };
                }
              })
            );
            
            console.log('Enriched sent requests (before filter):', enrichedRequests);
            // Filter out any null/undefined requests and ensure they have valid IDs
            // Also ensure friendName is set properly
            const validRequests = enrichedRequests
              .filter(req => {
                if (!req) {
                  console.warn('Filtering out null/undefined sent request');
                  return false;
                }
                const hasValidId = req.friendId || req.userId || req.id;
                if (!hasValidId) {
                  console.warn('Filtering out sent request without valid ID:', req);
                  return false;
                }
                return true;
              })
              .map(req => {
                // Ensure friendName is set properly - don't show ID
                if (!req.friendName || req.friendName === 'Unknown' || req.friendName.startsWith('User ')) {
                  // Try to get name from firstName/lastName or username
                  if (req.firstName || req.lastName) {
                    req.friendName = `${req.firstName || ''} ${req.lastName || ''}`.trim();
                  } else if (req.username) {
                    req.friendName = req.username;
                  } else {
                    // If we still don't have a name, try to fetch it again or use a placeholder
                    // But don't show the ID
                    req.friendName = 'Người dùng';
                  }
                }
                return req;
              });
            console.log('Valid sent requests after filtering:', validRequests.length, validRequests);
            setSentRequests(validRequests);
          } else {
            console.log('No sent requests found, setting empty array');
            setSentRequests([]);
          }
        } catch (error) {
          console.error('Error loading sent requests:', error);
          // If endpoint doesn't exist (404) or other errors, show empty list
          if (error.response?.status === 404) {
            console.warn('Sent requests endpoint not available (404)');
            setSentRequests([]);
          } else if (error.response?.status === 401) {
            console.warn('Unauthorized (401) - user may need to login');
            setSentRequests([]);
            setSnackbar({ open: true, message: "Vui lòng đăng nhập lại.", severity: "warning" });
          } else {
            // For other errors, still set empty array to prevent UI crash
            console.warn('Error loading sent requests, setting empty array:', error);
            setSentRequests([]);
            // Only show error message for non-404/401 errors
            if (error.response?.status && error.response.status >= 500) {
              setSnackbar({ open: true, message: "Lỗi server. Vui lòng thử lại sau.", severity: "error" });
            }
          }
        }
      } else if (tabValue === 4) {
        // Search tab - ensure friendship data is loaded for status checking
        console.log('Search tab - friendship data should already be loaded');
        // Friendship data is loaded on mount, but refresh if needed
        if (friendsList.length === 0 && sentRequestsList.length === 0) {
          console.log('Friendship data not loaded yet, loading now...');
          await loadFriendshipData();
        }
      }
    } catch (error) {
      console.error('Error loading friends data:', error);
      // Only show error if it's not a 404
      if (error.response?.status !== 404) {
        setSnackbar({ open: true, message: "Không thể tải dữ liệu. Vui lòng thử lại.", severity: "error" });
      }
    } finally {
      setLoading(false);
      console.log('Finished loading data');
    }
  };

  // Get friendship status for a user
  const getFriendshipStatus = (userId) => {
    if (!userId) return 'NONE';
    
    const normalizedUserId = String(userId).trim();
    
    // Check if already friends (in friendsList)
    const isFriend = friendsList.some(id => String(id).trim() === normalizedUserId);
    if (isFriend) {
      console.log(`User ${normalizedUserId} is already a friend`);
      return 'ACCEPTED';
    }
    
    // Check if we sent a request to this user
    const hasSentRequest = sentRequestsList.some(id => String(id).trim() === normalizedUserId);
    if (hasSentRequest) {
      console.log(`User ${normalizedUserId} has pending sent request`);
      return 'PENDING';
    }
    
    console.log(`User ${normalizedUserId} has no relationship`);
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
      console.log('Search friends response:', response);
      
      let results = [];
      // Handle different response formats
      if (response.data?.result) {
        if (Array.isArray(response.data.result)) {
          results = response.data.result;
        } else if (response.data.result.content && Array.isArray(response.data.result.content)) {
          results = response.data.result.content;
        } else if (response.data.result.data && Array.isArray(response.data.result.data)) {
          results = response.data.result.data;
        }
      } else if (response.data?.content && Array.isArray(response.data.content)) {
        results = response.data.content;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        results = response.data.data;
      } else if (Array.isArray(response.data)) {
        results = response.data;
      }
      
      console.log('Parsed search results:', results);
      
      // Add friendship status to each result
      const resultsWithStatus = results.map(user => {
        const userId = user.id || user.userId;
        return {
          ...user,
          friendshipStatus: getFriendshipStatus(userId),
        };
      });
      setSearchResults(resultsWithStatus);
    } catch (error) {
      console.error('Error searching friends:', error);
      setSnackbar({ open: true, message: "Không thể tìm kiếm. Vui lòng thử lại.", severity: "error" });
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (tabValue === 4) {
      const timeoutId = setTimeout(() => {
        handleSearch(searchQuery);
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, tabValue]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSearchQuery("");
    setSearchResults([]);
    // Reload data when switching to sent requests tab
    if (newValue === 3) {
      // Tab 3 is now sent requests
    }
  };

  const handleAcceptRequest = async (friendId) => {
    try {
      // friendId here is the userId from the request (the person who sent the request)
      // In enriched request, friendId is set to senderId
      console.log('Accepting friend request from:', friendId);
      await acceptFriendRequest(friendId);
      
      // Remove from friend requests list immediately for better UX
      setFriendRequests((prev) => prev.filter((req) => {
        // In enriched request, friendId is the sender's ID
        const requestSenderId = req.friendId || req.userId || req.id;
        return String(requestSenderId).trim() !== String(friendId).trim();
      }));
      
      setSnackbar({ open: true, message: "Đã chấp nhận lời mời kết bạn!", severity: "success" });
      
      // Reload friendship data to update friends list and sent requests
      await loadFriendshipData();
      
      // Reload current tab data
      if (tabValue === 0) {
        // Reload friend requests to ensure data is fresh
        loadData();
      } else if (tabValue === 2) {
        // Reload friends list
        loadData();
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      const errorMessage = error.response?.data?.message || error.message || "Không thể chấp nhận lời mời. Vui lòng thử lại.";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    }
  };

  const handleDeclineRequest = async (friendId) => {
    try {
      // friendId here is the userId from the request (the person who sent the request)
      // In enriched request, friendId is set to senderId
      console.log('Declining friend request from:', friendId);
      await declineFriendRequest(friendId);
      
      // Remove from friend requests list immediately for better UX
      setFriendRequests((prev) => prev.filter((req) => {
        // In enriched request, friendId is the sender's ID
        const requestSenderId = req.friendId || req.userId || req.id;
        return String(requestSenderId).trim() !== String(friendId).trim();
      }));
      
      setSnackbar({ open: true, message: "Đã từ chối lời mời kết bạn!", severity: "info" });
      
      // Reload friendship data to update status
      await loadFriendshipData();
      
      // Reload friend requests tab if we're on it
      if (tabValue === 0) {
        loadData();
      }
    } catch (error) {
      console.error('Error declining friend request:', error);
      const errorMessage = error.response?.data?.message || error.message || "Không thể từ chối lời mời. Vui lòng thử lại.";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    }
  };

  const handleAddFriend = async (userId) => {
    try {
      await addFriend(userId);
      
      // Normalize userId to string for consistent comparison
      const normalizedUserId = String(userId).trim();
      
      // Reload sent requests to get latest data from server
      try {
        const sentResponse = await getSentFriendRequests(1, 100);
        if (sentResponse.data?.result?.content) {
          const sentRequests = sentResponse.data.result.content;
          const sentIds = sentRequests.map(r => r.friendId || r.id || r.userId).filter(Boolean);
          setSentRequestsList(sentIds);
        } else if (sentResponse.data?.result && Array.isArray(sentResponse.data.result)) {
          const sentIds = sentResponse.data.result.map(r => r.friendId || r.id || r.userId).filter(Boolean);
          setSentRequestsList(sentIds);
        }
      } catch (error) {
        // If reload fails, at least add to local state
        setSentRequestsList((prev) => {
          const prevNormalized = prev.map(id => String(id).trim());
          if (!prevNormalized.includes(normalizedUserId)) {
            return [...prev, normalizedUserId];
          }
          return prev;
        });
      }
      
      // Update suggestions if in suggestions tab
      setSuggestions((prev) => prev.filter((sug) => {
        const id = String(sug.id || sug.userId).trim();
        return id !== normalizedUserId;
      }));
      
      // Update search results if in search tab - immediately update UI
      setSearchResults((prev) => prev.map((user) => {
        const id = String(user.id || user.userId).trim();
        if (id === normalizedUserId) {
          return { 
            ...user, 
            friendshipStatus: 'PENDING', 
            status: 'PENDING',
            requestSent: true // Add flag to track
          };
        }
        return user;
      }));
      
      // Reload friend requests tab to show new requests (for the recipient)
      // This ensures that when user A sends a request to user B, user B will see it
      if (tabValue === 0) {
        // Use loadData to ensure proper enrichment
        loadData();
      }
      
      // Reload sent requests tab if we're on it
      if (tabValue === 3) {
        try {
          const response = await getSentFriendRequests(1, 20);
          let requests = [];
          if (response.data?.result?.content) {
            requests = response.data.result.content;
          } else if (response.data?.result?.data && Array.isArray(response.data.result.data)) {
            requests = response.data.result.data;
          } else if (response.data?.result && Array.isArray(response.data.result)) {
            requests = response.data.result;
          } else if (response.data?.content && Array.isArray(response.data.content)) {
            requests = response.data.content;
          } else if (response.data?.data && Array.isArray(response.data.data)) {
            requests = response.data.data;
          } else if (Array.isArray(response.data)) {
            requests = response.data;
          }
          
          if (requests.length > 0) {
            const enrichedRequests = await Promise.all(
              requests.map(async (request) => {
                try {
                  const recipientId = request.friendId || request.id || request.userId;
                  if (recipientId) {
                    const profileResponse = await getUserProfileById(recipientId);
                    const profile = profileResponse?.data?.result || profileResponse?.data || profileResponse;
                    const firstName = profile?.firstName || '';
                    const lastName = profile?.lastName || '';
                    const fullName = firstName && lastName 
                      ? `${firstName} ${lastName}`.trim()
                      : firstName || lastName || profile?.username || profile?.name || 'Unknown';
                    
                    return {
                      ...request,
                      friendId: recipientId,
                      friendName: fullName,
                      friendAvatar: profile?.avatar || null,
                      username: profile?.username || null,
                      email: profile?.email || null,
                      firstName: profile?.firstName || null,
                      lastName: profile?.lastName || null,
                    };
                  }
                  // Fallback if no recipientId
                  const fallbackId = request.friendId || request.userId || request.id;
                  if (!fallbackId) {
                    console.warn('No valid ID found in sent request:', request);
                    return null; // Will be filtered out
                  }
                  return {
                    ...request,
                    friendId: fallbackId,
                    friendName: `User ${fallbackId}`,
                    friendAvatar: null,
                  };
                } catch (error) {
                  console.warn('Error fetching profile for sent request:', error);
                  const fallbackId = request.friendId || request.userId || request.id;
                  if (!fallbackId) {
                    console.warn('No valid ID found in sent request after error:', request);
                    return null; // Will be filtered out
                  }
                  return {
                    ...request,
                    friendId: fallbackId,
                    friendName: `User ${fallbackId}`,
                    friendAvatar: null,
                  };
                }
              })
            );
            setSentRequests(enrichedRequests);
          } else {
            setSentRequests([]);
          }
        } catch (error) {
          if (error.response?.status !== 404) {
            console.warn('Error reloading sent requests:', error);
          }
        }
      }
      
      setSnackbar({ open: true, message: "Đã gửi lời mời kết bạn!", severity: "success" });
    } catch (error) {
      console.error('Error adding friend:', error);
      setSnackbar({ open: true, message: "Không thể gửi lời mời. Vui lòng thử lại.", severity: "error" });
    }
  };

  const handleRemoveSuggestion = (id) => {
    setSuggestions((prev) => prev.filter((sug) => {
      const sugId = sug.id || sug.userId;
      return sugId !== id;
    }));
    setSnackbar({ open: true, message: "Đã xóa gợi ý này!", severity: "info" });
  };

  const handleUnfriend = async (friendId) => {
    try {
      await removeFriend(friendId);
      setAllFriends((prev) => prev.filter((friend) => {
        const id = friend.friendId || friend.id || friend.userId;
        return id !== friendId;
      }));
      setSnackbar({ open: true, message: "Đã hủy kết bạn!", severity: "warning" });
    } catch (error) {
      console.error('Error removing friend:', error);
      setSnackbar({ open: true, message: "Không thể hủy kết bạn. Vui lòng thử lại.", severity: "error" });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Helper function to normalize friend data from API
  const normalizeFriendData = (item) => {
    if (!item) {
      console.warn('normalizeFriendData called with null/undefined item');
      return {
        id: 'unknown',
        name: 'Unknown',
        avatar: null,
        mutualFriends: 0,
        time: '',
        status: 'PENDING',
      };
    }
    
    console.log('Normalizing friend data:', item);
    // Handle different API response formats
    // FriendshipResponse from backend typically has: friendId, friendName, friendAvatar, status, createdDate
    // For friend requests: friendId is the sender's ID (after enrichment)
    // For sent requests: friendId is the recipient's ID
    // For friends: friendId is the friend's ID
    
    // Priority: friendId (set during enrichment) > userId > id > friend?.id > user?.id
    const normalizedId = item.friendId || item.userId || item.id || item.friend?.id || item.user?.id || 'unknown';
    
    // For name, try friendName first (from enrichment), then other fields
    // But don't use friendName if it starts with "User " (means it's an ID, not a real name)
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
    
    // Only use ID as fallback if we really don't have a name
    if (!normalizedName || normalizedName.trim() === '') {
      normalizedName = normalizedId !== 'unknown' ? 'Người dùng' : 'Unknown';
    }
    
    const normalized = {
      id: normalizedId,
      name: normalizedName || 'Unknown',
      avatar: item.friendAvatar || item.userAvatar || item.avatar || item.friend?.avatar || item.user?.avatar || null,
      mutualFriends: item.mutualFriends || 0,
      time: item.createdDate || item.time || item.createdAt || item.updatedAt || '',
      status: item.status || item.friendshipStatus || 'PENDING',
      // Keep original data for reference
      ...item,
    };
    console.log('Normalized friend data:', normalized);
    return normalized;
  };

  const filteredFriends = allFriends
    .map(normalizeFriendData)
    .filter((friend) => {
      const searchLower = searchQuery.toLowerCase();
      return friend.name.toLowerCase().includes(searchLower);
    });

  return (
    <Scene>
      <Box sx={{ display: "flex", justifyContent: "center", width: "100%", mt: 4, px: 2 }}>
        <Box sx={{ width: "100%", maxWidth: 1200 }}>
          {/* Header */}
          <Card
            elevation={0}
            sx={(t) => ({
              borderRadius: 4,
              p: 3,
              mb: 3,
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
              <Tab label="Gợi ý kết bạn" />
              <Tab label="Tất cả bạn bè" />
              <Tab label={`Đã gửi lời mời (${sentRequests.length})`} />
              <Tab label="Tìm kiếm" />
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
                    return (
                    <Grid item xs={12} sm={6} md={4} key={uniqueKey}>
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
                              {normalized.time}
                            </Typography>
                          )}

                          <Stack direction="row" spacing={1} width="100%">
                            <Button
                              fullWidth
                              variant="contained"
                              startIcon={<CheckIcon />}
                              onClick={() => handleAcceptRequest(normalized.id)}
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
                              onClick={() => handleDeclineRequest(normalized.id)}
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

          {/* Tab 1: Friend Suggestions */}
          {tabValue === 1 && (
            <Box>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
              <Grid container spacing={2.5}>
                {suggestions.map((suggestion) => {
                  const normalized = normalizeFriendData(suggestion);
                  return (
                  <Grid item xs={12} sm={6} md={4} key={normalized.id}>
                    <Card
                      elevation={0}
                      sx={(t) => ({
                        borderRadius: 4,
                        p: 2.5,
                        boxShadow: t.shadows[1],
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.paper",
                        position: "relative",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          boxShadow: t.shadows[4],
                          transform: "translateY(-4px)",
                        },
                      })}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveSuggestion(normalized.id)}
                        sx={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          bgcolor: "background.default",
                          "&:hover": { bgcolor: "action.hover" },
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>

                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <Avatar
                          src={normalized.avatar}
                          sx={{
                            width: 96,
                            height: 96,
                            mb: 2,
                            border: "3px solid",
                            borderColor: "divider",
                          }}
                        >
                          {normalized.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="h6" fontWeight={700} mb={0.5} textAlign="center">
                          {normalized.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={1}>
                          {normalized.mutualFriends} bạn chung
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          mb={2}
                          textAlign="center"
                          sx={{ minHeight: 32 }}
                        >
                          {suggestion.reason || ''}
                        </Typography>

                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<PersonAddIcon />}
                          onClick={() => handleAddFriend(normalized.id)}
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
                          Thêm bạn bè
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

          {/* Tab 2: All Friends */}
          {tabValue === 2 && (
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
                      sx={(t) => ({
                        borderRadius: 4,
                        p: 2.5,
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
                      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <Avatar
                          src={normalized.avatar}
                          sx={{
                            width: 64,
                            height: 64,
                            mr: 2,
                            border: "2px solid",
                            borderColor: "divider",
                          }}
                        >
                          {normalized.name.charAt(0).toUpperCase()}
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
                          onClick={() => handleUnfriend(normalized.id)}
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

              {filteredFriends.length === 0 && (
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
                  <SearchIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Không tìm thấy bạn bè nào
                  </Typography>
                </Card>
              )}
            </Box>
          )}

          {/* Tab 3: Sent Requests */}
          {tabValue === 3 && (
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

          {/* Tab 4: Search Friends */}
          {tabValue === 4 && (
            <Box>
              <Card
                elevation={0}
                sx={(t) => ({
                  borderRadius: 4,
                  p: 2.5,
                  mb: 3,
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
                    // Normalize user data from search results
                    const userId = user.id || user.userId;
                    const userName = user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user.username || user.name || 'Unknown';
                    const userAvatar = user.avatar || null;
                    const friendshipStatus = user.friendshipStatus || user.status || 'NONE'; // NONE, PENDING, ACCEPTED, REQUEST_SENT
                    
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
                            // Prevent navigation if clicking on button
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
                                  e.stopPropagation(); // Prevent card click
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
    </Scene>
  );
}