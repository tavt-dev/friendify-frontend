import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Typography,
  Avatar,
  Button,
  Tabs,
  Tab,
  Grid,
  Paper,
  IconButton,
  Divider,
  Chip,
  Stack,
  TextField,
  Snackbar,
  Alert,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EditIcon from "@mui/icons-material/Edit";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from "@mui/icons-material/Work";
import CakeIcon from "@mui/icons-material/Cake";
import PhoneIcon from "@mui/icons-material/Phone";
import LanguageIcon from "@mui/icons-material/Language";
import BusinessIcon from "@mui/icons-material/Business";
import SchoolIcon from "@mui/icons-material/School";
import FavoriteIcon from "@mui/icons-material/Favorite";
import BlockIcon from "@mui/icons-material/Block";
import ReportIcon from "@mui/icons-material/Report";
import ShareIcon from "@mui/icons-material/Share";
import {
  uploadAvatar,
  uploadBackground,
  updateProfile,
  getUserProfileById,
  getMyInfo,
} from "../services/userService";
import { isAuthenticated, logOut } from "../services/identityService";
import { useUser } from "../contexts/UserContext";
import { getMyPosts, getUserPosts, updatePost, deletePost } from "../services/postService";
import { sharePost } from "../services/postInteractionService";
import {
  getSocialInfo,
  addFriend,
  removeFriend,
  followUser,
  unfollowUser,
  getAllFriends,
  blockUser,
} from "../services/friendService";
import { extractArrayFromResponse } from "../utils/apiHelper";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import CheckIcon from "@mui/icons-material/Check";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import { getApiUrl, API_ENDPOINTS } from "../config/apiConfig";
import { getToken } from "../services/localStorageService";
import Post from "../components/Post";
import PageLayout from "./PageLayout";
import CreatePostButton from "../components/CreatePostButton";

