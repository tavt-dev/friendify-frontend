import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Card, CircularProgress, Typography, Fab, Popover, TextField,
  Button, Snackbar, Alert, Avatar, Paper, Divider, IconButton,
  FormControl, Select, MenuItem, InputLabel, Chip, Stack
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import ImageIcon from "@mui/icons-material/Image";
import VideocamIcon from "@mui/icons-material/Videocam";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import { logOut } from "../services/identityService";
import { getPublicPosts, createPost, updatePost } from "../services/postService";
import { useUser } from "../contexts/UserContext";
import { getApiUrl, API_ENDPOINTS } from "../config/apiConfig";
import { getToken } from "../services/localStorageService";
import Scene from "./Scene";
import Post from "../components/Post";
import RightSidebar from "../components/RightSidebar";
import MediaUpload from "../components/MediaUpload";

export default function Home() {
  const { user } = useUser();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const observer = useRef();
  const lastPostElementRef = useRef();
  const [anchorEl, setAnchorEl] = useState(null);
  const [newPostContent, setNewPostContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [postPrivacy, setPostPrivacy] = useState("PUBLIC"); // Default: PUBLIC
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const mediaUploadRef = useRef();

  const navigate = useNavigate();

  const handleCreatePostClick = (e) => setAnchorEl(e.currentTarget);

  const handleClosePopover = () => {
    setAnchorEl(null);
    setNewPostContent("");
    setMediaFiles([]);
    setPostPrivacy("PUBLIC"); // Reset to default
    if (mediaUploadRef.current) {
      mediaUploadRef.current.clear();
    }
  };

  const handleSnackbarClose = (_, r) => {
    if (r !== "clickaway") setSnackbarOpen(false);
  };

  const handleEditPost = async (postId, newContent, newPrivacy) => {
    try {
      setLoading(true);
      const postData = {
        content: newContent,
        privacy: newPrivacy,
      };
      
      const response = await updatePost(postId, postData);
      const updatedPost = response.data?.result || response.data;
      
      if (updatedPost) {
        setPosts((prev) => prev.map((p) => 
          p.id === postId 
            ? { 
                ...p, 
                content: updatedPost.content || newContent,
                privacy: updatedPost.privacy || newPrivacy,
              } 
            : p
        ));
        setSnackbarMessage("Đã cập nhật bài viết thành công!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error updating post:', error);
      setSnackbarMessage("Không thể cập nhật bài viết. Vui lòng thử lại.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = (id) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setSnackbarMessage("Đã xóa bài viết thành công!");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const open = Boolean(anchorEl);
  const popoverId = open ? "post-popover" : undefined;

  useEffect(() => {
    // Reset posts when page changes to 1
    if (page === 1) {
      setPosts([]);
    }
    loadPosts(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const loadPosts = async (page) => {
    setLoading(true);
    try {
      const res = await getPublicPosts(page, 10); // Load 10 posts per page
        console.log('=== Response from getPublicPosts ===');
        console.log('Full response:', res);
        console.log('Response data:', res.data);
        console.log('Response data.result:', res.data?.result);
        
        // Backend returns: ApiResponse<PageResponse<PostResponse>>
        // Based on old code: response.data.result.data (posts array) and response.data.result.totalPages
        // Format: { data: { result: { data: [...], totalPages: ... } } }
        
        let pageData = null;
        let newPosts = [];
        
        // Check for format: { data: { result: { data: [...], totalPages: ... } } }
        if (res.data?.result) {
          pageData = res.data.result;
          console.log('Found result in data.result:', pageData);
          console.log('Result keys:', Object.keys(pageData || {}));
          
          // Try to get posts from result.data (old format)
          if (pageData.data && Array.isArray(pageData.data)) {
            newPosts = pageData.data;
            setTotalPages(pageData.totalPages || 1);
            console.log('✓ Found posts in result.data:', newPosts.length, 'Total pages:', pageData.totalPages);
          }
          // Try to get posts from result.content (standard PageResponse format)
          else if (pageData.content && Array.isArray(pageData.content)) {
            newPosts = pageData.content;
            setTotalPages(pageData.totalPages || 1);
            console.log('✓ Found posts in result.content:', newPosts.length, 'Total pages:', pageData.totalPages);
          }
          // If result is directly an array
          else if (Array.isArray(pageData)) {
            newPosts = pageData;
            setTotalPages(1);
            console.log('✓ Result is array, posts count:', newPosts.length);
          }
        } 
        // Fallback: direct PageResponse in data
        else if (res.data?.content) {
          pageData = res.data;
          newPosts = pageData.content;
          setTotalPages(pageData.totalPages || 1);
          console.log('✓ Found content directly in data:', newPosts.length);
        }
        // Fallback: data is the PageResponse
        else if (res.data && typeof res.data === 'object') {
          pageData = res.data;
          if (Array.isArray(pageData)) {
            newPosts = pageData;
            setTotalPages(1);
            console.log('✓ Data is array, posts count:', newPosts.length);
          } else if (pageData.data && Array.isArray(pageData.data)) {
            newPosts = pageData.data;
            setTotalPages(pageData.totalPages || 1);
            console.log('✓ Found posts in data.data:', newPosts.length);
          } else if (pageData.content && Array.isArray(pageData.content)) {
            newPosts = pageData.content;
            setTotalPages(pageData.totalPages || 1);
            console.log('✓ Found posts in data.content:', newPosts.length);
          }
        }
        
        // Fetch avatars for all unique user IDs
        const uniqueUserIds = [...new Set(newPosts.map(p => p.userId).filter(Boolean))];
        const avatarMap = new Map();
        
        // Fetch avatars in parallel - but skip if no valid user IDs
        // Use default avatar if fetch fails
        const defaultAvatar = "https://ui-avatars.com/api/?name=User&background=667eea&color=fff&size=128";
        let avatarPromises = [];
        
        if (uniqueUserIds.length > 0) {
          avatarPromises = uniqueUserIds
            .filter(userId => {
              // Validate userId - must be a non-empty string
              if (!userId) return false;
              const strId = String(userId).trim();
              if (!strId || strId.length === 0) return false;
              // Check if it looks like a valid ID (not empty, not just whitespace)
              return strId.length > 0 && strId !== 'undefined' && strId !== 'null';
            })
            .map(async (userId) => {
              try {
                // Ensure userId is a clean string
                const cleanUserId = String(userId).trim();
                
                // Build endpoint safely
                const endpoint = API_ENDPOINTS.USER.GET_PROFILE.replace(':id', encodeURIComponent(cleanUserId));
                const url = getApiUrl(endpoint);
                
                // Validate URL before making request
                if (!url || !url.includes('/profile/')) {
                  // Use default avatar if URL is invalid
                  avatarMap.set(userId, defaultAvatar);
                  return;
                }
                
                const response = await fetch(url, {
                  headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json',
                  },
                });
                
                if (response.ok) {
                  const data = await response.json();
                  const avatar = data?.result?.avatar || data?.data?.avatar || data?.avatar || null;
                  // Use avatar if found, otherwise use default
                  avatarMap.set(userId, avatar || defaultAvatar);
                } else {
                  // Use default avatar if fetch fails (404, etc.)
                  avatarMap.set(userId, defaultAvatar);
                }
              } catch (error) {
                // Use default avatar on error
                avatarMap.set(userId, defaultAvatar);
              }
            });
          
          // Wait for all avatar fetches to complete
          await Promise.all(avatarPromises);
        }
        
        // Debug: Log avatar map
        console.log('Avatar map after fetch:', Array.from(avatarMap.entries()));
        console.log('Unique user IDs:', uniqueUserIds);
        
        // Map posts to format expected by Post component
        // Post component needs: { id, avatar, username, created, content, media }
        const mappedPosts = newPosts.map((post) => {
          // Map imageUrls to media format for MediaCarousel
          // imageUrls is array of strings (URLs)
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
          
          // Get avatar from map or fallback, use default if none found
          const defaultAvatar = "https://ui-avatars.com/api/?name=" + encodeURIComponent(post.username || post.userName || 'User') + "&background=667eea&color=fff&size=128";
          
          // Try to get avatar from map first
          let avatar = avatarMap.get(post.userId);
          
          // If not in map, try other sources
          if (!avatar) {
            avatar = post.avatar || 
                     post.userAvatar || 
                     post.user?.avatar || 
                     post.userProfile?.avatar || 
                     null;
          }
          
          // If still no avatar, use default
          if (!avatar) {
            avatar = defaultAvatar;
          }
          
          // Debug log for first post
          if (post.id === newPosts[0]?.id) {
            console.log('First post avatar mapping:', {
              userId: post.userId,
              avatarFromMap: avatarMap.get(post.userId),
              avatarFromPost: post.avatar,
              finalAvatar: avatar
            });
          }
          
          return {
            id: post.id,
            avatar: avatar,
            username: post.username || post.userName || post.user?.username || 'Unknown',
            created: created,
            content: post.content || '',
            media: media,
            userId: post.userId,
            privacy: post.privacy || 'PUBLIC', // Ensure privacy is included
            // Keep original post data for other uses
            ...post,
          };
        });
        
        // Update posts state
        if (mappedPosts && mappedPosts.length > 0) {
          console.log('✓ Setting posts:', mappedPosts.length, 'posts');
          console.log('Sample post:', mappedPosts[0]);
          setPosts((prev) => {
            // Avoid duplicates when loading page 1
            if (page === 1) {
              console.log('✓ Setting new posts (page 1):', mappedPosts.length);
              return mappedPosts;
            }
            // Filter out duplicates based on post ID
            const existingIds = new Set(prev.map(p => p.id));
            const uniqueNewPosts = mappedPosts.filter(p => !existingIds.has(p.id));
            console.log('✓ Adding unique posts:', uniqueNewPosts.length, 'from', mappedPosts.length);
            return [...prev, ...uniqueNewPosts];
          });
        } else {
          console.log('✗ No posts found in response');
          if (page === 1) {
            console.log('Clearing posts (page 1, no posts)');
            setPosts([]);
          }
        }
      } catch (error) {
        console.error('Error loading posts:', error);
        console.error('Error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        
        if (error.response?.status === 401) {
          logOut();
          navigate("/login");
        } else {
          setSnackbarMessage("Không thể tải bài viết. Vui lòng thử lại.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        }
        
        // Clear posts on error for first page
        if (page === 1) {
          setPosts([]);
        }
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading && page < totalPages) {
        setPage((prev) => prev + 1);
      }
    });

    if (lastPostElementRef.current) {
      observer.current.observe(lastPostElementRef.current);
    }

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [posts, loading, page, totalPages]);

  const handlePostContent = async () => {
    if (!newPostContent.trim() && mediaFiles.length === 0) return;

    setAnchorEl(null);
    setLoading(true);

    try {
      const postData = {
        content: newPostContent.trim() || undefined,
        images: mediaFiles.filter(file => file.type.startsWith("image/")),
        privacy: postPrivacy, // Add privacy setting
      };

      const response = await createPost(postData);
      
      // Handle different response formats
      const newPost = response.data?.result || response.data;
      
      console.log('Post created successfully:', newPost);
      
      if (newPost) {
        // Add new post to the beginning of the list
        setPosts((prev) => {
          // Check if post already exists (avoid duplicates)
          const exists = prev.some(p => p.id === newPost.id);
          if (exists) {
            return prev;
          }
          return [newPost, ...prev];
        });
        
        setNewPostContent("");
        setMediaFiles([]);
        if (mediaUploadRef.current) {
          mediaUploadRef.current.clear();
        }
        setSnackbarMessage("Đã tạo bài viết thành công!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      } else {
        // Even if response format is unexpected, try to reload
        console.warn('Unexpected response format, reloading posts...');
        setPage(1);
        loadPosts(1);
        setNewPostContent("");
        setMediaFiles([]);
        if (mediaUploadRef.current) {
          mediaUploadRef.current.clear();
        }
        setSnackbarMessage("Đã tạo bài viết thành công!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setSnackbarMessage("Không thể tạo bài viết. Vui lòng thử lại.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Scene>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          maxWidth: 1440,
          mx: "auto",
          gap: 3,
          px: { xs: 0, md: 2 },
          pb: { xs: 2, md: 0 },
          alignItems: "flex-start",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 680,
            flex: "1 1 auto",
            minWidth: 0,
          }}
        >
          {/* Create Post Composer */}
          <Paper
            elevation={0}
            sx={(t) => ({
              mb: { xs: 2, sm: 2.5, md: 3 },
              borderRadius: { xs: 3, sm: 4, md: 5 },
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              p: { xs: 1.5, sm: 2, md: 2.5 },
              position: "relative",
              overflow: "hidden",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              backgroundImage: t.palette.mode === "dark"
                ? "linear-gradient(135deg, rgba(139, 154, 255, 0.03) 0%, rgba(151, 117, 212, 0.03) 100%)"
                : "linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%)",
              boxShadow: t.palette.mode === "dark"
                ? "0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
                : "0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
              "&:hover": {
                boxShadow: t.palette.mode === "dark"
                  ? "0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
                  : "0 8px 24px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 1)",
                borderColor: alpha(t.palette.primary.main, 0.35),
                transform: "translateY(-2px)",
              },
            })}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 1.5 }, mb: { xs: 1.5, sm: 2 } }}>
              <Avatar
                src={user?.avatar}
                sx={(t) => ({
                  width: { xs: 40, sm: 44, md: 48 },
                  height: { xs: 40, sm: 44, md: 48 },
                  border: { xs: "2px solid", sm: "3px solid" },
                  borderColor: t.palette.mode === "dark"
                    ? alpha(t.palette.primary.main, 0.3)
                    : alpha(t.palette.primary.main, 0.2),
                  background: t.palette.mode === "dark"
                    ? "linear-gradient(135deg, #8b9aff 0%, #9775d4 100%)"
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  boxShadow: t.palette.mode === "dark"
                    ? "0 4px 12px rgba(139, 154, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.2)"
                    : "0 4px 12px rgba(102, 126, 234, 0.25), inset 0 -2px 4px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease",
                  fontSize: { xs: "1rem", sm: "1.1rem", md: "1.2rem" },
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: t.palette.mode === "dark"
                      ? "0 6px 16px rgba(139, 154, 255, 0.4)"
                      : "0 6px 16px rgba(102, 126, 234, 0.35)",
                  },
                })}
              >
                {user?.firstName?.[0] || user?.username?.[0] || "U"}
              </Avatar>
              <TextField
                fullWidth
                placeholder="Bạn đang nghĩ gì?"
                onClick={handleCreatePostClick}
                variant="outlined"
                sx={{
                  cursor: "pointer",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: { xs: 5, sm: 6 },
                    fontSize: { xs: 14, sm: 15 },
                    bgcolor: (t) =>
                      t.palette.mode === "dark"
                        ? alpha(t.palette.common.white, 0.04)
                        : alpha(t.palette.common.black, 0.02),
                    "& fieldset": { borderColor: "divider" },
                    "&:hover fieldset": { borderColor: "primary.main" },
                    "&.Mui-focused fieldset": {
                      borderColor: "primary.main",
                      borderWidth: 2,
                    },
                  },
                  "& .MuiInputBase-input": {
                    cursor: "pointer",
                  },
                }}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Box>

            <Divider sx={{ mb: 1.5 }} />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
              }}
            >
              <IconButton
                onClick={handleCreatePostClick}
                sx={(t) => ({
                  color: "#45bd62",
                  borderRadius: 2.5,
                  px: { xs: 1, sm: 1.5, md: 2 },
                  py: { xs: 0.75, sm: 1 },
                  gap: { xs: 0.5, sm: 1 },
                  flex: 1,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: alpha("#45bd62", 0.08),
                    transform: "scale(1.02)",
                  },
                })}
              >
                <ImageIcon sx={{ fontSize: { xs: 20, sm: 22, md: 24 } }} />
                <Box
                  component="span"
                  sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    display: { xs: "none", sm: "inline" },
                  }}
                >
                  Ảnh
                </Box>
              </IconButton>

              <IconButton
                onClick={handleCreatePostClick}
                sx={(t) => ({
                  color: "#f3425f",
                  borderRadius: 2.5,
                  px: { xs: 1, sm: 1.5, md: 2 },
                  py: { xs: 0.75, sm: 1 },
                  gap: { xs: 0.5, sm: 1 },
                  flex: 1,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: alpha("#f3425f", 0.08),
                    transform: "scale(1.02)",
                  },
                })}
              >
                <VideocamIcon sx={{ fontSize: { xs: 20, sm: 22, md: 24 } }} />
                <Box
                  component="span"
                  sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    display: { xs: "none", sm: "inline" },
                  }}
                >
                  Video
                </Box>
              </IconButton>

              <IconButton
                onClick={handleCreatePostClick}
                sx={(t) => ({
                  color: "#f7b928",
                  borderRadius: 2.5,
                  px: { xs: 1, sm: 1.5, md: 2 },
                  py: { xs: 0.75, sm: 1 },
                  gap: { xs: 0.5, sm: 1 },
                  flex: 1,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: alpha("#f7b928", 0.08),
                    transform: "scale(1.02)",
                  },
                })}
              >
                <EmojiEmotionsIcon sx={{ fontSize: { xs: 20, sm: 22, md: 24 } }} />
                <Box
                  component="span"
                  sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    display: { xs: "none", sm: "inline" },
                  }}
                >
                  Cảm xúc
                </Box>
              </IconButton>
            </Box>
          </Paper>

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
                  currentUserId={user?.id || user?.userId}
                  onEdit={handleEditPost}
                  onDelete={handleDeletePost}
                />
              </Box>
            );
          })}

          {loading && (
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

          {!loading && posts.length === 0 && (
            <Box 
              sx={{ 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                py: 8,
                px: 2
              }}
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
                    fontSize: 48,
                    color: "primary.main",
                  }}
                >
                  📝
                </Typography>
              </Box>
              <Typography 
                sx={{ 
                  fontSize: 18, 
                  color: "text.primary", 
                  fontWeight: 700, 
                  mb: 1,
                  textAlign: "center"
                }}
              >
                Chưa có bài viết nào
              </Typography>
              <Typography 
                sx={{ 
                  fontSize: 14, 
                  color: "text.secondary",
                  textAlign: "center",
                  maxWidth: 400
                }}
              >
                Hãy tạo bài viết đầu tiên hoặc kết bạn để xem bài viết từ bạn bè
              </Typography>
            </Box>
          )}

          {!loading && posts.length > 0 && page >= totalPages && (
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
              <Typography 
                sx={{ 
                  fontSize: 14, 
                  color: "text.secondary", 
                  fontWeight: 500 
                }}
              >
                Bạn đã xem hết bảng tin
              </Typography>
              <Typography 
                sx={{ 
                  fontSize: 12, 
                  color: "text.disabled" 
                }}
              >
                Đã hiển thị {posts.length} bài viết
              </Typography>
            </Box>
          )}
        </Box>

        <Box
          sx={{
            display: { xs: "none", lg: "block" },
            width: 320,
            flexShrink: 0,
          }}
        >
          <RightSidebar />
        </Box>
      </Box>

      {/* button tạo post */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleCreatePostClick}
        sx={(t) => ({
          position: "fixed",
          bottom: { xs: 80, md: 32 },
          right: { xs: 16, md: 32 },
          width: { xs: 56, md: 64 },
          height: { xs: 56, md: 64 },
          background: t.palette.mode === "dark"
            ? "linear-gradient(135deg, #8b9aff 0%, #9775d4 100%)"
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          boxShadow: t.palette.mode === "dark"
            ? "0 8px 32px rgba(139, 154, 255, 0.4), 0 4px 16px rgba(0, 0, 0, 0.5)"
            : "0 8px 32px rgba(102, 126, 234, 0.4), 0 4px 16px rgba(0, 0, 0, 0.2)",
          "&:hover": {
            background: t.palette.mode === "dark"
              ? "linear-gradient(135deg, #7a89e6 0%, #8664bb 100%)"
              : "linear-gradient(135deg, #5568d3 0%, #63428a 100%)",
            transform: "scale(1.15) rotate(90deg)",
            boxShadow: t.palette.mode === "dark"
              ? "0 12px 48px rgba(139, 154, 255, 0.5), 0 6px 24px rgba(0, 0, 0, 0.6)"
              : "0 12px 48px rgba(102, 126, 234, 0.5), 0 6px 24px rgba(0, 0, 0, 0.3)",
          },
          "&:active": {
            transform: "scale(1.05) rotate(90deg)",
          },
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        })}
      >
        <AddIcon sx={{ fontSize: 28 }} />
      </Fab>

      <Popover
        id={popoverId}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transformOrigin={{ vertical: "bottom", horizontal: "center" }}
        slotProps={{
          paper: {
            sx: (t) => ({
              borderRadius: 4,
              p: 3.5,
              width: 620,
              maxWidth: "90vw",
              maxHeight: "85vh",
              overflow: "auto",
              boxShadow: t.palette.mode === "dark"
                ? "0 20px 80px rgba(0, 0, 0, 0.7), 0 8px 32px rgba(0, 0, 0, 0.6)"
                : "0 20px 80px rgba(0, 0, 0, 0.2), 0 8px 32px rgba(0, 0, 0, 0.12)",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              backdropFilter: "blur(20px)",
              backgroundImage: t.palette.mode === "dark"
                ? "linear-gradient(135deg, rgba(28, 30, 36, 0.98) 0%, rgba(28, 30, 36, 1) 100%)"
                : "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 1) 100%)",
            }),
          },
        }}
      >
        <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 700, fontSize: 19, color: "text.primary" }}>
          Tạo bài viết mới
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="Bạn đang nghĩ gì?"
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          variant="outlined"
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              fontSize: 14.5,
              bgcolor: (t) => (t.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "background.paper"),
              "& fieldset": { borderColor: "divider" },
              "&:hover fieldset": { borderColor: "primary.main" },
              "&.Mui-focused fieldset": { borderColor: "primary.main", borderWidth: 2 },
            },
          }}
        />

        <MediaUpload
          ref={mediaUploadRef}
          onFilesChange={setMediaFiles}
          maxFiles={8}
          addButtonLabel="Thêm ảnh hoặc video"
        />

        {/* Privacy Selector */}
        <Box sx={{ mt: 2.5, mb: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="privacy-select-label" sx={{ fontSize: 14 }}>
              Quyền riêng tư
            </InputLabel>
            <Select
              labelId="privacy-select-label"
              id="privacy-select"
              value={postPrivacy}
              label="Quyền riêng tư"
              onChange={(e) => setPostPrivacy(e.target.value)}
              sx={{
                borderRadius: 2,
                fontSize: 14,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "divider",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.main",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.main",
                  borderWidth: 2,
                },
              }}
            >
              <MenuItem value="PUBLIC">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip 
                    label="Công khai" 
                    size="small" 
                    color="primary"
                    sx={{ 
                      height: 24,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                    Mọi người có thể xem
                  </Typography>
                </Stack>
              </MenuItem>
              <MenuItem value="PRIVATE">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip 
                    label="Riêng tư" 
                    size="small" 
                    color="default"
                    sx={{ 
                      height: 24,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                    Chỉ bạn mới xem được
                  </Typography>
                </Stack>
              </MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={handleClosePopover}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 3,
              px: 3,
              py: 1,
              fontSize: 14,
              borderColor: "divider",
              color: "text.secondary",
              "&:hover": { borderColor: "divider", backgroundColor: "action.hover" },
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handlePostContent}
            disabled={!newPostContent.trim() && mediaFiles.length === 0}
            sx={(t) => ({
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 3,
              px: 3.5,
              py: 1,
              fontSize: 14,
              background: t.palette.mode === "dark"
                ? "linear-gradient(135deg, #8b9aff 0%, #9775d4 100%)"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: t.palette.mode === "dark"
                ? "0 4px 12px rgba(139, 154, 255, 0.3)"
                : "0 4px 12px rgba(102, 126, 234, 0.3)",
              "&:hover": {
                background: t.palette.mode === "dark"
                  ? "linear-gradient(135deg, #7a89e6 0%, #8664bb 100%)"
                  : "linear-gradient(135deg, #5568d3 0%, #63428a 100%)",
                boxShadow: t.palette.mode === "dark"
                  ? "0 6px 16px rgba(139, 154, 255, 0.4)"
                  : "0 6px 16px rgba(102, 126, 234, 0.4)",
                transform: "translateY(-2px)",
              },
              "&:disabled": {
                background: "action.disabledBackground",
                color: "text.disabled",
                boxShadow: "none",
              },
              transition: "all 0.3s ease",
            })}
          >
            Đăng
          </Button>
        </Box>
      </Popover>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ mt: "64px" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%", borderRadius: 3, boxShadow: 3, fontWeight: 500 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Scene>
  );
}
