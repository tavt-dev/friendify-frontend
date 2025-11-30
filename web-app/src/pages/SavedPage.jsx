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

      // Fetch user profiles for all unique user IDs
      const uniqueUserIds = [...new Set(newPosts.map(p => p.userId).filter(Boolean))];
      const userInfoMap = new Map();
      
      // Fetch user profiles in parallel
      await Promise.all(
        uniqueUserIds.map(async (userId) => {
          try {
            const profile = await getUserProfileById(userId, true);
            const profileData = profile?.data?.result || profile?.data || profile;
            if (profileData) {
              userInfoMap.set(userId, {
                firstName: profileData.firstName || '',
                lastName: profileData.lastName || '',
                avatar: profileData.avatar || null,
                username: profileData.username || '',
              });
            }
          } catch (err) {
            console.warn(`Failed to fetch profile for userId ${userId}:`, err);
          }
        })
      );

      const mappedPosts = newPosts.map((post) => {
        const media = (post.imageUrls || []).map((url) => ({
          url: url,
          type: 'image',
          alt: `Post image ${post.id}`,
        }));
        
        const created = formatTimeAgo(post.createdDate || post.created);
        
        // Get user info from map or post data
        const userInfo = userInfoMap.get(post.userId) || {};
        
        // Get display name: lastName firstName if available, otherwise username
        const displayName = userInfo.firstName && userInfo.lastName
          ? `${userInfo.lastName} ${userInfo.firstName}`.trim()
          : userInfo.firstName || userInfo.lastName || post.username || post.userName || post.user?.username || 'Unknown';
        
        // Get display name for default avatar generation
        const displayNameForAvatar = displayName || 'User';
        const postDefaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayNameForAvatar)}&background=667eea&color=fff&size=128`;
        
        // Priority: userAvatar from post response (most up-to-date) > userInfoMap > other fields > default
        // Same priority as HomePage - check all possible avatar fields from post response
        let avatar = post.userAvatar ||  // Backend trả về trong PostResponse (most up-to-date)
                     post.avatar || 
                     post.userAvatarUrl ||
                     post.user?.avatar || 
                     post.user?.avatarUrl ||
                     post.userProfile?.avatar ||
                     post.userProfile?.avatarUrl ||
                     userInfoMap.get(post.userId)?.avatar ||  // Fallback to fetched profile avatar
                     postDefaultAvatar;
        
        // Clean avatar: if empty or whitespace, set to null so Post component can generate initials
        if (avatar && typeof avatar === 'string' && avatar.trim() === '') {
          avatar = null;
        }
        
        // Get userId from multiple possible sources
        const postUserId = post.userId || post.user?.id || post.user?.userId;
        
        // Build formatted post object - put formatted fields AFTER spread to ensure they override
        const formattedPost = {
          ...post, // Spread original post data first
          id: post.id,
          avatar: avatar, // Override with formatted avatar
          username: post.username || post.userName || post.user?.username || userInfo.username || 'Unknown',
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
        };
        
        return formattedPost;
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
