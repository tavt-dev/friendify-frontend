import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import PageLayout from "./PageLayout";
import { getSavedPosts, unsavePost } from "../services/postService";
import { extractArrayFromResponse } from "../utils/apiHelper";
import { isAuthenticated } from "../services/identityService";
import { useUser } from "../contexts/UserContext";
import { getUserProfileById } from "../services/userService";
import Post from "../components/Post";

export default function SavedPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const observer = useRef();
  const lastPostElementRef = useRef();

  // Load saved posts
  const loadSavedPosts = useCallback(async (pageNum = 1) => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const response = await getSavedPosts(pageNum, 10);
      const { items: newPosts, totalPages: totalPagesCount } = extractArrayFromResponse(response.data);
      
      // Format posts similar to HomePage to ensure proper display
      const formatTimeAgo = (dateString) => {
        if (!dateString) return 'Vừa xong';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} giờ trước`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays} ngày trước`;
        return date.toLocaleDateString('vi-VN');
      };

      // Fetch avatars and user info for all unique user IDs (same as HomePage)
      const uniqueUserIds = [...new Set(newPosts.map(p => p.userId).filter(Boolean))];
      const avatarMap = new Map();
      const userInfoMap = new Map();
      const defaultAvatar = "https://ui-avatars.com/api/?name=User&background=667eea&color=fff&size=128";
      
      // Batch requests with limit to avoid too many concurrent requests (same as HomePage)
      if (uniqueUserIds.length > 0) {
        const batchSize = 5;
        for (let i = 0; i < uniqueUserIds.length; i += batchSize) {
          const batch = uniqueUserIds.slice(i, i + batchSize);
          
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
                    
                    // Store avatar
                    avatarMap.set(userId, finalAvatar);
                    
                    // Store firstName and lastName
                    if (userData?.firstName || userData?.lastName) {
                      const userInfo = {
                        firstName: userData.firstName || '',
                        lastName: userData.lastName || '',
                      };
                      userInfoMap.set(userId, userInfo);
                    }
                    return { userId, success: true };
                  }
                }
                // 404 or no data - use default avatar silently
                avatarMap.set(userId, defaultAvatar);
                return { userId, success: false, reason: 'no_data' };
              } catch (error) {
                // Silently fail and use default avatar - don't log 404/400 errors
                if (error?.response?.status !== 404 && error?.response?.status !== 400) {
                  // Only log non-404/400 errors in development
                  if (process.env.NODE_ENV === 'development') {
                    console.warn(`Failed to load profile for user ${userId}:`, error);
                  }
                }
                avatarMap.set(userId, defaultAvatar);
                return { userId, success: false, reason: 'error' };
              }
            });
          
          // Wait for batch to complete before starting next batch
          await Promise.allSettled(avatarPromises);
        }
      }

      const mappedPosts = newPosts.map((post) => {
        const media = (post.imageUrls || []).map((url) => ({
          url: url,
          type: 'image',
          alt: `Post image ${post.id}`,
        }));
        
        const created = formatTimeAgo(post.createdDate || post.created);
        
        // Get userId from multiple possible sources
        const postUserId = post.userId || post.user?.id || post.user?.userId || post.userId;
        
        // Get user info from map
        const userInfo = userInfoMap.get(postUserId) || {};
        
        // Priority: userAvatar from post response (most up-to-date) > avatarMap > other fields > default
        // EXACTLY the same as HomePage - check all possible avatar sources from post
        let avatar = post.userAvatar ||  // Backend trả về trong PostResponse (highest priority)
                     post.avatar || 
                     post.user?.avatar || 
                     post.userProfile?.avatar ||
                     avatarMap.get(postUserId) ||  // Fallback to fetched profile avatar
                     null; // Don't use default avatar here, let Post component handle it
        
        // Only use default avatar if absolutely no avatar found
        // But first check if avatar is empty string and clean it
        if (!avatar || (typeof avatar === 'string' && avatar.trim() === '')) {
          avatar = null; // Set to null so Post component can generate initials from name
        }
        
        // Backend đã trả về displayName trong username field (theo PostService.java line 474)
        // Nhưng chúng ta cần firstName/lastName để hiển thị đúng định dạng
        const displayName = userInfo.firstName && userInfo.lastName
          ? `${userInfo.lastName} ${userInfo.firstName}`.trim()
          : userInfo.firstName || userInfo.lastName || post.username || post.userName || post.user?.username || 'Unknown';
        
        return {
          id: post.id,
          avatar: avatar, // Use avatar from post or null (Post component will generate initials)
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
          isSaved: true, // Mark as saved since these are saved posts
          ...post,
        };
      });
      
      if (pageNum === 1) {
        setPosts(mappedPosts);
      } else {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const uniqueNewPosts = mappedPosts.filter((p) => !existingIds.has(p.id));
          return [...prev, ...uniqueNewPosts];
        });
      }
      
      setTotalPages(totalPagesCount || 1);
      setPage(pageNum);
    } catch (error) {
      console.error("Error loading saved posts:", error);
      setSnackbar({
        open: true,
        message: "Không thể tải bài viết đã lưu",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadSavedPosts(1);
  }, [loadSavedPosts]);

  // Infinite scroll
  useEffect(() => {
    if (loading || page >= totalPages) return;

    const currentObserver = observer.current;
    if (lastPostElementRef.current) {
      if (currentObserver) currentObserver.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !loading && page < totalPages) {
            loadSavedPosts(page + 1);
          }
        },
        { threshold: 0.1 }
      );

      observer.current.observe(lastPostElementRef.current);
    }

    return () => {
      if (currentObserver) currentObserver.disconnect();
    };
  }, [posts.length, loading, page, totalPages, loadSavedPosts]);

  const handleUnsavePost = async (postId) => {
    try {
      await unsavePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setSnackbar({
        open: true,
        message: "Đã bỏ lưu bài viết",
        severity: "success",
      });
    } catch (error) {
      console.error("Error unsaving post:", error);
      setSnackbar({
        open: true,
        message: "Không thể bỏ lưu bài viết",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <PageLayout>
      <Box sx={{ width: "100%", maxWidth: 800, mx: "auto", px: 2, py: 2 }}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            p: 3,
            mb: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <BookmarkIcon
              sx={{
                fontSize: 40,
                color: "primary.main",
              }}
            />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Đã lưu
            </Typography>
            {posts.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                ({posts.length} bài viết)
              </Typography>
            )}
          </Box>
        </Paper>

        {/* Posts List */}
        {loading && posts.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : posts.length > 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {posts.map((post, index) => (
              <Box
                key={post.id}
                ref={index === posts.length - 1 ? lastPostElementRef : null}
              >
                <Post
                  post={post}
                  currentUserId={user?.id || user?.userId}
                  onDelete={() => handleUnsavePost(post.id)}
                />
              </Box>
            ))}
            {loading && posts.length > 0 && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
            {!loading && posts.length > 0 && page >= totalPages && (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Đã hiển thị tất cả bài viết đã lưu
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              p: 8,
              textAlign: "center",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <BookmarkBorderIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              Chưa có bài viết nào được lưu
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Lưu bài viết để xem lại sau
            </Typography>
          </Paper>
        )}

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
            sx={{ borderRadius: 2, minWidth: 240, boxShadow: 3 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </PageLayout>
  );
}
