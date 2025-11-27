import { useState, useRef } from "react";
import {
  Box,
  Fab,
  Popover,
  Avatar,
  Typography,
  TextField,
  Button,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
  Chip,
  Stack,
  Zoom,
  Alert,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import MediaUpload from "./MediaUpload";
import { createPost } from "../services/postService";

export default function CreatePostButton({ user, onPostCreated, show = true }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [newPostContent, setNewPostContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [postPrivacy, setPostPrivacy] = useState("PUBLIC");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mediaUploadRef = useRef();

  if (!show || !user) {
    return null;
  }

  const handleCreatePostClick = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
    setNewPostContent("");
    setMediaFiles([]);
    setPostPrivacy("PUBLIC");
    setError(null);
    if (mediaUploadRef.current) {
      mediaUploadRef.current.clear();
    }
  };

  const handlePostContent = async () => {
    if (!newPostContent.trim() && mediaFiles.length === 0) {
      setError("Vui lòng nhập nội dung hoặc thêm ảnh/video");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const hasContent = newPostContent.trim().length > 0;
      const hasImages = mediaFiles.length > 0;

      if (!hasContent && !hasImages) {
        setError("Vui lòng nhập nội dung hoặc thêm ảnh/video");
        setLoading(false);
        return;
      }

      const postData = {
        content: hasContent ? newPostContent.trim() : '',
        images: mediaFiles.filter(file => file.type.startsWith("image/")),
        privacy: postPrivacy,
      };

      // Validate: backend requires at least content OR images
      if (!postData.content && (!postData.images || postData.images.length === 0)) {
        setError("Vui lòng nhập nội dung hoặc thêm ảnh/video");
        setLoading(false);
        return;
      }

      if (import.meta.env.DEV) {
        console.log('Creating post with data:', {
          hasContent,
          content: postData.content,
          contentLength: postData.content.length,
          imageCount: postData.images.length,
          privacy: postPrivacy
        });
      }

      const response = await createPost(postData);
      if (import.meta.env.DEV) {
        console.log('Post creation response:', response);
      }
      
      const newPostData = response.data?.result || response.data;
      
      if (newPostData) {
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
        
        const media = (newPostData.imageUrls || []).map((url) => ({
          url: url,
          type: 'image',
          alt: `Post image ${newPostData.id}`,
        }));
        
        const formattedPost = {
          id: newPostData.id,
          avatar: user?.avatar && user.avatar.trim() !== '' ? user.avatar : null,
          username: user?.username || 'Unknown',
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          displayName: user?.lastName && user?.firstName 
            ? `${user.lastName} ${user.firstName}`.trim()
            : user?.firstName || user?.lastName || user?.username || 'Unknown',
          created: formatTimeAgo(newPostData.createdDate || newPostData.created),
          content: newPostData.content || '',
          media: media,
          userId: user?.id || user?.userId,
          privacy: newPostData.privacy || 'PUBLIC',
          likeCount: newPostData.likeCount || 0,
          commentCount: newPostData.commentCount || 0,
          isLiked: newPostData.isLiked || false,
          ...newPostData,
        };
        
        // Call callback with formatted post
        if (onPostCreated) {
          onPostCreated(formattedPost);
        }
        
        setNewPostContent("");
        setMediaFiles([]);
        if (mediaUploadRef.current) {
          mediaUploadRef.current.clear();
        }
        setError(null);
        // Close popover on success
        setAnchorEl(null);
      } else {
        setError("Không thể tạo bài viết. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error('Error creating post:', error);
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || "Không thể tạo bài viết. Vui lòng thử lại.";
      setError(errorMessage);
      // Keep popover open to show error
    } finally {
      setLoading(false);
    }
  };

  const open = Boolean(anchorEl);
  const popoverId = open ? 'create-post-popover' : undefined;

  const getAvatarInitials = () => {
    if (user?.lastName && user?.firstName) {
      return `${user.lastName.charAt(0)}${user.firstName.charAt(0)}`.toUpperCase();
    }
    if (user?.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    }
    if (user?.lastName) {
      return user.lastName.charAt(0).toUpperCase();
    }
    return user?.username?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U";
  };

  const getDisplayName = () => {
    if (user?.lastName && user?.firstName) {
      return `${user.lastName} ${user.firstName}`.trim();
    }
    if (user?.firstName) {
      return user.firstName;
    }
    if (user?.lastName) {
      return user.lastName;
    }
    return user?.username || user?.email || "User";
  };

  return (
    <>
      <Zoom in={true} timeout={600}>
        <Fab
          color="primary"
          aria-label="add"
          onClick={handleCreatePostClick}
          sx={(t) => ({
            position: "fixed",
            bottom: { xs: 80, md: 32 },
            right: { xs: 20, md: 40 },
            width: { xs: 64, md: 72 },
            height: { xs: 64, md: 72 },
            zIndex: 1000,
            background: "linear-gradient(135deg, #8a2be2 0%, #4a00e0 50%, #8a2be2 100%)",
            backgroundSize: "200% 200%",
            boxShadow: t.palette.mode === "dark"
              ? "0 8px 32px rgba(138, 43, 226, 0.5), 0 4px 16px rgba(0, 0, 0, 0.5), 0 0 0 0 rgba(138, 43, 226, 0.7)"
              : "0 8px 32px rgba(138, 43, 226, 0.4), 0 4px 16px rgba(0, 0, 0, 0.2), 0 0 0 0 rgba(138, 43, 226, 0.5)",
            animation: "gradientShift 3s ease infinite, pulse 2s ease-in-out infinite",
            "@keyframes gradientShift": {
              "0%, 100%": { backgroundPosition: "0% 50%" },
              "50%": { backgroundPosition: "100% 50%" },
            },
            "@keyframes pulse": {
              "0%": { boxShadow: t.palette.mode === "dark" ? "0 8px 32px rgba(138, 43, 226, 0.5), 0 4px 16px rgba(0, 0, 0, 0.5), 0 0 0 0 rgba(138, 43, 226, 0.7)" : "0 8px 32px rgba(138, 43, 226, 0.4), 0 4px 16px rgba(0, 0, 0, 0.2), 0 0 0 0 rgba(138, 43, 226, 0.5)" },
              "50%": { boxShadow: t.palette.mode === "dark" ? "0 8px 32px rgba(138, 43, 226, 0.5), 0 4px 16px rgba(0, 0, 0, 0.5), 0 0 0 8px rgba(138, 43, 226, 0)" : "0 8px 32px rgba(138, 43, 226, 0.4), 0 4px 16px rgba(0, 0, 0, 0.2), 0 0 0 8px rgba(138, 43, 226, 0)" },
              "100%": { boxShadow: t.palette.mode === "dark" ? "0 8px 32px rgba(138, 43, 226, 0.5), 0 4px 16px rgba(0, 0, 0, 0.5), 0 0 0 0 rgba(138, 43, 226, 0)" : "0 8px 32px rgba(138, 43, 226, 0.4), 0 4px 16px rgba(0, 0, 0, 0.2), 0 0 0 0 rgba(138, 43, 226, 0)" },
            },
            "&:hover": {
              backgroundPosition: "100% 50%",
              transform: "scale(1.15) rotate(90deg)",
              boxShadow: t.palette.mode === "dark"
                ? "0 12px 48px rgba(138, 43, 226, 0.6), 0 6px 24px rgba(0, 0, 0, 0.6), 0 0 0 4px rgba(138, 43, 226, 0.2)"
                : "0 12px 48px rgba(138, 43, 226, 0.5), 0 6px 24px rgba(0, 0, 0, 0.3), 0 0 0 4px rgba(138, 43, 226, 0.2)",
            },
            "&:active": {
              transform: "scale(1.05) rotate(90deg)",
            },
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          })}
        >
          <AddIcon sx={{ fontSize: { xs: 32, md: 36 }, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }} />
          <AutoAwesomeIcon 
            sx={{ 
              position: "absolute",
              top: "-10px",
              right: "-10px",
              fontSize: { xs: 24, md: 28 },
              color: "#ffd700",
              animation: "sparkle 2s ease-in-out infinite",
              "@keyframes sparkle": {
                "0%, 100%": { opacity: 0.6, transform: "scale(1) rotate(0deg)" },
                "50%": { opacity: 1, transform: "scale(1.2) rotate(180deg)" },
              },
            }} 
          />
        </Fab>
      </Zoom>

      <Popover
        id={popoverId}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: (t) => ({
            width: { xs: '90vw', sm: 500, md: 600 },
            maxWidth: 600,
            borderRadius: 4,
            p: 3,
            boxShadow: t.palette.mode === "dark"
              ? "0 8px 32px rgba(0, 0, 0, 0.5)"
              : "0 8px 32px rgba(0, 0, 0, 0.15)",
            border: "1px solid",
            borderColor: "divider",
          }),
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2.5 }}>
          <Avatar
            src={user?.avatar && user.avatar.trim() !== '' ? user.avatar : undefined}
            sx={(t) => ({
              width: 48,
              height: 48,
              border: "2px solid",
              borderColor: t.palette.mode === "dark"
                ? alpha(t.palette.primary.main, 0.3)
                : alpha(t.palette.primary.main, 0.2),
              background: t.palette.mode === "dark"
                ? "linear-gradient(135deg, #8b9aff 0%, #9775d4 100%)"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: t.palette.mode === "dark"
                ? "0 4px 12px rgba(139, 154, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.2)"
                : "0 4px 12px rgba(102, 126, 234, 0.25), inset 0 -2px 4px rgba(0, 0, 0, 0.1)",
              fontSize: "1.2rem",
              mr: 1.5,
            })}
          >
            {getAvatarInitials()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18, color: "text.primary", mb: 0.5 }}>
              {getDisplayName()}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: 13, color: "text.secondary" }}>
              @{user?.username || user?.email || "user"}
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

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
              <MenuItem value="PUBLIC" sx={{ fontSize: 14 }}>
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
              <MenuItem value="FRIENDS" sx={{ fontSize: 14 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip 
                    label="Bạn bè" 
                    size="small" 
                    sx={(t) => ({ 
                      height: 24,
                      fontSize: 12,
                      fontWeight: 600,
                      bgcolor: alpha(t.palette.info.main, 0.1),
                      color: "info.main",
                    })}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                    Chỉ bạn bè mới xem được
                  </Typography>
                </Stack>
              </MenuItem>
              <MenuItem value="PRIVATE" sx={{ fontSize: 14 }}>
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
            disabled={loading}
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
            disabled={(!newPostContent.trim() && mediaFiles.length === 0) || loading}
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
            {loading ? "Đang đăng..." : "Đăng"}
          </Button>
        </Box>
      </Popover>
    </>
  );
}

