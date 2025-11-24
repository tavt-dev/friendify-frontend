import React, { forwardRef, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Avatar,
  Typography,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Button,
  Collapse,
  Divider,
  Popover,
  Tooltip,
  Chip,
  FormControl,
  InputLabel,
  Select,
  Stack,
  CircularProgress,
} from "@mui/material";
import {
  ThumbUpOutlined,
  ChatBubbleOutline,
  Share,
  MoreVert,
  Send,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import MediaCarousel from "./MediaCarousel";
import {
  likePost,
  unlikePost,
  commentOnPost,
  getPostComments,
} from "../services/postInteractionService";

const REACTIONS = [
  { emoji: "👍", label: "Thích", color: "#3b82f6" },
  { emoji: "❤️", label: "Yêu thích", color: "#ef4444" },
  { emoji: "😂", label: "Vui vẻ", color: "#f59e0b" },
  { emoji: "😮", label: "Ngạc nhiên", color: "#8b5cf6" },
  { emoji: "😢", label: "Buồn", color: "#6366f1" },
  { emoji: "😡", label: "Phẫn nộ", color: "#f97316" },
];

const Post = forwardRef((props, ref) => {
  const navigate = useNavigate();
  const { avatar, username, firstName, lastName, displayName, created, content, id, media, userId, privacy } = props.post;
  const { onEdit, onDelete, currentUserId } = props;
  
  // Get display name: lastName firstName if available, otherwise username
  const fullName = displayName || (firstName && lastName 
    ? `${lastName} ${firstName}`.trim() 
    : firstName || lastName || username || 'Unknown');
  
  // Get avatar initials: lastName[0] + firstName[0] if available, otherwise username[0]
  const avatarInitials = firstName && lastName
    ? `${lastName[0] || ''}${firstName[0] || ''}`.toUpperCase()
    : firstName
    ? firstName[0]?.toUpperCase() || ''
    : lastName
    ? lastName[0]?.toUpperCase() || ''
    : username?.charAt(0)?.toUpperCase() || 'U';
  const isOwner = currentUserId && userId && String(currentUserId) === String(userId);

  const handleUserClick = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    if (userId) {
      console.log('Navigating to profile:', userId);
      navigate(`/profile/${userId}`);
    } else {
      console.warn('No userId found in post:', props.post);
    }
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const [reactionAnchor, setReactionAnchor] = useState(null);
  const [reaction, setReaction] = useState(null);
  const [likeCount, setLikeCount] = useState(props.post?.likeCount || 0);
  const [isLiked, setIsLiked] = useState(props.post?.isLiked || false);
  const [commentCount, setCommentCount] = useState(props.post?.commentCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content || "");
  const [editedPrivacy, setEditedPrivacy] = useState(privacy || "PUBLIC");

  const longPressTimer = useRef(null);
  const likeButtonRef = useRef(null);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLikeMouseDown = (e) => {
    e.preventDefault();
    longPressTimer.current = setTimeout(() => {
      setReactionAnchor(likeButtonRef.current);
    }, 500);
  };
  const handleLikeMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      if (!reactionAnchor) handleQuickLike();
    }
  };
  const handleLikeMouseLeave = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleQuickLike = async () => {
    if (loadingLike || !id) return;
    
    setLoadingLike(true);
    try {
      if (isLiked) {
        await unlikePost(id);
        setReaction(null);
        setIsLiked(false);
        setLikeCount((p) => Math.max(p - 1, 0));
      } else {
        await likePost(id);
        setReaction({ emoji: "👍", label: "Thích", color: "#3b82f6" });
        setIsLiked(true);
        setLikeCount((p) => p + 1);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setLoadingLike(false);
    }
  };

  const handleSelectReaction = async (react) => {
    if (loadingLike || !id) return;
    
    setLoadingLike(true);
    try {
      if (reaction?.label === react.label) {
        await unlikePost(id);
        setReaction(null);
        setIsLiked(false);
        setLikeCount((p) => Math.max(p - 1, 0));
      } else {
        if (!isLiked) {
          await likePost(id);
          setIsLiked(true);
        }
        if (!reaction) setLikeCount((p) => p + 1);
        setReaction(react);
      }
    } catch (error) {
      console.error("Error selecting reaction:", error);
    } finally {
      setLoadingLike(false);
      setReactionAnchor(null);
    }
  };

  const handleCloseReactions = () => setReactionAnchor(null);

  const handleComment = async () => {
    if (!commentText.trim() || !id || loadingComments) return;
    
    const commentContent = commentText.trim();
    setCommentText("");
    const tempId = `temp-${Date.now()}`;
    
    const tempComment = {
      id: tempId,
      text: commentContent,
      author: "You",
      avatar: null,
      userId: currentUserId,
      time: "Vừa xong",
      createdAt: new Date().toISOString(),
      likeCount: 0,
      isLiked: false,
      pending: true,
    };
    
    setComments((prev) => [tempComment, ...prev]);
    setCommentCount((prev) => prev + 1);
    setLoadingComments(true);
    
    try {
      const response = await commentOnPost(id, commentContent);
      const newComment = response.data?.result || response.data;
      
      if (newComment) {
        const formattedComment = {
          id: newComment.id,
          text: newComment.content || newComment.text,
          author: newComment.username || "You",
          avatar: newComment.userAvatar,
          userId: newComment.userId,
          time: newComment.createdAt ? new Date(newComment.createdAt).toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            day: "numeric",
            month: "numeric",
          }) : "Vừa xong",
          createdAt: newComment.createdAt,
          likeCount: newComment.likeCount || 0,
          isLiked: newComment.isLiked || false,
        };
        
        setComments((prev) => {
          const filtered = prev.filter((c) => c.id !== tempId);
          return [formattedComment, ...filtered];
        });
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      setCommentText(commentContent);
      setComments((prev) => prev.filter((c) => c.id !== tempId));
      setCommentCount((prev) => Math.max(prev - 1, 0));
      
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          error?.message || 
                          "Không thể đăng bình luận. Vui lòng thử lại.";
      alert(errorMessage);
    } finally {
      setLoadingComments(false);
    }
  };

  const loadComments = async () => {
    if (!id || loadingComments) return;
    
    setLoadingComments(true);
    try {
      const response = await getPostComments(id, 1, 20);
      const result = response.data?.result || response.data;
      const commentsList = result?.content || (Array.isArray(result) ? result : []);
      
      const formattedComments = commentsList
        .filter((comment) => comment && comment.id)
        .map((comment) => ({
          id: comment.id,
          text: comment.content || comment.text || "",
          author: comment.username || "Unknown",
          avatar: comment.userAvatar,
          userId: comment.userId,
          time: comment.createdAt ? new Date(comment.createdAt).toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            day: "numeric",
            month: "numeric",
          }) : "Unknown",
          createdAt: comment.createdAt,
          likeCount: comment.likeCount || 0,
          isLiked: comment.isLiked || false,
        }));
      
      setComments(formattedComments);
      if (result?.totalElements !== undefined) {
        setCommentCount(result.totalElements);
      }
    } catch (error) {
      console.error("Error loading comments:", error);
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          error?.message || 
                          "Không thể tải bình luận. Vui lòng thử lại.";
      console.error(errorMessage);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (showComments && comments.length === 0 && id) {
      loadComments();
    }
  }, [showComments]);
  
  useEffect(() => {
    if (props.post?.isLiked) {
      setIsLiked(true);
      setReaction({ emoji: "👍", label: "Thích", color: "#3b82f6" });
    }
    if (props.post?.likeCount !== undefined) {
      setLikeCount(props.post.likeCount);
    }
    if (props.post?.commentCount !== undefined) {
      setCommentCount(props.post.commentCount);
    }
  }, [props.post?.isLiked, props.post?.likeCount, props.post?.commentCount]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(content || "");
    setEditedPrivacy(privacy || "PUBLIC");
    handleMenuClose();
  };
  const handleSaveEdit = () => {
    onEdit?.(id, editedContent, editedPrivacy);
    setIsEditing(false);
  };
  const handleCancelEdit = () => {
    setEditedContent(content || "");
    setEditedPrivacy(privacy || "PUBLIC");
    setIsEditing(false);
  };
  const handleDelete = () => {
    onDelete?.(id);
    handleMenuClose();
  };

  return (
    <Paper
      ref={ref}
      elevation={0}
      sx={(t) => ({
        mb: { xs: 2, sm: 2.5, md: 3 },
        borderRadius: { xs: 3, sm: 4, md: 5 },
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
        position: "relative",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        backgroundImage: t.palette.mode === "dark"
          ? "linear-gradient(135deg, rgba(28, 30, 36, 1) 0%, rgba(28, 30, 36, 0.98) 100%)"
          : "linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.98) 100%)",
        boxShadow: t.palette.mode === "dark"
          ? "0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.03)"
          : "0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
        "&:hover": {
          boxShadow: t.palette.mode === "dark"
            ? "0 12px 48px rgba(0, 0, 0, 0.5), 0 4px 16px rgba(139, 154, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
            : "0 12px 48px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(102, 126, 234, 0.15), inset 0 1px 0 rgba(255, 255, 255, 1)",
          borderColor: alpha(t.palette.primary.main, 0.35),
          transform: "translateY(-4px)",
        },
      })}
    >
      <Box
        sx={(t) => ({
          p: { xs: 1.5, sm: 2, md: 2.5 },
          pb: { xs: 1.5, sm: 2 },
          position: "relative",
          background: t.palette.mode === "dark"
            ? `linear-gradient(135deg, ${alpha(t.palette.primary.main, 0.08)} 0%, ${alpha(t.palette.primary.main, 0.04)} 100%)`
            : `linear-gradient(135deg, ${alpha(t.palette.primary.main, 0.06)} 0%, ${alpha(t.palette.primary.main, 0.02)} 100%)`,
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "1px",
            background: t.palette.mode === "dark"
              ? `linear-gradient(90deg, transparent, ${alpha(t.palette.primary.main, 0.2)}, transparent)`
              : `linear-gradient(90deg, transparent, ${alpha(t.palette.primary.main, 0.15)}, transparent)`,
          },
        })}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={avatar && avatar.trim() !== '' ? avatar : undefined}
                onClick={handleUserClick}
                sx={(t) => ({
                  width: { xs: 40, sm: 46, md: 52 },
                  height: { xs: 40, sm: 46, md: 52 },
                  background: t.palette.mode === "dark"
                    ? "linear-gradient(135deg, #8b9aff 0%, #9775d4 100%)"
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: { xs: 16, sm: 18, md: 20 },
                  border: { xs: "2px solid", sm: "3px solid" },
                  borderColor: "background.paper",
                  boxShadow: t.palette.mode === "dark"
                    ? `0 6px 16px ${alpha(t.palette.primary.main, 0.35)}, inset 0 -2px 4px rgba(0, 0, 0, 0.3)`
                    : `0 6px 16px ${alpha(t.palette.primary.main, 0.3)}, inset 0 -2px 4px rgba(0, 0, 0, 0.15)`,
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: t.palette.mode === "dark"
                      ? `0 8px 20px ${alpha(t.palette.primary.main, 0.5)}, inset 0 -2px 4px rgba(0, 0, 0, 0.3)`
                      : `0 8px 20px ${alpha(t.palette.primary.main, 0.4)}, inset 0 -2px 4px rgba(0, 0, 0, 0.15)`,
                  },
                })}
              >
                {avatarInitials}
              </Avatar>
              <Box
                sx={(t) => ({
                  position: "absolute",
                  bottom: -2,
                  right: -2,
                  width: 16,
                  height: 16,
                  bgcolor: "#10b981",
                  borderRadius: "50%",
                  border: "2px solid",
                  borderColor: "background.paper",
                })}
              />
            </Box>
            <Box>
              <Typography 
                onClick={handleUserClick}
                sx={{ 
                  fontWeight: 700, 
                  fontSize: { xs: 14, sm: 15, md: 16 }, 
                  color: "text.primary",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    color: "primary.main",
                    textDecoration: "underline",
                  },
                }}
              >
                {fullName}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Typography sx={{ fontSize: { xs: 11, sm: 12 }, color: "text.secondary" }}>
                  {created}
                </Typography>
                <Box sx={{ width: 3, height: 3, bgcolor: "text.secondary", borderRadius: "50%", opacity: 0.6 }} />
                <Chip
                  label={privacy === "PRIVATE" ? "Riêng tư" : "Công khai"}
                  size="small"
                  sx={(t) => ({
                    height: 18,
                    fontSize: 10,
                    fontWeight: 600,
                    bgcolor: privacy === "PRIVATE" 
                      ? alpha(t.palette.error.main, 0.1)
                      : t.palette.action.selected,
                    color: privacy === "PRIVATE" 
                      ? t.palette.error.main
                      : "text.secondary",
                  })}
                />
              </Box>
            </Box>
          </Box>
          {isOwner && (
            <IconButton
              onClick={handleMenuOpen}
              size="small"
              sx={(t) => ({
                color: "text.secondary",
                "&:hover": { bgcolor: t.palette.action.hover, color: "primary.main" },
              })}
            >
              <MoreVert />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ px: { xs: 1.5, sm: 2, md: 2.5 }, pt: { xs: 1, sm: 1.5 }, pb: { xs: 1.5, sm: 2 } }}>
        {isEditing ? (
          <Box>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              sx={(t) => ({
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  fontSize: 15,
                  bgcolor: "background.paper",
                  "& fieldset": { borderColor: "divider" },
                  "&:hover fieldset": { borderColor: "primary.main" },
                  "&.Mui-focused fieldset": { borderColor: "primary.main", borderWidth: 2 },
                },
              })}
            />
            
            {/* Privacy Selector for Edit */}
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel id="edit-privacy-select-label" sx={{ fontSize: 13 }}>
                Quyền riêng tư
              </InputLabel>
              <Select
                labelId="edit-privacy-select-label"
                id="edit-privacy-select"
                value={editedPrivacy}
                label="Quyền riêng tư"
                onChange={(e) => setEditedPrivacy(e.target.value)}
                sx={{
                  borderRadius: 2,
                  fontSize: 13,
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
                        height: 22,
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: 11 }}>
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
                        height: 22,
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: 11 }}>
                      Chỉ bạn mới xem được
                    </Typography>
                  </Stack>
                </MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleCancelEdit}
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 600,
                  px: 2.5,
                }}
              >
                Hủy
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={handleSaveEdit}
                sx={(t) => ({
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 600,
                  px: 2.5,
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
                  transition: "all 0.3s ease",
                })}
              >
                Lưu thay đổi
              </Button>
            </Box>
          </Box>
        ) : (
          <Typography
            sx={{
              fontSize: { xs: 14, sm: 15 },
              lineHeight: 1.8,
              color: "text.primary",
              whiteSpace: "pre-line",
            }}
          >
            {editedContent}
          </Typography>
        )}
      </Box>

      {/* Media Carousel */}
      {media && media.length > 0 && (
        <MediaCarousel
          media={media}
          postData={{ avatar, username, firstName, lastName, displayName: fullName, avatarInitials, created, content }}
        />
      )}

      {/* Stats */}
      {(likeCount > 0 || comments.length > 0) && (
        <>
          <Divider sx={{ borderColor: "divider" }} />
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 2.5, py: 1.5 }}>
            {likeCount > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={(t) => ({
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    bgcolor: reaction?.color
                      ? alpha(reaction.color, 0.12)
                      : t.palette.action.selected,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 3,
                  })}
                >
                  <Typography sx={{ fontSize: 16 }}>{reaction?.emoji}</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: reaction?.color || "text.secondary" }}>
                    {likeCount}
                  </Typography>
                </Box>
              </Box>
            )}
            {commentCount > 0 && (
              <Typography
                sx={(t) => ({
                  fontSize: 13,
                  color: "text.secondary",
                  cursor: "pointer",
                  fontWeight: 500,
                  "&:hover": { color: t.palette.primary.main, textDecoration: "underline" },
                })}
                onClick={() => setShowComments(!showComments)}
              >
                {commentCount} bình luận
              </Typography>
            )}
          </Box>
        </>
      )}

      {/* Actions */}
      <Divider sx={{ borderColor: "divider" }} />
      <Box
        sx={(t) => ({
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          p: 0.5,
          bgcolor:
            t.palette.mode === "dark"
              ? alpha(t.palette.common.white, 0.04)
              : alpha(t.palette.common.black, 0.02),
        })}
      >
        <Box sx={{ position: "relative", flex: 1 }}>
          <IconButton
            ref={likeButtonRef}
            onMouseDown={handleLikeMouseDown}
            onMouseUp={handleLikeMouseUp}
            onMouseLeave={handleLikeMouseLeave}
            onTouchStart={handleLikeMouseDown}
            onTouchEnd={handleLikeMouseUp}
            sx={(t) => ({
              color: reaction ? reaction.color : "text.secondary",
              borderRadius: 3,
              py: { xs: 1, sm: 1.25, md: 1.5 },
              px: { xs: 0.5, sm: 1 },
              width: "100%",
              transition: "all .2s",
              "&:hover": {
                bgcolor: reaction
                  ? alpha(reaction.color, 0.12)
                  : t.palette.action.hover,
                transform: "scale(1.02)",
              },
            })}
          >
            {loadingLike ? (
              <CircularProgress size={18} />
            ) : reaction ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  component="span"
                  sx={{
                    fontSize: { xs: "18px", sm: "20px", md: "22px" },
                    animation: "bounce .6s ease",
                    "@keyframes bounce": {
                      "0%,100%": { transform: "translateY(0)" },
                      "50%": { transform: "translateY(-6px)" },
                    },
                  }}
                >
                  {reaction.emoji}
                </Box>
                <Typography sx={{ fontSize: { xs: 13, sm: 14 }, fontWeight: 700, display: { xs: 'none', sm: 'block' } }}>{reaction.label}</Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1 } }}>
                <ThumbUpOutlined sx={{ fontSize: { xs: 18, sm: 20 } }} />
                <Typography sx={{ fontSize: { xs: 13, sm: 14 }, fontWeight: 700 }}>Thích</Typography>
              </Box>
            )}
          </IconButton>

          <Popover
            open={Boolean(reactionAnchor)}
            anchorEl={reactionAnchor}
            onClose={handleCloseReactions}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            transformOrigin={{ vertical: "bottom", horizontal: "center" }}
            disableRestoreFocus
            PaperProps={{
              sx: (t) => ({
                px: 2.5,
                py: 2,
                borderRadius: 6,
                display: "flex",
                gap: 1,
                boxShadow: t.palette.mode === "dark"
                  ? "0 16px 64px rgba(0, 0, 0, 0.7), 0 8px 32px rgba(139, 154, 255, 0.2)"
                  : "0 16px 64px rgba(0, 0, 0, 0.2), 0 8px 32px rgba(102, 126, 234, 0.15)",
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                backdropFilter: "blur(20px)",
                backgroundImage: t.palette.mode === "dark"
                  ? "linear-gradient(135deg, rgba(28, 30, 36, 0.95) 0%, rgba(28, 30, 36, 1) 100%)"
                  : "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 1) 100%)",
              }),
              onMouseLeave: handleCloseReactions,
            }}
          >
            {REACTIONS.map((r) => (
              <Tooltip title={r.label} key={r.label} placement="top">
                <Box
                  onClick={() => handleSelectReaction(r)}
                  sx={(t) => ({
                    fontSize: 36,
                    cursor: "pointer",
                    transition: "all .25s cubic-bezier(0.4,0,0.2,1)",
                    p: 1,
                    borderRadius: 3,
                    "&:hover": {
                      transform: "scale(1.5) translateY(-8px)",
                      bgcolor: alpha(r.color, 0.12),
                    },
                  })}
                >
                  {r.emoji}
                </Box>
              </Tooltip>
            ))}
          </Popover>
        </Box>

        <IconButton
          onClick={() => setShowComments(!showComments)}
          sx={(t) => ({
            color: "text.secondary",
            borderRadius: 3,
            py: { xs: 1, sm: 1.25, md: 1.5 },
            px: { xs: 0.5, sm: 1 },
            flex: 1,
            "&:hover": { bgcolor: t.palette.action.hover, color: "primary.main", transform: "scale(1.02)" },
          })}
        >
          <ChatBubbleOutline sx={{ fontSize: { xs: 18, sm: 20 }, mr: { xs: 0.5, sm: 1 } }} />
          <Typography sx={{ fontSize: { xs: 13, sm: 14 }, fontWeight: 700 }}>Bình luận</Typography>
        </IconButton>

        <IconButton
          sx={(t) => ({
            color: "text.secondary",
            borderRadius: 3,
            py: { xs: 1, sm: 1.25, md: 1.5 },
            px: { xs: 0.5, sm: 1 },
            flex: 1,
            "&:hover": { bgcolor: t.palette.action.hover, color: "primary.main", transform: "scale(1.02)" },
          })}
        >
          <Share sx={{ fontSize: { xs: 18, sm: 20 }, mr: { xs: 0.5, sm: 1 } }} />
          <Typography sx={{ fontSize: { xs: 13, sm: 14 }, fontWeight: 700 }}>Chia sẻ</Typography>
        </IconButton>
      </Box>

      {/* Comments */}
      <Collapse in={showComments}>
        <Divider sx={{ borderColor: "divider" }} />
        <Box
          sx={(t) => ({
            p: 2.5,
            bgcolor:
              t.palette.mode === "dark"
                ? alpha(t.palette.common.white, 0.03)
                : alpha(t.palette.common.black, 0.02),
          })}
        >
            {loadingComments && comments.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : comments.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
              </Typography>
            </Box>
          ) : (
            comments.map((c) => (
              <Box key={c.id} sx={{ display: "flex", gap: 1.5, mb: 2.5 }}>
                <Avatar
                  src={c.avatar}
                  sx={{ width: 36, height: 36, bgcolor: "primary.main", fontWeight: 700, fontSize: 14 }}
                >
                  {c.author.charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box
                    sx={(t) => ({
                      bgcolor: "background.paper",
                      borderRadius: 4,
                      p: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      boxShadow: 0,
                    })}
                  >
                    <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5, color: "text.primary" }}>
                      {c.author}
                    </Typography>
                    <Typography sx={{ fontSize: 14, color: "text.primary" }}>{c.text}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 2, mt: 0.5, px: 1 }}>
                    <Typography sx={{ fontSize: 12, color: "text.secondary", fontWeight: 600 }}>
                      {c.time}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "text.secondary", cursor: "pointer", fontWeight: 600 }}>
                      Thích {c.likeCount > 0 && `(${c.likeCount})`}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "text.secondary", cursor: "pointer", fontWeight: 600 }}>
                      Trả lời
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))
          )}

          <Box sx={{ display: "flex", gap: 1.5, mt: 2 }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main", fontWeight: 700, fontSize: 14 }}>
              {currentUserId ? String(currentUserId).charAt(0).toUpperCase() : "Y"}
            </Avatar>
            <TextField
              fullWidth
              size="small"
              placeholder="Viết bình luận..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleComment();
                }
              }}
              disabled={loadingComments}
              InputProps={{
                endAdornment: loadingComments ? (
                  <CircularProgress size={18} />
                ) : (
                  <IconButton
                    size="small"
                    onClick={handleComment}
                    disabled={!commentText.trim() || loadingComments}
                    sx={(t) => ({
                      color: "primary.main",
                      "&:disabled": { color: "text.disabled" },
                      "&:hover": {
                        bgcolor: alpha(t.palette.primary.main, 0.08),
                      },
                    })}
                  >
                    <Send sx={{ fontSize: 18 }} />
                  </IconButton>
                ),
              }}
              sx={(t) => ({
                "& .MuiOutlinedInput-root": {
                  borderRadius: 4,
                  bgcolor: "background.paper",
                  fontSize: 14,
                  "& fieldset": { borderColor: "divider" },
                  "&:hover fieldset": { borderColor: "primary.main" },
                  "&.Mui-focused fieldset": { borderColor: "primary.main", borderWidth: 2 },
                },
              })}
            />
          </Box>
        </Box>
      </Collapse>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            minWidth: 180,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          },
        }}
      >
        <MenuItem
          onClick={handleEdit}
          sx={(t) => ({
            fontSize: 14,
            py: 1.5,
            fontWeight: 600,
            "&:hover": { bgcolor: t.palette.action.hover },
          })}
        >
          ✏️ Sửa bài viết
        </MenuItem>
        <MenuItem
          onClick={handleDelete}
          sx={(t) => ({
            fontSize: 14,
            py: 1.5,
            fontWeight: 600,
            color: "error.main",
            "&:hover": { bgcolor: alpha(t.palette.error.main, 0.08) },
          })}
        >
          🗑️ Xóa bài viết
        </MenuItem>
      </Menu>
    </Paper>
  );
});

export default Post;
