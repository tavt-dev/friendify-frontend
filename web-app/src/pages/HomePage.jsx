import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Card, CircularProgress, Typography,
  Button, Snackbar, Alert, Paper, Divider, IconButton,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { logOut } from "../services/identityService";
import { getPublicPosts, updatePost } from "../services/postService";
import { useUser } from "../contexts/UserContext";
import { getApiUrl, API_ENDPOINTS } from "../config/apiConfig";
import { getToken } from "../services/localStorageService";
import { extractArrayFromResponse } from "../utils/apiHelper";
import { getUserProfileById } from "../services/userService";
import PageLayout from "./PageLayout";
import Post from "../components/Post";
import RightSidebar from "../components/RightSidebar";
import CreatePostButton from "../components/CreatePostButton";

export default function HomePage() {
  const { user } = useUser();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const observer = useRef();
  const lastPostElementRef = useRef();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [cursor, setCursor] = useState({ x: 50, y: 50 });
  const cursorUpdateRef = useRef(null);
  const lastCursorUpdateRef = useRef(0);
  const [enableCursorTracking, setEnableCursorTracking] = useState(false); // Disable by default for performance

  const navigate = useNavigate();

  const handleMouseMove = useCallback((e) => {
    // Only track cursor if enabled (for better performance)
    if (!enableCursorTracking) return;
    
    const now = Date.now();
    // Throttle cursor updates to reduce lag (300ms for better performance)
    if (now - lastCursorUpdateRef.current < 300) {
      return;
    }
    lastCursorUpdateRef.current = now;

    if (cursorUpdateRef.current) {
      cancelAnimationFrame(cursorUpdateRef.current);
    }

    cursorUpdateRef.current = requestAnimationFrame(() => {
      const x = Math.round((e.clientX / window.innerWidth) * 100);
      const y = Math.round((e.clientY / window.innerHeight) * 100);
      setCursor({ x, y });
    });
  }, [enableCursorTracking]);

  useEffect(() => {
    return () => {
      if (cursorUpdateRef.current) {
        cancelAnimationFrame(cursorUpdateRef.current);
      }
    };
  }, []);

  const handlePostCreated = (formattedPost) => {
    setPosts((prev) => {
      const exists = prev.some(p => p.id === formattedPost.id);
      if (exists) return prev;
      return [formattedPost, ...prev];
    });
    setSnackbarMessage("Đã tạo bài viết thành công!");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
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

  const handleSharePost = (sharedPost) => {
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
        avatar: user?.avatar && user.avatar.trim() !== '' ? user.avatar : null,
        username: user?.username || 'Unknown',
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        displayName: user?.lastName && user?.firstName 
          ? `${user.lastName} ${user.firstName}`.trim()
          : user?.firstName || user?.lastName || user?.username || 'Unknown',
        created: formatTimeAgo(sharedPost.createdDate || sharedPost.created),
        content: sharedPost.content || '',
        media: media,
        userId: user?.id || user?.userId,
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
      
      setSnackbarMessage("Đã chia sẻ bài viết thành công!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    }
  };


  useEffect(() => {
    // Reset posts when page changes to 1
    if (page === 1) {
      setPosts([]);
    }
    loadPosts(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Cache for avatars to avoid repeated API calls
  const avatarCacheRef = useRef(new Map());
  const userInfoCacheRef = useRef(new Map());

  const loadPosts = async (page) => {
    setLoading(true);
    try {
      const res = await getPublicPosts(page, 10);
      const { items: newPosts, totalPages: totalPagesCount } = extractArrayFromResponse(res.data);
      setTotalPages(totalPagesCount);
        
      // Fetch avatars and user info for all unique user IDs (only if not cached)
      const uniqueUserIds = [...new Set(newPosts.map(p => p.userId).filter(Boolean))];
      const avatarMap = new Map();
      const userInfoMap = new Map();
      const defaultAvatar = "https://ui-avatars.com/api/?name=User&background=667eea&color=fff&size=128";
      
      // Get cached data first
      uniqueUserIds.forEach(userId => {
        if (avatarCacheRef.current.has(userId)) {
          avatarMap.set(userId, avatarCacheRef.current.get(userId));
        }
        if (userInfoCacheRef.current.has(userId)) {
          userInfoMap.set(userId, userInfoCacheRef.current.get(userId));
        }
      });
      
      // Only fetch avatars for users not in cache
      const uncachedUserIds = uniqueUserIds.filter(userId => !avatarCacheRef.current.has(userId));
      
      if (uncachedUserIds.length > 0) {
        // Batch requests with limit to avoid too many concurrent requests
        const batchSize = 5;
        for (let i = 0; i < uncachedUserIds.length; i += batchSize) {
          const batch = uncachedUserIds.slice(i, i + batchSize);
          
          const avatarPromises = batch
            .filter(userId => {
              const strId = String(userId).trim();
              return strId && strId.length > 0 && strId !== 'undefined' && strId !== 'null';
            })
            .map(async (userId) => {
              try {
                const cleanUserId = String(userId).trim();
                
                // Use getUserProfileById with suppress404 to avoid console errors
                const response = await getUserProfileById(cleanUserId, true);
                
                // Handle response - check if data exists and is not null
                if (response && response.data !== null && response.data !== undefined) {
                  const userData = response.data?.result || response.data?.data || response.data;
                  
                  // Only process if userData is valid
                  if (userData && typeof userData === 'object') {
                    const avatar = userData?.avatar || null;
                    const finalAvatar = avatar || defaultAvatar;
                    
                    // Cache the results
                    avatarCacheRef.current.set(userId, finalAvatar);
                    avatarMap.set(userId, finalAvatar);
                    
                    // Store firstName and lastName
                    if (userData?.firstName || userData?.lastName) {
                      const userInfo = {
                        firstName: userData.firstName || '',
                        lastName: userData.lastName || '',
                      };
                      userInfoCacheRef.current.set(userId, userInfo);
                      userInfoMap.set(userId, userInfo);
                    }
                    return { userId, success: true };
                  }
                }
                // 404 or no data - use default avatar silently
                avatarCacheRef.current.set(userId, defaultAvatar);
                avatarMap.set(userId, defaultAvatar);
                return { userId, success: false, reason: 'no_data' };
              } catch (error) {
                // Silently fail and use default avatar - don't log 404/400 errors
                if (error?.response?.status !== 404 && error?.response?.status !== 400) {
                  // Only log non-404/400 errors in development
                  if (import.meta.env.DEV) {
                    console.warn(`Failed to load profile for user ${userId}:`, error);
                  }
                }
                avatarCacheRef.current.set(userId, defaultAvatar);
                avatarMap.set(userId, defaultAvatar);
                return { userId, success: false, reason: 'error' };
              }
            });
          
          // Wait for batch to complete before starting next batch
          await Promise.allSettled(avatarPromises);
        }
      }
      
      // Merge cached and newly fetched data
      uniqueUserIds.forEach(userId => {
        if (!avatarMap.has(userId) && avatarCacheRef.current.has(userId)) {
          avatarMap.set(userId, avatarCacheRef.current.get(userId));
        }
        if (!userInfoMap.has(userId) && userInfoCacheRef.current.has(userId)) {
          userInfoMap.set(userId, userInfoCacheRef.current.get(userId));
        }
      });
        
      // Format time ago function (moved outside to avoid recreation)
      const formatTimeAgo = (dateString) => {
        if (!dateString) return 'Vừa xong';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;
        return date.toLocaleDateString('vi-VN');
      };

      const mappedPosts = newPosts.map((post) => {
        const media = (post.imageUrls || []).map((url) => ({
          url: url,
          type: 'image',
          alt: `Post image ${post.id}`,
        }));
        
        const created = formatTimeAgo(post.createdDate || post.created);
        const postDefaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.username || post.userName || 'User')}&background=667eea&color=fff&size=128`;
        
        // Priority: userAvatar from post response (most up-to-date) > avatarMap > other fields > default
        let avatar = post.userAvatar ||  // Backend trả về trong PostResponse
                     post.avatar || 
                     post.user?.avatar || 
                     post.userProfile?.avatar ||
                     avatarMap.get(post.userId) ||  // Fallback to fetched profile avatar
                     postDefaultAvatar;
        
        const userInfo = userInfoMap.get(post.userId) || {};
        
        // Backend đã trả về displayName trong username field (theo PostService.java line 474)
        // Nhưng chúng ta cần firstName/lastName để hiển thị đúng định dạng
        const displayName = userInfo.firstName && userInfo.lastName
          ? `${userInfo.lastName} ${userInfo.firstName}`.trim()
          : userInfo.firstName || userInfo.lastName || post.username || post.userName || post.user?.username || 'Unknown';
        
        // Get userId from multiple possible sources
        const postUserId = post.userId || post.user?.id || post.user?.userId || post.userId;
        
        return {
          id: post.id,
          avatar: avatar && avatar.trim() !== '' ? avatar : null,
          username: post.username || post.userName || post.user?.username || 'Unknown',
          firstName: userInfo.firstName || post.firstName || post.user?.firstName || '',
          lastName: userInfo.lastName || post.lastName || post.user?.lastName || '',
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
      
      // Update posts state
      if (mappedPosts && mappedPosts.length > 0) {
        setPosts((prev) => {
          if (page === 1) {
            return mappedPosts;
          }
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNewPosts = mappedPosts.filter(p => !existingIds.has(p.id));
          return [...prev, ...uniqueNewPosts];
        });
      } else if (page === 1) {
        setPosts([]);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        logOut();
        navigate("/login");
      } else {
        setSnackbarMessage("Không thể tải bài viết. Vui lòng thử lại.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
      
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
    }, {
      rootMargin: '200px', // Start loading earlier
      threshold: 0.1,
    });

    if (lastPostElementRef.current) {
      observer.current.observe(lastPostElementRef.current);
    }

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [posts.length, loading, page, totalPages]); // Only depend on posts.length instead of entire posts array


  return (
    <PageLayout>
      <Box
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setEnableCursorTracking(true)}
        onMouseLeave={() => setEnableCursorTracking(false)}
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          width: "100%",
          maxWidth: { xs: "100%", md: "100%" },
          mx: 0,
          gap: 0,
          px: 0,
          pb: { xs: 2, md: 0 },
          alignItems: "flex-start",
          position: "relative",
        }}
      >
        <Box
          sx={{
            width: "100%",
            flex: "1 1 auto",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            pl: 0,
            pr: { xs: 1, md: 2 },
            minHeight: 0,
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: { xs: "100%", sm: 600, md: 680 },
              display: "flex",
              flexDirection: "column",
            }}
          >

          {posts.map((post, index) => {
            const isLast = posts.length === index + 1;
            return (
              <Box
                key={post.id}
                sx={{
                  // Only animate first few posts to reduce lag
                  animation: index < 5 ? `fadeInUp 0.4s ease ${Math.min(index * 0.08, 0.4)}s both` : 'none',
                  "@keyframes fadeInUp": {
                    from: {
                      opacity: 0,
                      transform: "translateY(10px)",
                    },
                    to: {
                      opacity: 1,
                      transform: "translateY(0)",
                    },
                  },
                  // Optimize rendering
                  willChange: index < 5 ? "transform, opacity" : "auto",
                }}
              >
                <Post
                  ref={isLast ? lastPostElementRef : null}
                  post={post}
                  currentUserId={user?.id || user?.userId}
                  onEdit={handleEditPost}
                  onDelete={handleDeletePost}
                  onShare={handleSharePost}
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

      <CreatePostButton user={user} onPostCreated={handlePostCreated} />

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
    </PageLayout>
  );
}
