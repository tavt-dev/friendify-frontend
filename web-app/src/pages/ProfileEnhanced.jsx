import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
} from "../services/userService";
import { isAuthenticated, logOut } from "../services/identityService";
import { useUser } from "../contexts/UserContext";
import { getMyPosts, updatePost, deletePost } from "../services/postService";
import { getApiUrl, API_ENDPOINTS } from "../config/apiConfig";
import { getToken } from "../services/localStorageService";
import Post from "../components/Post";
import Scene from "./Scene";

export default function ProfileEnhanced() {
  const navigate = useNavigate();
  const { user: userDetails, loadUser } = useUser();
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
  // Local state for editing profile
  const [editProfileData, setEditProfileData] = useState(null);
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const lastPostElementRef = useRef(null);
  const postsObserver = useRef(null);

  // Initialize editProfileData when entering edit mode
  useEffect(() => {
    if (editingAbout && userDetails && !editProfileData) {
      setEditProfileData({
        bio: userDetails.bio || "",
        city: userDetails.city || "",
        dob: userDetails.dob || null,
        phone: userDetails.phone || "",
        website: userDetails.website || "",
        workplace: userDetails.workplace || "",
        position: userDetails.position || "",
        education: userDetails.education || "",
        relationship: userDetails.relationship || "",
      });
    }
    if (!editingAbout) {
      setEditProfileData(null);
    }
  }, [editingAbout, userDetails, editProfileData]);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  const handleAvatarClick = () => avatarInputRef.current?.click();
  const handleCoverClick = () => coverInputRef.current?.click();

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      setSnackbar({ open: true, message: "Please select an image file", severity: "error" });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      await uploadAvatar(formData);
      await loadUser();
      setSnackbar({ open: true, message: "Avatar updated successfully!", severity: "success" });
    } catch (error) {
      setSnackbar({ open: true, message: "Failed to upload avatar", severity: "error" });
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
      
      console.log('Uploading background image...');
      const response = await uploadBackground(formData);
      console.log('Background upload response:', response);
      
      // Reload user data to get updated background
      await loadUser();
      
      setSnackbar({ open: true, message: "Đã cập nhật ảnh bìa thành công!", severity: "success" });
    } catch (error) {
      console.error('Error uploading background:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      let errorMessage = "Không thể tải ảnh bìa. Vui lòng thử lại.";
      if (error.response?.status === 401) {
        errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    } finally {
      setUploading(false);
    }
  };

  const loadMyPosts = useCallback(async (page = 1) => {
    // Prevent loading if already loading
    if (postsLoading) {
      return;
    }
    
    setPostsLoading(true);
    try {
      const response = await getMyPosts(page, 10);
      
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
        // Fetch avatar for current user (since these are my posts)
        let userAvatar = null;
        if (userDetails?.avatar) {
          userAvatar = userDetails.avatar;
        } else {
          try {
            const avatarResponse = await fetch(getApiUrl(API_ENDPOINTS.USER.GET_PROFILE.replace(':id', userDetails?.id)), {
              headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json',
              },
            });
            if (avatarResponse.ok) {
              const avatarData = await avatarResponse.json();
              userAvatar = avatarData?.result?.avatar || avatarData?.data?.avatar || avatarData?.avatar || null;
            }
          } catch (error) {
            console.warn('Failed to fetch avatar:', error);
          }
        }
        
        // Map posts to format expected by Post component
        const mappedPosts = newPosts.map((post) => {
          // Map imageUrls to media format for MediaCarousel
          const media = (post.imageUrls || []).map((url) => ({
            url: url,
            type: 'image',
            alt: `Post image ${post.id}`,
          }));
          
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
          
          return {
            id: post.id,
            avatar: userAvatar || post.avatar || post.userAvatar || null,
            username: post.username || userDetails?.username || 'Unknown',
            created: created,
            content: post.content || '',
            media: media,
            userId: post.userId,
            privacy: post.privacy || 'PUBLIC', // Ensure privacy is included
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
      } else if (page === 1) {
        setPosts([]);
        setPostsPage(1);
      } else {
        // No more posts, update total pages to prevent further loading
        if (postsTotalPages > page - 1) {
          setPostsTotalPages(page - 1);
        }
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      setSnackbar({ open: true, message: "Không thể tải bài viết. Vui lòng thử lại.", severity: "error" });
    } finally {
      setPostsLoading(false);
    }
  }, [userDetails]);

  // Load posts on mount - only once
  const hasLoadedPosts = useRef(false);
  useEffect(() => {
    if (!hasLoadedPosts.current && posts.length === 0 && !postsLoading && userDetails?.id) {
      hasLoadedPosts.current = true;
      setPostsPage(1);
      loadMyPosts(1);
    }
  }, [userDetails?.id]); // Only depend on userDetails.id

  // Infinite scroll for posts
  useEffect(() => {
    // Disconnect if loading or no more pages
    if (postsLoading || postsPage >= postsTotalPages || postsTotalPages === 0 || posts.length === 0) {
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
      if (entries[0].isIntersecting && !postsLoading && postsPage < postsTotalPages) {
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
  }, [posts.length, postsLoading, postsPage, postsTotalPages]); // Removed loadMyPosts to prevent infinite loop

  const handleSaveAbout = async () => {
    if (!editProfileData) return;
    
    try {
      await updateProfile(editProfileData);
      await loadUser();
      setEditingAbout(false);
      setEditProfileData(null);
      setSnackbar({ open: true, message: "Cập nhật thông tin thành công!", severity: "success" });
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({ open: true, message: "Không thể cập nhật thông tin. Vui lòng thử lại.", severity: "error" });
    }
  };

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
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
      <Scene>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress size={50} />
        </Box>
      </Scene>
    );
  }

  return (
    <Scene>
      <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto", pb: 4 }}>
        <Paper
          elevation={0}
          sx={(t) => ({
            position: "relative",
            height: { xs: 280, sm: 380, md: 420 },
            borderRadius: { xs: 0, sm: "20px 20px 0 0" },
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
            borderBottom: "none",
            boxShadow: t.palette.mode === "dark"
              ? "0 8px 32px rgba(0, 0, 0, 0.4)"
              : "0 8px 32px rgba(0, 0, 0, 0.08)",
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: t.palette.mode === "dark"
                ? "0 12px 48px rgba(0, 0, 0, 0.5)"
                : "0 12px 48px rgba(0, 0, 0, 0.12)",
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
              transition: "transform 0.5s ease",
              transform: coverHover ? "scale(1.05)" : "scale(1)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.5) 100%)",
            }}
          />
          <Tooltip title="Change cover photo" arrow>
            <IconButton
              onClick={handleCoverClick}
              sx={{
                position: "absolute",
                bottom: 20,
                right: 20,
                bgcolor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                opacity: coverHover ? 1 : 0,
                transition: "all 0.3s ease",
                "&:hover": { 
                  bgcolor: "white",
                  transform: "scale(1.1)",
                },
                boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
              }}
            >
              <PhotoCameraIcon />
            </IconButton>
          </Tooltip>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleCoverUpload}
          />
        </Paper>

        <Paper
          elevation={0}
          sx={(t) => ({
            borderRadius: { xs: 0, sm: "0 0 20px 20px" },
            border: "1px solid",
            borderColor: "divider",
            borderTop: "none",
            p: { xs: 2, sm: 3, md: 4 },
            mb: 3,
            bgcolor: "background.paper",
            boxShadow: t.palette.mode === "dark"
              ? "0 4px 24px rgba(0, 0, 0, 0.3)"
              : "0 4px 24px rgba(0, 0, 0, 0.06)",
            backgroundImage: t.palette.mode === "dark"
              ? "linear-gradient(135deg, rgba(139, 154, 255, 0.02) 0%, rgba(151, 117, 212, 0.02) 100%)"
              : "linear-gradient(135deg, rgba(102, 126, 234, 0.01) 0%, rgba(118, 75, 162, 0.01) 100%)",
          })}
        >
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3, alignItems: { xs: "center", md: "flex-start" } }}>
            <Box 
              sx={{ 
                position: "relative", 
                mt: { xs: -14, md: -10 },
                alignSelf: { xs: "center", md: "flex-start" }
              }}
              onMouseEnter={() => setAvatarHover(true)}
              onMouseLeave={() => setAvatarHover(false)}
            >
              <Avatar
                src={userDetails?.avatar}
                sx={(t) => ({
                  width: { xs: 150, sm: 160, md: 180 },
                  height: { xs: 150, sm: 160, md: 180 },
                  border: "6px solid",
                  borderColor: "background.paper",
                  bgcolor: t.palette.mode === "dark"
                    ? "linear-gradient(135deg, #8b9aff 0%, #9775d4 100%)"
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  fontSize: { xs: 56, sm: 64, md: 72 },
                  cursor: "pointer",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: t.palette.mode === "dark"
                    ? "0 8px 32px rgba(139, 154, 255, 0.4), 0 4px 16px rgba(0, 0, 0, 0.5)"
                    : "0 8px 32px rgba(102, 126, 234, 0.3), 0 4px 16px rgba(0, 0, 0, 0.15)",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: t.palette.mode === "dark"
                      ? "0 12px 48px rgba(139, 154, 255, 0.5), 0 6px 24px rgba(0, 0, 0, 0.6)"
                      : "0 12px 48px rgba(102, 126, 234, 0.4), 0 6px 24px rgba(0, 0, 0, 0.2)",
                  },
                })}
                onClick={handleAvatarClick}
              >
                {userDetails?.firstName?.[0] || ""}{userDetails?.lastName?.[0] || ""}
              </Avatar>
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
                  bgcolor: "rgba(0, 0, 0, 0.5)",
                  opacity: avatarHover ? 1 : 0,
                  transition: "opacity 0.3s ease",
                  cursor: "pointer",
                }}
                onClick={handleAvatarClick}
              >
                <PhotoCameraIcon sx={{ color: "white", fontSize: 40 }} />
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
                    bgcolor: "rgba(0, 0, 0, 0.5)",
                  }}
                >
                  <CircularProgress size={48} sx={{ color: "white" }} />
                </Box>
              )}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAvatarUpload}
              />
            </Box>

            <Box sx={{ flex: 1, textAlign: { xs: "center", md: "left" }, width: "100%" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: { xs: "center", md: "flex-start" }, flexWrap: "wrap", mb: 1 }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    fontSize: { xs: 28, sm: 32, md: 36 },
                    background: (t) => t.palette.mode === "dark"
                      ? "linear-gradient(135deg, #8b9aff 0%, #9775d4 100%)"
                      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    lineHeight: 1.2,
                  }}
                >
                  {[userDetails?.firstName, userDetails?.lastName].filter(Boolean).join(" ") || userDetails?.username || "User"}
                </Typography>
              </Box>
              
              {/* Username */}
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                  mb: 1.5, 
                  fontSize: 15,
                  fontWeight: 500,
                }}
              >
                @{userDetails?.username || userDetails?.email || "user"}
              </Typography>
              
              {/* Email if different from username */}
              {userDetails?.email && userDetails?.email !== userDetails?.username && (
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 2, 
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    justifyContent: { xs: "center", md: "flex-start" },
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
                spacing={1}
                sx={{ 
                  mb: 2.5, 
                  justifyContent: { xs: "center", md: "flex-start" }, 
                  flexWrap: "wrap", 
                  gap: 1.5,
                }}
              >
                {userDetails?.city && (
                  <Chip 
                    icon={<LocationOnIcon sx={{ fontSize: 16 }} />}
                    label={userDetails.city}
                    size="small"
                    sx={{ 
                      fontWeight: 500,
                      bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                      color: "primary.main",
                      borderRadius: 3,
                      px: 1,
                    }}
                  />
                )}
                {userDetails?.workplace && (
                  <Chip 
                    icon={<WorkIcon sx={{ fontSize: 16 }} />}
                    label={userDetails.workplace}
                    size="small"
                    sx={{ 
                      fontWeight: 500,
                      bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                      color: "primary.main",
                      borderRadius: 3,
                      px: 1,
                    }}
                  />
                )}
                {userDetails?.position && (
                  <Chip 
                    icon={<WorkIcon sx={{ fontSize: 16 }} />}
                    label={userDetails.position}
                    size="small"
                    sx={{ 
                      fontWeight: 500,
                      bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                      color: "primary.main",
                      borderRadius: 3,
                      px: 1,
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
                  borderRadius: 5,
                  p: { xs: 2.5, sm: 3, md: 4 },
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: t.palette.mode === "dark"
                    ? "0 4px 20px rgba(0, 0, 0, 0.3)"
                    : "0 4px 20px rgba(0, 0, 0, 0.06)",
                  backgroundImage: t.palette.mode === "dark"
                    ? "linear-gradient(135deg, rgba(139, 154, 255, 0.03) 0%, rgba(151, 117, 212, 0.03) 100%)"
                    : "linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: t.palette.mode === "dark"
                      ? "0 8px 32px rgba(0, 0, 0, 0.4)"
                      : "0 8px 32px rgba(0, 0, 0, 0.1)",
                    transform: "translateY(-2px)",
                  },
                  position: "sticky",
                  top: 20,
                  maxHeight: "calc(100vh - 40px)",
                  overflowY: "auto",
                })}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: 18, sm: 20 } }}>
                    Giới thiệu
                  </Typography>
                    <IconButton
                      size="small"
                      onClick={() => setEditingAbout(!editingAbout)}
                      sx={{
                        bgcolor: editingAbout ? "primary.main" : alpha("#667eea", 0.1),
                        color: editingAbout ? "white" : "primary.main",
                        "&:hover": {
                          bgcolor: editingAbout ? "primary.dark" : alpha("#667eea", 0.2),
                          transform: "scale(1.1)",
                        },
                        transition: "all 0.2s ease",
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
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
                        label="Phone"
                        value={editProfileData?.phone || ""}
                        onChange={(e) => {
                          setEditProfileData({ ...editProfileData, phone: e.target.value });
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
                        label="Workplace"
                        value={editProfileData?.workplace || ""}
                        onChange={(e) => {
                          setEditProfileData({ ...editProfileData, workplace: e.target.value });
                        }}
                        placeholder="Company Name"
                      />
                      <TextField
                        fullWidth
                        label="Position/Job Title"
                        value={editProfileData?.position || ""}
                        onChange={(e) => {
                          setEditProfileData({ ...editProfileData, position: e.target.value });
                        }}
                        placeholder="Senior Developer"
                      />
                      <TextField
                        fullWidth
                        label="Education"
                        value={editProfileData?.education || ""}
                        onChange={(e) => {
                          setEditProfileData({ ...editProfileData, education: e.target.value });
                        }}
                        placeholder="University, Degree"
                      />
                      <TextField
                        fullWidth
                        select
                        label="Relationship Status"
                        value={editProfileData?.relationship || ""}
                        onChange={(e) => {
                          setEditProfileData({ ...editProfileData, relationship: e.target.value });
                        }}
                        SelectProps={{
                          native: true,
                        }}
                      >
                        <option value="">Select...</option>
                        <option value="Single">Single</option>
                        <option value="In a relationship">In a relationship</option>
                        <option value="Engaged">Engaged</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Prefer not to say">Prefer not to say</option>
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
                    <Stack spacing={3}>
                      {userDetails?.city && (
                        <>
                          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                            <LocationOnIcon sx={{ color: "primary.main", mt: 0.5 }} />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                Lives in
                              </Typography>
                              <Typography variant="body1" fontWeight={600}>
                                {userDetails.city}
                              </Typography>
                            </Box>
                          </Box>
                          <Divider />
                        </>
                      )}

                      {userDetails?.dob && (
                        <>
                          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                            <CakeIcon sx={{ color: "primary.main", mt: 0.5 }} />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                Date of Birth
                              </Typography>
                              <Typography variant="body1" fontWeight={600}>
                                {new Date(userDetails.dob).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                          <Divider />
                        </>
                      )}

                      {userDetails?.email && (
                        <>
                          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                            <WorkIcon sx={{ color: "primary.main", mt: 0.5 }} />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                Email
                              </Typography>
                              <Typography variant="body1" fontWeight={600}>
                                {userDetails.email}
                              </Typography>
                            </Box>
                          </Box>
                          <Divider />
                        </>
                      )}

                      {userDetails?.phone && (
                        <>
                          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                            <PhoneIcon sx={{ color: "primary.main", mt: 0.5 }} />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                Phone
                              </Typography>
                              <Typography variant="body1" fontWeight={600}>
                                {userDetails.phone}
                              </Typography>
                            </Box>
                          </Box>
                          <Divider />
                        </>
                      )}

                      {userDetails?.website && (
                        <>
                          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                            <LanguageIcon sx={{ color: "primary.main", mt: 0.5 }} />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                Website
                              </Typography>
                              <Typography variant="body1" fontWeight={600}>
                                <a 
                                  href={userDetails.website.startsWith('http') ? userDetails.website : `https://${userDetails.website}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: 'inherit', textDecoration: 'none' }}
                                >
                                  {userDetails.website}
                                </a>
                              </Typography>
                            </Box>
                          </Box>
                          <Divider />
                        </>
                      )}

                      {userDetails?.workplace && (
                        <>
                          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                            <BusinessIcon sx={{ color: "primary.main", mt: 0.5 }} />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                Workplace
                              </Typography>
                              <Typography variant="body1" fontWeight={600}>
                                {userDetails.workplace}
                              </Typography>
                            </Box>
                          </Box>
                          <Divider />
                        </>
                      )}

                      {userDetails?.position && (
                        <>
                          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                            <WorkIcon sx={{ color: "primary.main", mt: 0.5 }} />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                Position
                              </Typography>
                              <Typography variant="body1" fontWeight={600}>
                                {userDetails.position}
                              </Typography>
                            </Box>
                          </Box>
                          <Divider />
                        </>
                      )}

                      {userDetails?.education && (
                        <>
                          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                            <SchoolIcon sx={{ color: "primary.main", mt: 0.5 }} />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                Education
                              </Typography>
                              <Typography variant="body1" fontWeight={600}>
                                {userDetails.education}
                              </Typography>
                            </Box>
                          </Box>
                          <Divider />
                        </>
                      )}

                      {userDetails?.relationship && (
                        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                          <FavoriteIcon sx={{ color: "primary.main", mt: 0.5 }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Relationship
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {userDetails.relationship}
                            </Typography>
                          </Box>
                        </Box>
                      )}
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
    </Scene>
  );
}