export default function ProfileEnhancedPage() {
  const navigate = useNavigate();
  const { id: profileUserId } = useParams(); // Get userId from route params
  const { user: currentUser, loadUser } = useUser();
  const [userDetails, setUserDetails] = useState(null); // Profile data to display (can be different user)
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [uploading, setUploading] = useState(false);
  const [editingAbout, setEditingAbout] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [coverHover, setCoverHover] = useState(false);
  const [avatarHover, setAvatarHover] = useState(false);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsPage, setPostsPage] = useState(1);
  const [postsTotalPages, setPostsTotalPages] = useState(0);
  const [postsInitialized, setPostsInitialized] = useState(false);
  // Local state for editing profile
  const [editProfileData, setEditProfileData] = useState(null);
  // Social relationship state
  const [socialInfo, setSocialInfo] = useState(null);
  const [friendsList, setFriendsList] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const lastPostElementRef = useRef(null);
  const postsObserver = useRef(null);

  // Initialize editProfileData when entering edit mode
  useEffect(() => {
    if (editingAbout && userDetails && !editProfileData) {
      // Format dob to YYYY-MM-DD if it exists
      let formattedDob = null;
      if (userDetails.dob) {
        if (typeof userDetails.dob === 'string') {
          // If it's a string, extract date part (remove time if present)
          formattedDob = userDetails.dob.includes('T') ? userDetails.dob.split('T')[0] : userDetails.dob;
        } else if (userDetails.dob instanceof Date) {
          // If it's a Date object, format it
          formattedDob = userDetails.dob.toISOString().split('T')[0];
        }
      }
      
      setEditProfileData({
        bio: userDetails.bio || "",
        city: userDetails.city || "",
        country: userDetails.country || "",
        dob: formattedDob,
        phoneNumber: userDetails.phoneNumber || userDetails.phone || "",
        gender: userDetails.gender || "",
        website: userDetails.website || "",
        firstName: userDetails.firstName || "",
        lastName: userDetails.lastName || "",
      });
    }
    if (!editingAbout) {
      setEditProfileData(null);
    }
  }, [editingAbout, userDetails, editProfileData]);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    const loadProfile = async () => {
      setLoadingProfile(true);
      setUserDetails(null);
      
      try {
        if (profileUserId) {
          const targetUserId = String(profileUserId).trim();
          
          if (!targetUserId || targetUserId === 'undefined' || targetUserId === 'null') {
            console.error('Invalid profileUserId:', profileUserId);
            setSnackbar({ open: true, message: "ID người dùng không hợp lệ", severity: "error" });
            setLoadingProfile(false);
            return;
          }
          
          console.log('Loading profile for userId:', targetUserId);
          const response = await getUserProfileById(targetUserId, false);
          
          if (!response || response.status === 404 || response.data === null) {
            console.warn('Profile not found for userId:', targetUserId);
            setSnackbar({ open: true, message: "Không tìm thấy người dùng này", severity: "error" });
            setUserDetails(null);
            setLoadingProfile(false);
            return;
          }
          
          let profileData = null;
          if (response?.data) {
            profileData = response.data.result || response.data.data || response.data;
          } else if (response?.result) {
            profileData = response.result;
          } else if (response && typeof response === 'object' && !response.status) {
            profileData = response;
          }
          
          if (profileData && typeof profileData === 'object' && Object.keys(profileData).length > 0) {
            console.log('Profile loaded successfully:', profileData.id || profileData.userId, profileData.username);
            setUserDetails(profileData);
          } else {
            console.warn('Profile data not found or invalid format');
            setSnackbar({ open: true, message: "Không thể tải thông tin người dùng", severity: "error" });
            setUserDetails(null);
          }
        } else {
          // No userId in route, load my own profile from API
          console.log('Loading my profile from API');
          try {
            const response = await getMyInfo();
            console.log('getMyInfo response:', response);
            
            // Parse response - handle different response formats
            let profileData = null;
            if (response?.data) {
              profileData = response.data.result || response.data.data || response.data;
            } else if (response?.result) {
              profileData = response.result;
            } else if (response && typeof response === 'object' && !response.status && !response.data) {
              profileData = response;
            }
            
            console.log('Parsed profileData:', profileData);
            
            if (profileData && typeof profileData === 'object' && Object.keys(profileData).length > 0) {
              console.log('My profile loaded:', profileData.id || profileData.userId, profileData.username);
              // Merge with currentUser context if available for complete info
              if (currentUser) {
                setUserDetails({
                  ...profileData,
                  // Ensure we have all fields from both sources
                  id: profileData.id || profileData.userId || currentUser.id || currentUser.userId,
                  userId: profileData.userId || profileData.id || currentUser.userId || currentUser.id,
                  username: profileData.username || currentUser.username,
                  email: profileData.email || currentUser.email,
                  firstName: profileData.firstName || currentUser.firstName,
                  lastName: profileData.lastName || currentUser.lastName,
                  avatar: profileData.avatar || currentUser.avatar,
                  backgroundImage: profileData.backgroundImage || profileData.coverImage || currentUser.backgroundImage,
                  coverImage: profileData.coverImage || profileData.backgroundImage || currentUser.coverImage,
                });
              } else {
                setUserDetails(profileData);
              }
            } else {
              console.warn('My profile data not found or invalid format, using currentUser fallback');
              // Fallback to currentUser from context if available
              if (currentUser) {
                console.log('Using currentUser as profile data');
                setUserDetails(currentUser);
              } else {
                console.error('No profile data and no currentUser available');
                setUserDetails(null);
              }
            }
          } catch (profileError) {
            console.error('Error in getMyInfo:', profileError);
            // If getMyInfo fails, use currentUser as fallback
            if (currentUser) {
              console.log('Using currentUser as fallback after error');
              setUserDetails(currentUser);
            } else {
              setUserDetails(null);
            }
            throw profileError; // Re-throw to be caught by outer catch
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        const errorData = error?.response?.data || {};
        const errorMessage = errorData.message || errorData.error || error?.message || "Không thể tải thông tin người dùng";
        
        if (error?.response?.status === 404) {
          setSnackbar({ open: true, message: "Không tìm thấy người dùng này", severity: "error" });
        } else if (error?.response?.status === 403) {
          setSnackbar({ open: true, message: "Bạn không có quyền xem trang này", severity: "error" });
        } else {
          setSnackbar({ open: true, message: errorMessage, severity: "error" });
        }
        
        if (!profileUserId && currentUser) {
          console.log('Using currentUser from context as fallback');
          setUserDetails(currentUser);
        } else {
          setUserDetails(null);
        }
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [profileUserId, navigate, currentUser, loadUser]);

  // Load social info and friends when profile is loaded
  useEffect(() => {
    const isOwnProfile = !profileUserId || (currentUser && (String(profileUserId) === String(currentUser.id) || String(profileUserId) === String(currentUser.userId)));
    if (userDetails && profileUserId && !isOwnProfile) {
      loadSocialInfo();
      loadFriends();
    }
  }, [userDetails, profileUserId, currentUser]);

  const loadSocialInfo = async () => {
    if (!profileUserId) return;
    try {
      const response = await getSocialInfo(profileUserId);
      console.log('Social info response:', response);
      const info = response?.data?.result || response?.data;
      console.log('Parsed social info:', info);
      setSocialInfo(info);
    } catch (error) {
      console.error('Error loading social info:', error);
      console.error('Error details:', error.response);
      // Set default values if error
      setSocialInfo({
        isFriend: false,
        isFollowing: false,
        hasSentFriendRequest: false,
        hasReceivedFriendRequest: false,
      });
    }
  };

  const loadFriends = async () => {
    if (!profileUserId) return;
    setLoadingFriends(true);
    try {
      // Try to get friends of the profile user
      const response = await getAllFriends(profileUserId, 1, 9); // Load 9 friends for grid
      const { items } = extractArrayFromResponse(response.data);
      setFriendsList(items || []);
    } catch (error) {
      console.error('Error loading friends:', error);
      // If error, try without userId (current user's friends)
      try {
        const response = await getAllFriends(null, 1, 9);
        const { items } = extractArrayFromResponse(response.data);
        setFriendsList(items || []);
      } catch (err) {
        setFriendsList([]);
      }
    } finally {
      setLoadingFriends(false);
    }
  };

  const handleAvatarClick = () => avatarInputRef.current?.click();
  const handleCoverClick = () => coverInputRef.current?.click();

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      setSnackbar({ open: true, message: "Vui lòng chọn file ảnh", severity: "error" });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      const response = await uploadAvatar(formData);
      
      // Reload user context
      await loadUser();
      
      // Update userDetails with new avatar
      let updatedProfile = null;
      if (response?.data) {
        updatedProfile = response.data.result || response.data.data || response.data;
      } else if (response?.result) {
        updatedProfile = response.result;
      }
      
      if (updatedProfile && typeof updatedProfile === 'object') {
        setUserDetails(prev => ({
          ...prev,
          avatar: updatedProfile.avatar || prev?.avatar,
        }));
      } else {
        // Reload profile to get updated avatar
        const reloadResponse = await getMyInfo();
        let reloadedProfile = null;
        if (reloadResponse?.data) {
          reloadedProfile = reloadResponse.data.result || reloadResponse.data.data || reloadResponse.data;
        } else if (reloadResponse?.result) {
          reloadedProfile = reloadResponse.result;
        }
        if (reloadedProfile && typeof reloadedProfile === 'object') {
          setUserDetails(prev => ({
            ...prev,
            ...reloadedProfile,
          }));
        }
      }
      
      setSnackbar({ open: true, message: "Đã cập nhật avatar thành công!", severity: "success" });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      const errorMessage = error?.response?.data?.message || error?.message || "Không thể tải avatar. Vui lòng thử lại.";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    } finally {
      setUploading(false);
    }
  };

  const handleCoverUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      setSnackbar({ open: true, message: "Vui lòng chọn file ảnh", severity: "error" });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setSnackbar({ open: true, message: "File quá lớn. Vui lòng chọn file nhỏ hơn 10MB", severity: "error" });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await uploadBackground(formData);
      
      // Reload user context
      await loadUser();
      
      // Update userDetails with new background
      let updatedProfile = null;
      if (response?.data) {
        updatedProfile = response.data.result || response.data.data || response.data;
      } else if (response?.result) {
        updatedProfile = response.result;
      }
      
      if (updatedProfile && typeof updatedProfile === 'object') {
        setUserDetails(prev => ({
          ...prev,
          backgroundImage: updatedProfile.backgroundImage || updatedProfile.coverImage || prev?.backgroundImage,
          coverImage: updatedProfile.coverImage || updatedProfile.backgroundImage || prev?.coverImage,
        }));
      } else {
        // Reload profile to get updated background
        const reloadResponse = await getMyInfo();
        let reloadedProfile = null;
        if (reloadResponse?.data) {
          reloadedProfile = reloadResponse.data.result || reloadResponse.data.data || reloadResponse.data;
        } else if (reloadResponse?.result) {
          reloadedProfile = reloadResponse.result;
        }
        if (reloadedProfile && typeof reloadedProfile === 'object') {
          setUserDetails(prev => ({
            ...prev,
            ...reloadedProfile,
            backgroundImage: reloadedProfile.backgroundImage || reloadedProfile.coverImage || prev?.backgroundImage,
            coverImage: reloadedProfile.coverImage || reloadedProfile.backgroundImage || prev?.coverImage,
          }));
        }
      }
      
      setSnackbar({ open: true, message: "Đã cập nhật ảnh bìa thành công!", severity: "success" });
    } catch (error) {
      console.error('Error uploading background:', error);
      let errorMessage = "Không thể tải ảnh bìa. Vui lòng thử lại.";
      if (error.response?.status === 401) {
        errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    } finally {
      setUploading(false);
    }
  };

  const loadMyPosts = useCallback(async (page = 1) => {
    if (postsLoading) {
      return;
    }
    
    setPostsLoading(true);
    try {
      let targetUserId = null;
      let isCurrentUser = false;
      
      if (profileUserId) {
        targetUserId = String(profileUserId).trim();
        const currentUserId = currentUser?.id || currentUser?.userId;
        isCurrentUser = currentUserId && String(targetUserId) === String(currentUserId);
      } else {
        targetUserId = currentUser?.id || currentUser?.userId;
        isCurrentUser = true;
      }
      
      if (!targetUserId) {
        console.warn('No targetUserId available for loading posts');
        setPostsLoading(false);
        return;
      }
      
      console.log('Loading posts - profileUserId:', profileUserId, 'targetUserId:', targetUserId, 'isCurrentUser:', isCurrentUser);
      
      const response = isCurrentUser
        ? await getMyPosts(page, 10)
        : await getUserPosts(targetUserId, page, 10);
      
      console.log('Posts response:', response?.data?.result?.data?.length || 0, 'posts');
      
      // Handle different response formats
      let pageData = null;
      let newPosts = [];
      
      if (response.data?.result) {
        pageData = response.data.result;
        // Try different formats
        if (pageData.data && Array.isArray(pageData.data)) {
          newPosts = pageData.data;
        } else if (pageData.content && Array.isArray(pageData.content)) {
          newPosts = pageData.content;
        }
        setPostsTotalPages(pageData.totalPages || 1);
      }
      
      if (newPosts.length > 0) {
        // Use userDetails (the profile being viewed) for avatar and name
        const targetUser = userDetails || currentUser;
        const userAvatar = targetUser?.avatar || null;
        
        // Map posts to format expected by Post component
        const mappedPosts = newPosts.map((post) => {
          // Map imageUrls to media format for MediaCarousel
          const media = (post.imageUrls || []).map((url) => ({
            url: url,
            type: 'image',
            alt: `Post image ${post.id}`,
          }));
          
          // Get userId from multiple possible sources
          const postUserId = post.userId || post.user?.id || post.user?.userId || userDetails?.id;
          
          // Format created date
          let created = 'Just now';
          if (post.createdDate) {
            const date = new Date(post.createdDate);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);
            
            if (diffMins < 1) {
              created = 'Vừa xong';
            } else if (diffMins < 60) {
              created = `${diffMins} phút trước`;
            } else if (diffHours < 24) {
              created = `${diffHours} giờ trước`;
            } else if (diffDays < 7) {
              created = `${diffDays} ngày trước`;
            } else {
              created = date.toLocaleDateString('vi-VN');
            }
          } else if (post.created) {
            created = post.created;
          }
          
          // Get display name from post response (backend already formats it)
          // Or use targetUser's name if available
          const displayName = post.username || 
            (targetUser?.firstName && targetUser?.lastName
              ? `${targetUser.lastName} ${targetUser.firstName}`.trim()
              : targetUser?.firstName || targetUser?.lastName || targetUser?.username || 'Unknown');
          
          return {
            id: post.id,
            avatar: post.userAvatar || userAvatar || post.avatar || null,
            username: post.username || targetUser?.username || 'Unknown',
            firstName: targetUser?.firstName || post.firstName || '',
            lastName: targetUser?.lastName || post.lastName || '',
            displayName: displayName,
            created: created,
            content: post.content || '',
            media: media,
            userId: postUserId,
            privacy: post.privacy || 'PUBLIC',
            likeCount: post.likeCount || 0,
            commentCount: post.commentCount || 0,
            isLiked: post.isLiked || false,
            ...post,
          };
        });
        
        setPosts((prev) => {
          if (page === 1) {
            return mappedPosts;
          }
          // Filter out duplicates
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNewPosts = mappedPosts.filter(p => !existingIds.has(p.id));
          return [...prev, ...uniqueNewPosts];
        });
        
        // Update current page only if we got new posts
        if (mappedPosts.length > 0) {
          setPostsPage(page);
        }
        setPostsInitialized(true);
      } else if (page === 1) {
        setPosts([]);
        setPostsPage(1);
        setPostsTotalPages(0);
        setPostsInitialized(true);
      } else {
        // No more posts, update total pages to prevent further loading
        if (postsTotalPages > page - 1) {
          setPostsTotalPages(page - 1);
        }
        setPostsInitialized(true);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      setSnackbar({ open: true, message: "Không thể tải bài viết. Vui lòng thử lại.", severity: "error" });
      // Mark as initialized to prevent continuous loading on error
      if (page === 1) {
        setPostsInitialized(true);
        setPostsTotalPages(0);
      }
    } finally {
      setPostsLoading(false);
    }
  }, [profileUserId, currentUser, postsLoading]);

  const lastProfileUserIdRef = useRef(null);
  
  useEffect(() => {
    const targetUserId = profileUserId || userDetails?.id;
    
    if (!targetUserId) {
      return;
    }
    
    if (profileUserId !== lastProfileUserIdRef.current) {
      lastProfileUserIdRef.current = profileUserId;
      setPosts([]);
      setPostsPage(1);
      setPostsTotalPages(0);
      setPostsInitialized(false);
    }
    
    // Only load if not loading, not initialized, and no posts
    if (!postsLoading && !postsInitialized && posts.length === 0) {
      loadMyPosts(1);
    }
  }, [profileUserId, userDetails?.id, postsLoading, posts.length, postsInitialized, loadMyPosts]);

  // Infinite scroll for posts
  useEffect(() => {
    // Disconnect if loading, no more pages, or no posts
    if (postsLoading || postsPage >= postsTotalPages || postsTotalPages === 0 || posts.length === 0 || !postsInitialized) {
      if (postsObserver.current) {
        postsObserver.current.disconnect();
      }
      return;
    }

    // Disconnect existing observer
    if (postsObserver.current) {
      postsObserver.current.disconnect();
    }

    // Create new observer with proper configuration
    postsObserver.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !postsLoading && postsPage < postsTotalPages && postsInitialized) {
        const nextPage = postsPage + 1;
        setPostsPage(nextPage);
        loadMyPosts(nextPage);
      }
    }, {
      threshold: 0.1,
      rootMargin: '100px'
    });

    // Observe last post element
    const currentLastPost = lastPostElementRef.current;
    if (currentLastPost) {
      postsObserver.current.observe(currentLastPost);
    }

    return () => {
      if (postsObserver.current) {
        postsObserver.current.disconnect();
      }
    };
  }, [posts.length, postsLoading, postsPage, postsTotalPages, postsInitialized, loadMyPosts]);

  const handleSaveAbout = async () => {
    if (!editProfileData) return;
    
    try {
      // Prepare data according to backend UpdateProfileRequest format
      const updateData = {
        bio: editProfileData.bio || null,
        city: editProfileData.city || null,
        country: editProfileData.country || null,
        dob: editProfileData.dob || null,
        phoneNumber: editProfileData.phoneNumber || null,
        gender: editProfileData.gender || null,
        website: editProfileData.website || null,
        firstName: editProfileData.firstName || null,
        lastName: editProfileData.lastName || null,
      };
      
      // Remove null/empty values to avoid sending unnecessary data
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === null || updateData[key] === "") {
          delete updateData[key];
        }
      });
      
      const response = await updateProfile(updateData);
      
      // Reload user context first
      await loadUser();
      
      // Then reload profile to get updated data
      // Parse updated profile from response
      let updatedProfile = null;
      if (response?.data) {
        updatedProfile = response.data.result || response.data.data || response.data;
      } else if (response?.result) {
        updatedProfile = response.result;
      }
      
      // Update userDetails with new data
      if (updatedProfile && typeof updatedProfile === 'object') {
        setUserDetails(prev => ({
          ...prev,
          ...updatedProfile,
          // Ensure all fields are updated
          bio: updatedProfile.bio !== undefined ? updatedProfile.bio : prev?.bio,
          city: updatedProfile.city !== undefined ? updatedProfile.city : prev?.city,
          country: updatedProfile.country !== undefined ? updatedProfile.country : prev?.country,
          dob: updatedProfile.dob !== undefined ? updatedProfile.dob : prev?.dob,
          phoneNumber: updatedProfile.phoneNumber !== undefined ? updatedProfile.phoneNumber : prev?.phoneNumber,
          phone: updatedProfile.phoneNumber || updatedProfile.phone || prev?.phone,
          gender: updatedProfile.gender !== undefined ? updatedProfile.gender : prev?.gender,
          website: updatedProfile.website !== undefined ? updatedProfile.website : prev?.website,
          firstName: updatedProfile.firstName !== undefined ? updatedProfile.firstName : prev?.firstName,
          lastName: updatedProfile.lastName !== undefined ? updatedProfile.lastName : prev?.lastName,
        }));
      } else {
        // If response doesn't have updated data, reload profile
        // Trigger reload by calling loadProfile logic
        const reloadResponse = await getMyInfo();
        let reloadedProfile = null;
        if (reloadResponse?.data) {
          reloadedProfile = reloadResponse.data.result || reloadResponse.data.data || reloadResponse.data;
        } else if (reloadResponse?.result) {
          reloadedProfile = reloadResponse.result;
        }
        if (reloadedProfile && typeof reloadedProfile === 'object') {
          setUserDetails(reloadedProfile);
        }
      }
      
      setEditingAbout(false);
      setEditProfileData(null);
      setSnackbar({ open: true, message: "Cập nhật thông tin thành công!", severity: "success" });
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error?.response?.data?.message || error?.message || "Không thể cập nhật thông tin. Vui lòng thử lại.";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    }
  };

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  // Social action handlers
  const handleAddFriend = async () => {
    if (!profileUserId) return;
    setActionLoading(true);
    try {
      console.log('Adding friend:', profileUserId);
      const response = await addFriend(profileUserId);
      console.log('Add friend response:', response);
      setSnackbar({ open: true, message: "Đã gửi lời mời kết bạn!", severity: "success" });
      // Reload social info after a short delay to ensure backend has processed
      setTimeout(async () => {
        await loadSocialInfo();
      }, 500);
    } catch (error) {
      console.error('Error adding friend:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "Không thể gửi lời mời";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnfriend = async () => {
    if (!profileUserId) return;
    setActionLoading(true);
    try {
      await removeFriend(profileUserId);
      setSnackbar({ open: true, message: "Đã hủy kết bạn!", severity: "warning" });
      await loadSocialInfo();
      await loadFriends();
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || "Không thể hủy kết bạn", severity: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!profileUserId) return;
    setActionLoading(true);
    try {
      console.log('Following user:', profileUserId);
      const response = await followUser(profileUserId);
      console.log('Follow response:', response);
      setSnackbar({ open: true, message: "Đã theo dõi!", severity: "success" });
      // Reload social info after a short delay to ensure backend has processed
      setTimeout(async () => {
        await loadSocialInfo();
      }, 500);
    } catch (error) {
      console.error('Error following user:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "Không thể theo dõi";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!profileUserId) return;
    setActionLoading(true);
    try {
      await unfollowUser(profileUserId);
      setSnackbar({ open: true, message: "Đã hủy theo dõi!", severity: "info" });
      await loadSocialInfo();
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || "Không thể hủy theo dõi", severity: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptFriend = async () => {
    if (!profileUserId) return;
    setActionLoading(true);
    try {
      const { acceptFriendRequest } = await import("../services/friendService");
      await acceptFriendRequest(profileUserId);
      setSnackbar({ open: true, message: "Đã chấp nhận lời mời kết bạn!", severity: "success" });
      await loadSocialInfo();
      await loadFriends();
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || "Không thể chấp nhận", severity: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineFriend = async () => {
    if (!profileUserId) return;
    setActionLoading(true);
    try {
      const { declineFriendRequest } = await import("../services/friendService");
      await declineFriendRequest(profileUserId);
      setSnackbar({ open: true, message: "Đã từ chối lời mời!", severity: "info" });
      await loadSocialInfo();
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || "Không thể từ chối", severity: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelFriendRequest = async () => {
    if (!profileUserId) return;
    setActionLoading(true);
    try {
      const { cancelFriendRequest } = await import("../services/friendService");
      await cancelFriendRequest(profileUserId);
      setSnackbar({ open: true, message: "Đã hủy lời mời kết bạn!", severity: "info" });
      await loadSocialInfo();
    } catch (error) {
      console.error('Error canceling friend request:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "Không thể hủy lời mời";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const getBioPreview = (bio) => {
    const lines = bio.split('\n');
    if (lines.length <= 2 && bio.length <= 120) return bio;
    
    const preview = lines.slice(0, 2).join('\n');
    return preview.length > 120 ? preview.substring(0, 120) + '...' : preview;
  };

  const shouldShowSeeMore = (bio) => {
    const lines = bio.split('\n');
    return lines.length > 2 || bio.length > 120;
  };

  if (!userDetails) {
    return (
      <PageLayout>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress size={50} />
        </Box>
      </PageLayout>
    );
  }

  const isOwnProfile = !profileUserId || (currentUser && (String(profileUserId) === String(currentUser.id) || String(profileUserId) === String(currentUser.userId)));

  const handlePostCreated = (formattedPost) => {
    setPosts((prev) => {
      const exists = prev.some(p => p.id === formattedPost.id);
      if (exists) return prev;
      return [formattedPost, ...prev];
    });
    setSnackbar({ open: true, message: "Đã tạo bài viết thành công!", severity: "success" });
  };

  return (
    <PageLayout>
      <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto", pb: 4, pt: { xs: 0, sm: 2 }, pl: 0, pr: 2 }}>
        {/* Cover Photo Section */}
        <Paper
          elevation={0}
          sx={(t) => ({
            position: "relative",
            height: { xs: 300, sm: 400, md: 450 },
            borderRadius: { xs: 0, sm: "24px 24px 0 0" },
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
            borderBottom: "none",
            boxShadow: t.palette.mode === "dark"
              ? "0 12px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)"
              : "0 12px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            background: t.palette.mode === "dark"
              ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            "&:hover": {
              boxShadow: t.palette.mode === "dark"
                ? "0 16px 56px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08)"
                : "0 16px 56px rgba(102, 126, 234, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.08)",
            },
          })}
          onMouseEnter={() => setCoverHover(true)}
          onMouseLeave={() => setCoverHover(false)}
        >
          <Box
            component="img"
            src={userDetails?.coverImage || userDetails?.backgroundImage || "https://picsum.photos/1200/400?random=10"}
            alt="Cover"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), filter 0.6s ease",
              transform: coverHover ? "scale(1.08)" : "scale(1)",
              filter: coverHover ? "brightness(1.1)" : "brightness(1)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.6) 100%)",
            }}
          />
          {isOwnProfile && (
            <Tooltip title="Thay đổi ảnh bìa" arrow>
              <IconButton
                onClick={handleCoverClick}
                disabled={uploading}
                sx={{
                  position: "absolute",
                  bottom: 24,
                  right: 24,
                  bgcolor: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(12px)",
                  opacity: coverHover ? 1 : 0,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": { 
                    bgcolor: "white",
                    transform: "scale(1.15) rotate(5deg)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                  },
                  boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                  width: 48,
                  height: 48,
                }}
              >
                <PhotoCameraIcon sx={{ fontSize: 24 }} />
              </IconButton>
            </Tooltip>
          )}
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleCoverUpload}
          />
        </Paper>

        {/* Profile Info Section */}
        <Paper
          elevation={0}
          sx={(t) => ({
            borderRadius: { xs: 0, sm: "0 0 24px 24px" },
            border: "1px solid",
            borderColor: "divider",
            borderTop: "none",
            p: { xs: 2.5, sm: 3.5, md: 4.5 },
            mb: 3,
            bgcolor: "background.paper",
            boxShadow: t.palette.mode === "dark"
              ? "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)"
              : "0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05)",
            backgroundImage: t.palette.mode === "dark"
              ? "linear-gradient(135deg, rgba(139, 154, 255, 0.03) 0%, rgba(151, 117, 212, 0.03) 100%)"
              : "linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%)",
            transition: "all 0.3s ease",
          })}
        >
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: { xs: 2, md: 4 }, alignItems: { xs: "center", md: "flex-start" } }}>
            {/* Avatar Section */}
            <Box 
              sx={{ 
                position: "relative", 
                mt: { xs: -16, md: -12 },
                alignSelf: { xs: "center", md: "flex-start" },
                zIndex: 1,
              }}
              onMouseEnter={() => setAvatarHover(true)}
              onMouseLeave={() => setAvatarHover(false)}
            >
              <Avatar
                src={userDetails?.avatar}
                sx={(t) => ({
                  width: { xs: 160, sm: 180, md: 200 },
                  height: { xs: 160, sm: 180, md: 200 },
                  border: "8px solid",
                  borderColor: "background.paper",
                  bgcolor: t.palette.mode === "dark"
                    ? "linear-gradient(135deg, #8b9aff 0%, #9775d4 100%)"
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  fontSize: { xs: 64, sm: 72, md: 80 },
                  cursor: isOwnProfile ? "pointer" : "default",
                  transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: t.palette.mode === "dark"
                    ? "0 12px 40px rgba(139, 154, 255, 0.5), 0 6px 20px rgba(0, 0, 0, 0.6), inset 0 0 0 1px rgba(255, 255, 255, 0.1)"
                    : "0 12px 40px rgba(102, 126, 234, 0.4), 0 6px 20px rgba(0, 0, 0, 0.2)",
                  "&:hover": isOwnProfile ? {
                    transform: "scale(1.08) rotate(5deg)",
                    boxShadow: t.palette.mode === "dark"
                      ? "0 16px 56px rgba(139, 154, 255, 0.6), 0 8px 28px rgba(0, 0, 0, 0.7), inset 0 0 0 1px rgba(255, 255, 255, 0.15)"
                      : "0 16px 56px rgba(102, 126, 234, 0.5), 0 8px 28px rgba(0, 0, 0, 0.25)",
                  } : {},
                })}
                onClick={isOwnProfile ? handleAvatarClick : undefined}
              >
                {(() => {
                  if (userDetails?.lastName && userDetails?.firstName) {
                    return `${userDetails.lastName[0] || ''}${userDetails.firstName[0] || ''}`.toUpperCase();
                  }
                  if (userDetails?.firstName) {
                    return userDetails.firstName[0]?.toUpperCase() || '';
                  }
                  if (userDetails?.lastName) {
                    return userDetails.lastName[0]?.toUpperCase() || '';
                  }
                  return userDetails?.username?.[0]?.toUpperCase() || userDetails?.email?.[0]?.toUpperCase() || 'U';
                })()}
              </Avatar>
              {isOwnProfile && (
                <>
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      bgcolor: "rgba(0, 0, 0, 0.6)",
                      backdropFilter: "blur(4px)",
                      opacity: avatarHover ? 1 : 0,
                      transition: "opacity 0.3s ease",
                      cursor: "pointer",
                    }}
                    onClick={handleAvatarClick}
                  >
                    <PhotoCameraIcon sx={{ color: "white", fontSize: 48 }} />
                  </Box>
                  {uploading && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                        bgcolor: "rgba(0, 0, 0, 0.7)",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      <CircularProgress size={56} sx={{ color: "white" }} />
                    </Box>
                  )}
                </>
              )}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAvatarUpload}
              />
            </Box>

            {/* User Info Section */}
            <Box sx={{ flex: 1, textAlign: { xs: "center", md: "left" }, width: "100%", mt: { xs: 2, md: 0 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, justifyContent: { xs: "center", md: "flex-start" }, flexWrap: "wrap", mb: 1.5 }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 800, 
                    fontSize: { xs: 30, sm: 36, md: 42 },
                    background: (t) => t.palette.mode === "dark"
                      ? "linear-gradient(135deg, #8b9aff 0%, #9775d4 100%)"
                      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    lineHeight: 1.1,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {(() => {
                    if (userDetails?.lastName && userDetails?.firstName) {
                      return `${userDetails.lastName} ${userDetails.firstName}`.trim();
                    }
                    if (userDetails?.firstName) {
                      return userDetails.firstName;
                    }
                    if (userDetails?.lastName) {
                      return userDetails.lastName;
                    }
                    return userDetails?.username || userDetails?.email || "User";
                  })()}
                </Typography>
              </Box>
              
              {/* Username */}
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                  mb: 2, 
                  fontSize: 16,
                  fontWeight: 600,
                  opacity: 0.8,
                }}
              >
                @{userDetails?.username || userDetails?.email || "user"}
              </Typography>

              {/* Action Buttons - Only show if not own profile */}
              {!isOwnProfile && (
                <Stack 
                  direction="row" 
                  spacing={1.5} 
                  sx={{ 
                    mb: 2.5,
                    justifyContent: { xs: "center", md: "flex-start" },
                    flexWrap: "wrap",
                  }}
                >
                  {(() => {
                    // Debug log
                    console.log('Social info:', socialInfo);
                    const isFriend = socialInfo?.isFriend || socialInfo?.friend || false;
                    const isFollowing = socialInfo?.isFollowing || socialInfo?.following || false;
                    const hasSentRequest = socialInfo?.hasSentFriendRequest || socialInfo?.sentRequest || false;
                    const hasReceivedRequest = socialInfo?.hasReceivedFriendRequest || socialInfo?.receivedRequest || false;
                    console.log('Relationship status:', { isFriend, isFollowing, hasSentRequest, hasReceivedRequest });

                    if (isFriend) {
                      return (
                        <>
                          <Chip
                            icon={<PeopleIcon />}
                            label="Bạn bè"
                            color="success"
                            sx={{
                              height: 40,
                              px: 2,
                              fontWeight: 600,
                              fontSize: 14,
                              "& .MuiChip-icon": {
                                color: "success.main",
                              },
                            }}
                          />
                          <Button
                            variant="outlined"
                            startIcon={<PersonRemoveIcon />}
                            onClick={handleUnfriend}
                            disabled={actionLoading}
                            sx={{
                              textTransform: "none",
                              fontWeight: 600,
                              borderRadius: 2.5,
                              px: 3,
                              py: 1.2,
                              borderColor: "divider",
                              "&:hover": {
                                borderColor: "error.main",
                                color: "error.main",
                                bgcolor: "rgba(211, 47, 47, 0.04)",
                              },
                            }}
                          >
                            Hủy kết bạn
                          </Button>
                          {!isFollowing && (
                            <Button
                              variant="outlined"
                              startIcon={<PersonAddIcon />}
                              onClick={handleFollow}
                              disabled={actionLoading}
                              sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                borderRadius: 2.5,
                                px: 3,
                                py: 1.2,
                                borderColor: "divider",
                                "&:hover": {
                                  borderColor: "primary.main",
                                  bgcolor: "rgba(102, 126, 234, 0.04)",
                                },
                              }}
                            >
                              Theo dõi
                            </Button>
                          )}
                          {isFollowing && (
                            <Button
                              variant="outlined"
                              onClick={handleUnfollow}
                              disabled={actionLoading}
                              sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                borderRadius: 2.5,
                                px: 3,
                                py: 1.2,
                                borderColor: "divider",
                                "&:hover": {
                                  borderColor: "error.main",
                                  color: "error.main",
                                  bgcolor: "rgba(211, 47, 47, 0.04)",
                                },
                              }}
                            >
                              Đang theo dõi
                            </Button>
                          )}
                        </>
                      );
                    } else if (hasReceivedRequest) {
                      return (
                        <>
                          <Button
                            variant="contained"
                            startIcon={<CheckIcon />}
                            onClick={handleAcceptFriend}
                            disabled={actionLoading}
                            sx={{
                              textTransform: "none",
                              fontWeight: 600,
                              borderRadius: 2.5,
                              px: 3,
                              py: 1.2,
                              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              "&:hover": {
                                background: "linear-gradient(135deg, #5568d3 0%, #63428a 100%)",
                              },
                            }}
                          >
                            Xác nhận
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={handleDeclineFriend}
                            disabled={actionLoading}
                            sx={{
                              textTransform: "none",
                              fontWeight: 600,
                              borderRadius: 2.5,
                              px: 3,
                              py: 1.2,
                              borderColor: "divider",
                              "&:hover": {
                                borderColor: "error.main",
                                color: "error.main",
                                bgcolor: "rgba(211, 47, 47, 0.04)",
                              },
                            }}
                          >
                            Xóa
                          </Button>
                        </>
                      );
                    } else if (hasSentRequest) {
                      return (
                        <>
                          <Chip
                            icon={<PersonAddIcon />}
                            label="Đã gửi lời mời kết bạn"
                            color="warning"
                            sx={{
                              height: 40,
                              px: 2,
                              fontWeight: 600,
                              fontSize: 14,
                              "& .MuiChip-icon": {
                                color: "warning.main",
                              },
                            }}
                          />
                          <Button
                            variant="outlined"
                            onClick={handleCancelFriendRequest}
                            disabled={actionLoading}
                            sx={{
                              textTransform: "none",
                              fontWeight: 600,
                              borderRadius: 2.5,
                              px: 3,
                              py: 1.2,
                              borderColor: "divider",
                              "&:hover": {
                                borderColor: "error.main",
                                color: "error.main",
                                bgcolor: "rgba(211, 47, 47, 0.04)",
                              },
                            }}
                          >
                            Hủy lời mời
                          </Button>
                        </>
                      );
                    } else {
                      return (
                        <>
                          <Button
                            variant="contained"
                            startIcon={<PersonAddIcon />}
                            onClick={handleAddFriend}
                            disabled={actionLoading}
                            sx={{
                              textTransform: "none",
                              fontWeight: 600,
                              borderRadius: 2.5,
                              px: 3,
                              py: 1.2,
                              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              "&:hover": {
                                background: "linear-gradient(135deg, #5568d3 0%, #63428a 100%)",
                              },
                            }}
                          >
                            Kết bạn
                          </Button>
                          {!isFollowing && (
                            <Button
                              variant="outlined"
                              startIcon={<PersonAddIcon />}
                              onClick={handleFollow}
                              disabled={actionLoading}
                              sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                borderRadius: 2.5,
                                px: 3,
                                py: 1.2,
                                borderColor: "divider",
                                "&:hover": {
                                  borderColor: "primary.main",
                                  bgcolor: "rgba(102, 126, 234, 0.04)",
                                },
                              }}
                            >
                              Theo dõi
                            </Button>
                          )}
                          {isFollowing && (
                            <Button
                              variant="outlined"
                              onClick={handleUnfollow}
                              disabled={actionLoading}
                              sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                borderRadius: 2.5,
                                px: 3,
                                py: 1.2,
                                borderColor: "divider",
                                "&:hover": {
                                  borderColor: "error.main",
                                  color: "error.main",
                                  bgcolor: "rgba(211, 47, 47, 0.04)",
                                },
                              }}
                            >
                              Đang theo dõi
                            </Button>
                          )}
                        </>
                      );
                    }
                  })()}
                </Stack>
              )}
              
              {/* Email if different from username */}
              {userDetails?.email && userDetails?.email !== userDetails?.username && (
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 2.5, 
                    fontSize: 15,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    justifyContent: { xs: "center", md: "flex-start" },
                    opacity: 0.7,
                  }}
                >
                  📧 {userDetails.email}
                </Typography>
              )}
              
              {userDetails?.bio && (
                <Box sx={{ mb: 2, maxWidth: 680, mx: { xs: "auto", md: 0 } }}>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      whiteSpace: "pre-line",
                      lineHeight: 1.6,
                      fontSize: 14,
                    }}
                  >
                    {bioExpanded ? userDetails.bio : getBioPreview(userDetails.bio)}
                  </Typography>
                  {shouldShowSeeMore(userDetails.bio) && (
                    <Button
                      size="small"
                      onClick={() => setBioExpanded(!bioExpanded)}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: 13,
                        p: 0,
                        mt: 0.5,
                        minWidth: "auto",
                        color: "primary.main",
                        "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
                      }}
                    >
                      {bioExpanded ? "See less" : "See more"}
                    </Button>
                  )}
                </Box>
              )}

              {/* Additional Info Chips */}
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ 
                  mb: 3, 
                  justifyContent: { xs: "center", md: "flex-start" }, 
                  flexWrap: "wrap", 
                  gap: 1.5,
                }}
              >
                {userDetails?.city && (
                  <Chip 
                    icon={<LocationOnIcon sx={{ fontSize: 18, ml: 0.5 }} />}
                    label={userDetails.city}
                    size="medium"
                    sx={{ 
                      fontWeight: 600,
                      fontSize: 14,
                      height: 36,
                      bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
                      color: "primary.main",
                      borderRadius: 4,
                      px: 1.5,
                      border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.2)}`,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: (t) => alpha(t.palette.primary.main, 0.18),
                        transform: "translateY(-2px)",
                        boxShadow: (t) => `0 4px 12px ${alpha(t.palette.primary.main, 0.2)}`,
                      },
                    }}
                  />
                )}
                {userDetails?.workplace && (
                  <Chip 
                    icon={<WorkIcon sx={{ fontSize: 18, ml: 0.5 }} />}
                    label={userDetails.workplace}
                    size="medium"
                    sx={{ 
                      fontWeight: 600,
                      fontSize: 14,
                      height: 36,
                      bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
                      color: "primary.main",
                      borderRadius: 4,
                      px: 1.5,
                      border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.2)}`,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: (t) => alpha(t.palette.primary.main, 0.18),
                        transform: "translateY(-2px)",
                        boxShadow: (t) => `0 4px 12px ${alpha(t.palette.primary.main, 0.2)}`,
                      },
                    }}
                  />
                )}
                {userDetails?.position && (
                  <Chip 
                    icon={<WorkIcon sx={{ fontSize: 18, ml: 0.5 }} />}
                    label={userDetails.position}
                    size="medium"
                    sx={{ 
                      fontWeight: 600,
                      fontSize: 14,
                      height: 36,
                      bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
                      color: "primary.main",
                      borderRadius: 4,
                      px: 1.5,
                      border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.2)}`,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: (t) => alpha(t.palette.primary.main, 0.18),
                        transform: "translateY(-2px)",
                        boxShadow: (t) => `0 4px 12px ${alpha(t.palette.primary.main, 0.2)}`,
                      },
                    }}
                  />
                )}
              </Stack>

            </Box>
          </Box>

        </Paper>

        <Box sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            {/* About Section - Left Side */}
            <Grid item xs={12} md={5}>
              <Paper
                elevation={0}
                sx={(t) => ({
                  borderRadius: 4,
                  p: { xs: 3, sm: 3.5, md: 4 },
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: t.palette.mode === "dark"
                    ? "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)"
                    : "0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                  backgroundImage: t.palette.mode === "dark"
                    ? "linear-gradient(135deg, rgba(139, 154, 255, 0.04) 0%, rgba(151, 117, 212, 0.04) 100%)"
                    : "linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%)",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    boxShadow: t.palette.mode === "dark"
                      ? "0 12px 48px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08)"
                      : "0 12px 48px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.08)",
                    transform: "translateY(-4px)",
                  },
                  position: "sticky",
                  top: 20,
                  maxHeight: "calc(100vh - 40px)",
                  overflowY: "auto",
                  "&::-webkit-scrollbar": {
                    width: "8px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "transparent",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: (t) => alpha(t.palette.primary.main, 0.2),
                    borderRadius: "4px",
                    "&:hover": {
                      background: (t) => alpha(t.palette.primary.main, 0.3),
                    },
                  },
                })}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3.5 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 800, 
                      fontSize: { xs: 20, sm: 22 },
                      background: (t) => t.palette.mode === "dark"
                        ? "linear-gradient(135deg, #8b9aff 0%, #9775d4 100%)"
                        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Giới thiệu
                  </Typography>
                  {isOwnProfile && (
                    <IconButton
                      size="medium"
                      onClick={() => setEditingAbout(!editingAbout)}
                      sx={{
                        bgcolor: editingAbout ? "primary.main" : alpha("#667eea", 0.12),
                        color: editingAbout ? "white" : "primary.main",
                        width: 40,
                        height: 40,
                        "&:hover": {
                          bgcolor: editingAbout ? "primary.dark" : alpha("#667eea", 0.2),
                          transform: "scale(1.1) rotate(15deg)",
                          boxShadow: (t) => `0 4px 12px ${alpha(t.palette.primary.main, 0.3)}`,
                        },
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>

                  {editingAbout ? (
                    <Stack spacing={3}>
                      <TextField
                        fullWidth
                        label="Bio"
                        multiline
                        rows={4}
                        value={editProfileData?.bio || ""}
                        onChange={(e) => {
                          setEditProfileData({ ...editProfileData, bio: e.target.value });
                        }}
                      />
                      <TextField
                        fullWidth
                        label="City"
                        value={editProfileData?.city || ""}
                        onChange={(e) => {
                          setEditProfileData({ ...editProfileData, city: e.target.value });
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Date of Birth"
                        type="date"
                        value={editProfileData?.dob ? (editProfileData.dob.includes('T') ? editProfileData.dob.split('T')[0] : editProfileData.dob) : ""}
                        onChange={(e) => {
                          setEditProfileData({ ...editProfileData, dob: e.target.value });
                        }}
                        InputLabelProps={{ shrink: true }}
                      />
                      <TextField
                        fullWidth
                        label="First Name"
                        value={editProfileData?.firstName || ""}
                        onChange={(e) => {
                          setEditProfileData({ ...editProfileData, firstName: e.target.value });
                        }}
                        placeholder="First Name"
                      />
                      <TextField
                        fullWidth
                        label="Last Name"
                        value={editProfileData?.lastName || ""}
                        onChange={(e) => {
                          setEditProfileData({ ...editProfileData, lastName: e.target.value });
                        }}
                        placeholder="Last Name"
                      />
                      <TextField
                        fullWidth
                        label="Phone Number"
                        value={editProfileData?.phoneNumber || ""}
                        onChange={(e) => {
                          setEditProfileData({ ...editProfileData, phoneNumber: e.target.value });
                        }}
                        placeholder="+1 234 567 8900"
                      />
                      <TextField
                        fullWidth
                        label="Website"
                        value={editProfileData?.website || ""}
                        onChange={(e) => {
                          setEditProfileData({ ...editProfileData, website: e.target.value });
                        }}
                        placeholder="https://example.com"
                      />
                      <TextField
                        fullWidth
                        label="Country"
                        value={editProfileData?.country || ""}
                        onChange={(e) => {
                          setEditProfileData({ ...editProfileData, country: e.target.value });
                        }}
                        placeholder="Country"
                      />
                      <TextField
                        fullWidth
                        select
                        label="Gender"
                        value={editProfileData?.gender || ""}
                        onChange={(e) => {
                          setEditProfileData({ ...editProfileData, gender: e.target.value });
                        }}
                        SelectProps={{
                          native: true,
                        }}
                      >
                        <option value="">Select...</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                        <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                      </TextField>
                      
                      <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setEditingAbout(false);
                            setEditProfileData(null);
                          }}
                          sx={{ 
                            textTransform: "none", 
                            borderRadius: 2,
                            borderWidth: 2,
                            "&:hover": {
                              borderWidth: 2,
                            },
                          }}
                        >
                          Hủy
                        </Button>
                        <Button
                          variant="contained"
                          onClick={handleSaveAbout}
                          sx={{
                            textTransform: "none",
                            borderRadius: 2,
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                            "&:hover": {
                              background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                            },
                          }}
                        >
                          Save Changes
                        </Button>
                      </Stack>
                    </Stack>
                  ) : (
                    <Stack spacing={2.5}>
                      {userDetails?.city && (
                        <>
                          <Box 
                            sx={{ 
                              display: "flex", 
                              alignItems: "flex-start", 
                              gap: 2,
                              p: 2,
                              borderRadius: 3,
                              bgcolor: (t) => alpha(t.palette.primary.main, 0.05),
                              border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.1)}`,
                              transition: "all 0.2s ease",
                              "&:hover": {
                                bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                                transform: "translateX(4px)",
                              },
                            }}
                          >
                            <Box
                              sx={{
                                p: 1,
                                borderRadius: 2,
                                bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <LocationOnIcon sx={{ color: "primary.main", fontSize: 24 }} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: 13, fontWeight: 500 }}>
                                Sống tại
                              </Typography>
                              <Typography variant="body1" fontWeight={700} sx={{ fontSize: 15 }}>
                                {userDetails.city}
                              </Typography>
                            </Box>
                          </Box>
                        </>
                      )}

                      {userDetails?.dob && (
                        <Box 
                          sx={{ 
                            display: "flex", 
                            alignItems: "flex-start", 
                            gap: 2,
                            p: 2,
                            borderRadius: 3,
                            bgcolor: (t) => alpha(t.palette.primary.main, 0.05),
                            border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.1)}`,
                            transition: "all 0.2s ease",
                            "&:hover": {
                              bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                              transform: "translateX(4px)",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              p: 1,
                              borderRadius: 2,
                              bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <CakeIcon sx={{ color: "primary.main", fontSize: 24 }} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: 13, fontWeight: 500 }}>
                              Ngày sinh
                            </Typography>
                            <Typography variant="body1" fontWeight={700} sx={{ fontSize: 15 }}>
                              {new Date(userDetails.dob).toLocaleDateString('vi-VN')}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {userDetails?.email && (
                        <Box 
                          sx={{ 
                            display: "flex", 
                            alignItems: "flex-start", 
                            gap: 2,
                            p: 2,
                            borderRadius: 3,
                            bgcolor: (t) => alpha(t.palette.primary.main, 0.05),
                            border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.1)}`,
                            transition: "all 0.2s ease",
                            "&:hover": {
                              bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                              transform: "translateX(4px)",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              p: 1,
                              borderRadius: 2,
                              bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <WorkIcon sx={{ color: "primary.main", fontSize: 24 }} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: 13, fontWeight: 500 }}>
                              Email
                            </Typography>
                            <Typography variant="body1" fontWeight={700} sx={{ fontSize: 15 }}>
                              {userDetails.email}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {userDetails?.phone && (
                        <Box 
                          sx={{ 
                            display: "flex", 
                            alignItems: "flex-start", 
                            gap: 2,
                            p: 2,
                            borderRadius: 3,
                            bgcolor: (t) => alpha(t.palette.primary.main, 0.05),
                            border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.1)}`,
                            transition: "all 0.2s ease",
                            "&:hover": {
                              bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                              transform: "translateX(4px)",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              p: 1,
                              borderRadius: 2,
                              bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <PhoneIcon sx={{ color: "primary.main", fontSize: 24 }} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: 13, fontWeight: 500 }}>
                              Số điện thoại
                            </Typography>
                            <Typography variant="body1" fontWeight={700} sx={{ fontSize: 15 }}>
                              {userDetails.phone}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {userDetails?.website && (
                        <Box 
                          sx={{ 
                            display: "flex", 
                            alignItems: "flex-start", 
                            gap: 2,
                            p: 2,
                            borderRadius: 3,
                            bgcolor: (t) => alpha(t.palette.primary.main, 0.05),
                            border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.1)}`,
                            transition: "all 0.2s ease",
                            "&:hover": {
                              bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                              transform: "translateX(4px)",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              p: 1,
                              borderRadius: 2,
                              bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <LanguageIcon sx={{ color: "primary.main", fontSize: 24 }} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: 13, fontWeight: 500 }}>
                              Website
                            </Typography>
                            <Typography variant="body1" fontWeight={700} sx={{ fontSize: 15 }}>
                              <a 
                                href={userDetails.website.startsWith('http') ? userDetails.website : `https://${userDetails.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ 
                                  color: 'inherit', 
                                  textDecoration: 'none',
                                  transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => e.target.style.color = 'var(--mui-palette-primary-main)'}
                                onMouseLeave={(e) => e.target.style.color = 'inherit'}
                              >
                                {userDetails.website}
                              </a>
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {userDetails?.workplace && (
                        <Box 
                          sx={{ 
                            display: "flex", 
                            alignItems: "flex-start", 
                            gap: 2,
                            p: 2,
                            borderRadius: 3,
                            bgcolor: (t) => alpha(t.palette.primary.main, 0.05),
                            border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.1)}`,
                            transition: "all 0.2s ease",
                            "&:hover": {
                              bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                              transform: "translateX(4px)",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              p: 1,
                              borderRadius: 2,
                              bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <BusinessIcon sx={{ color: "primary.main", fontSize: 24 }} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: 13, fontWeight: 500 }}>
                              Nơi làm việc
                            </Typography>
                            <Typography variant="body1" fontWeight={700} sx={{ fontSize: 15 }}>
                              {userDetails.workplace}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {userDetails?.position && (
                        <Box 
                          sx={{ 
                            display: "flex", 
                            alignItems: "flex-start", 
                            gap: 2,
                            p: 2,
                            borderRadius: 3,
                            bgcolor: (t) => alpha(t.palette.primary.main, 0.05),
                            border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.1)}`,
                            transition: "all 0.2s ease",
                            "&:hover": {
                              bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                              transform: "translateX(4px)",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              p: 1,
                              borderRadius: 2,
                              bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <WorkIcon sx={{ color: "primary.main", fontSize: 24 }} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: 13, fontWeight: 500 }}>
                              Chức vụ
                            </Typography>
                            <Typography variant="body1" fontWeight={700} sx={{ fontSize: 15 }}>
                              {userDetails.position}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {userDetails?.education && (
                        <Box 
                          sx={{ 
                            display: "flex", 
                            alignItems: "flex-start", 
                            gap: 2,
                            p: 2,
                            borderRadius: 3,
                            bgcolor: (t) => alpha(t.palette.primary.main, 0.05),
                            border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.1)}`,
                            transition: "all 0.2s ease",
                            "&:hover": {
                              bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                              transform: "translateX(4px)",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              p: 1,
                              borderRadius: 2,
                              bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <SchoolIcon sx={{ color: "primary.main", fontSize: 24 }} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: 13, fontWeight: 500 }}>
                              Học vấn
                            </Typography>
                            <Typography variant="body1" fontWeight={700} sx={{ fontSize: 15 }}>
                              {userDetails.education}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {userDetails?.relationship && (
                        <Box 
                          sx={{ 
                            display: "flex", 
                            alignItems: "flex-start", 
                            gap: 2,
                            p: 2,
                            borderRadius: 3,
                            bgcolor: (t) => alpha(t.palette.primary.main, 0.05),
                            border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.1)}`,
                            transition: "all 0.2s ease",
                            "&:hover": {
                              bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                              transform: "translateX(4px)",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              p: 1,
                              borderRadius: 2,
                              bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <FavoriteIcon sx={{ color: "primary.main", fontSize: 24 }} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: 13, fontWeight: 500 }}>
                              Mối quan hệ
                            </Typography>
                            <Typography variant="body1" fontWeight={700} sx={{ fontSize: 15 }}>
                              {userDetails.relationship}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {/* Friends Section */}
                      <Box sx={{ mt: 3 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 800, 
                              fontSize: { xs: 18, sm: 20 },
                              background: (t) => t.palette.mode === "dark"
                                ? "linear-gradient(135deg, #8b9aff 0%, #9775d4 100%)"
                                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              backgroundClip: "text",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                            }}
                          >
                            Bạn bè
                          </Typography>
                          {friendsList.length > 0 && (
                            <Button
                              size="small"
                              onClick={() => navigate(`/friends`)}
                              sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                fontSize: 13,
                                color: "primary.main",
                                "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
                              }}
                            >
                              Xem tất cả
                            </Button>
                          )}
                        </Box>

                        {loadingFriends ? (
                          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                            <CircularProgress size={32} />
                          </Box>
                        ) : friendsList.length === 0 ? (
                          <Box
                            sx={{
                              p: 4,
                              textAlign: "center",
                              borderRadius: 3,
                              bgcolor: (t) => alpha(t.palette.primary.main, 0.05),
                              border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.1)}`,
                            }}
                          >
                            <PersonIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              Chưa có bạn bè
                            </Typography>
                          </Box>
                        ) : (
                          <Grid container spacing={1.5}>
                            {friendsList.slice(0, 9).map((friend) => {
                              const friendId = friend.friendId || friend.id || friend.userId;
                              const friendName = friend.firstName && friend.lastName
                                ? `${friend.lastName} ${friend.firstName}`.trim()
                                : friend.username || friend.name || "Người dùng";
                              const friendAvatar = friend.avatar || friend.avatarUrl || null;
                              
                              return (
                                <Grid item xs={4} key={friendId}>
                                  <Box
                                    onClick={() => navigate(`/profile/${friendId}`)}
                                    sx={{
                                      cursor: "pointer",
                                      p: 1.5,
                                      borderRadius: 2,
                                      bgcolor: (t) => alpha(t.palette.primary.main, 0.05),
                                      border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.1)}`,
                                      transition: "all 0.2s ease",
                                      "&:hover": {
                                        bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                                        transform: "translateY(-2px)",
                                        boxShadow: (t) => `0 4px 12px ${alpha(t.palette.primary.main, 0.2)}`,
                                      },
                                    }}
                                  >
                                    <Avatar
                                      src={friendAvatar}
                                      sx={{
                                        width: "100%",
                                        height: "auto",
                                        aspectRatio: "1",
                                        mb: 1,
                                        bgcolor: (t) => t.palette.mode === "dark"
                                          ? "linear-gradient(135deg, #8b9aff 0%, #9775d4 100%)"
                                          : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                      }}
                                    >
                                      {friendName.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        display: "block",
                                        textAlign: "center",
                                        fontWeight: 600,
                                        fontSize: 11,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {friendName}
                                    </Typography>
                                  </Box>
                                </Grid>
                              );
                            })}
                          </Grid>
                        )}
                      </Box>
                    </Stack>
                  )}
                </Paper>
              </Grid>

            {/* Posts Section */}
            <Grid item xs={12} md={7}>
              <Box>
              {postsLoading && posts.length === 0 ? (
                <Box 
                  sx={{ 
                    display: "flex", 
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center", 
                    py: 6,
                    gap: 2
                  }}
                >
                  <CircularProgress 
                    size="40px" 
                    color="primary"
                    sx={{
                      "& .MuiCircularProgress-circle": {
                        strokeLinecap: "round",
                      },
                    }}
                  />
                  <Typography 
                    sx={{ 
                      fontSize: 15, 
                      color: "text.secondary",
                      fontWeight: 500
                    }}
                  >
                    Đang tải bài viết...
                  </Typography>
                </Box>
              ) : posts.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={(t) => ({
                    borderRadius: 5,
                    p: 6,
                    textAlign: "center",
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    boxShadow: t.palette.mode === "dark"
                      ? "0 4px 20px rgba(0, 0, 0, 0.3)"
                      : "0 4px 20px rgba(0, 0, 0, 0.06)",
                    backgroundImage: t.palette.mode === "dark"
                      ? "linear-gradient(135deg, rgba(139, 154, 255, 0.03) 0%, rgba(151, 117, 212, 0.03) 100%)"
                      : "linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%)",
                  })}
                >
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 3,
                      animation: "pulse 2s ease-in-out infinite",
                      "@keyframes pulse": {
                        "0%, 100%": {
                          transform: "scale(1)",
                          opacity: 1,
                        },
                        "50%": {
                          transform: "scale(1.05)",
                          opacity: 0.8,
                        },
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 56,
                        color: "primary.main",
                      }}
                    >
                      📝
                    </Typography>
                  </Box>
                  <Typography 
                    variant="h6" 
                    color="text.primary" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 700,
                      fontSize: 22,
                      mb: 1.5
                    }}
                  >
                    Chưa có bài viết nào
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      mb: 3,
                      fontSize: 15
                    }}
                  >
                    Bạn chưa đăng bài viết nào. Hãy tạo bài viết đầu tiên để chia sẻ với mọi người!
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate("/")}
                    sx={{
                      textTransform: "none",
                      borderRadius: 3,
                      px: 4,
                      py: 1.5,
                      fontSize: 15,
                      fontWeight: 600,
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
                    Tạo bài viết mới
                  </Button>
                </Paper>
              ) : (
                <Box>
                  {posts.map((post, index) => {
                    const isLast = posts.length === index + 1;
                    return (
                      <Box
                        key={post.id}
                        sx={{
                          animation: `fadeInUp 0.5s ease ${index * 0.1}s both`,
                          "@keyframes fadeInUp": {
                            from: {
                              opacity: 0,
                              transform: "translateY(20px)",
                            },
                            to: {
                              opacity: 1,
                              transform: "translateY(0)",
                            },
                          },
                        }}
                      >
                        <Post
                          ref={isLast ? lastPostElementRef : null}
                          post={post}
                          currentUserId={currentUser?.id || currentUser?.userId}
                          onEdit={async (id, content) => {
                            try {
                              await updatePost(id, { content });
                              setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, content } : p)));
                              setSnackbar({ open: true, message: "Đã cập nhật bài viết thành công!", severity: "success" });
                            } catch (error) {
                              console.error('Error updating post:', error);
                              setSnackbar({ open: true, message: "Không thể cập nhật bài viết. Vui lòng thử lại.", severity: "error" });
                            }
                          }}
                          onDelete={async (id) => {
                            try {
                              await deletePost(id);
                              setPosts((prev) => prev.filter((p) => p.id !== id));
                              setSnackbar({ open: true, message: "Đã xóa bài viết thành công!", severity: "success" });
                            } catch (error) {
                              console.error('Error deleting post:', error);
                              setSnackbar({ open: true, message: "Không thể xóa bài viết. Vui lòng thử lại.", severity: "error" });
                            }
                          }}
                          onShare={(sharedPost) => {
                            if (sharedPost) {
                              const formatTimeAgo = (dateString) => {
                                if (!dateString) return 'Vừa xong';
                                const date = new Date(dateString);
                                const now = new Date();
                                const diffMs = now - date;
                                const diffMins = Math.floor(diffMs / 60000);
                                if (diffMins < 1) return 'Vừa xong';
                                if (diffMins < 60) return `${diffMins} phút trước`;
                                return date.toLocaleDateString('vi-VN');
                              };
                              
                              const media = (sharedPost.imageUrls || []).map((url) => ({
                                url: url,
                                type: 'image',
                                alt: `Post image ${sharedPost.id}`,
                              }));
                              
                              const formattedPost = {
                                id: sharedPost.id,
                                avatar: currentUser?.avatar && currentUser.avatar.trim() !== '' ? currentUser.avatar : null,
                                username: currentUser?.username || 'Unknown',
                                firstName: currentUser?.firstName || '',
                                lastName: currentUser?.lastName || '',
                                displayName: currentUser?.lastName && currentUser?.firstName 
                                  ? `${currentUser.lastName} ${currentUser.firstName}`.trim()
                                  : currentUser?.firstName || currentUser?.lastName || currentUser?.username || 'Unknown',
                                created: formatTimeAgo(sharedPost.createdDate || sharedPost.created),
                                content: sharedPost.content || '',
                                media: media,
                                userId: currentUser?.id || currentUser?.userId,
                                privacy: sharedPost.privacy || 'PUBLIC',
                                likeCount: sharedPost.likeCount || 0,
                                commentCount: sharedPost.commentCount || 0,
                                isLiked: sharedPost.isLiked || false,
                                ...sharedPost,
                              };
                              
                              setPosts((prev) => {
                                const exists = prev.some(p => p.id === formattedPost.id);
                                if (exists) return prev;
                                return [formattedPost, ...prev];
                              });
                              
                              setSnackbar({ open: true, message: "Đã chia sẻ bài viết thành công!", severity: "success" });
                            }
                          }}
                        />
                      </Box>
                    );
                  })}

                  {postsLoading && (
                    <Box 
                      sx={{ 
                        display: "flex", 
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center", 
                        py: 4,
                        gap: 2
                      }}
                    >
                      <CircularProgress 
                        size="32px" 
                        color="primary"
                        sx={{
                          "& .MuiCircularProgress-circle": {
                            strokeLinecap: "round",
                          },
                        }}
                      />
                      <Typography 
                        sx={{ 
                          fontSize: 14, 
                          color: "text.secondary",
                          fontWeight: 500
                        }}
                      >
                        Đang tải thêm bài viết...
                      </Typography>
                    </Box>
                  )}

                  {!postsLoading && posts.length > 0 && postsPage >= postsTotalPages && (
                    <Box 
                      sx={{ 
                        display: "flex", 
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center", 
                        py: 4,
                        gap: 1
                      }}
                    >
                      <Box
                        sx={{
                          width: 60,
                          height: 4,
                          borderRadius: 2,
                          bgcolor: (t) => alpha(t.palette.primary.main, 0.2),
                          mb: 1,
                        }}
                      />
                      <Typography sx={{ fontSize: 14, color: "text.secondary", fontWeight: 500 }}>
                        Đã hiển thị tất cả bài viết
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: "text.disabled" }}>
                        Đã hiển thị {posts.length} bài viết
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1,
            minWidth: 200,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
          },
        }}
      >
        <MenuItem onClick={handleMenuClose} sx={{ py: 1.5, borderRadius: 1 }}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Share Profile</Typography>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={handleMenuClose} sx={{ py: 1.5, borderRadius: 1, color: "error.main" }}>
          <ListItemIcon>
            <BlockIcon fontSize="small" sx={{ color: "error.main" }} />
          </ListItemIcon>
          <Typography variant="body2">Block User</Typography>
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ py: 1.5, borderRadius: 1, color: "error.main" }}>
          <ListItemIcon>
            <ReportIcon fontSize="small" sx={{ color: "error.main" }} />
          </ListItemIcon>
          <Typography variant="body2">Report User</Typography>
        </MenuItem>
      </Menu>


      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ mt: 8 }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: 3 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {isOwnProfile && (
        <CreatePostButton 
          user={currentUser} 
          onPostCreated={handlePostCreated}
          show={isOwnProfile}
        />
      )}
    </PageLayout>
  );
}

