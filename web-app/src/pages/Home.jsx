import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Card, CircularProgress, Typography, Fab, Popover, TextField,
  Button, Snackbar, Alert
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { logOut } from "../services/authenticationService";
import { getPosts, createPost as createPostMock } from "../utils/mockData";
import Scene from "./Scene";
import Post from "../components/Post";
import CreatePostComposer from "../components/CreatePostComposer";
import RightSidebar from "../components/RightSidebar";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const observer = useRef();
  const lastPostElementRef = useRef();
  const [anchorEl, setAnchorEl] = useState(null);
  const [newPostContent, setNewPostContent] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const navigate = useNavigate();

  const handleCreatePostClick = (e) => setAnchorEl(e.currentTarget);

  const handleClosePopover = () => {
    setAnchorEl(null);
    setNewPostContent("");
  };

  const handleSnackbarClose = (_, r) => {
    if (r !== "clickaway") setSnackbarOpen(false);
  };

  const handleEditPost = (id, content) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, content } : p)));
    setSnackbarMessage("Đã cập nhật bài viết thành công!");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
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
    loadPosts(page);
  }, [page]);

  const loadPosts = (page) => {
    setLoading(true);
    getPosts(page, 10)
      .then((res) => {
        setTotalPages(res.totalPages);
        setPosts((prev) => [...prev, ...res.data]);
      })
      .catch(() => {
        logOut();
        navigate("/login");
      })
      .finally(() => setLoading(false));
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

  const handlePostContent = () => {
    if (!newPostContent.trim()) return;

    setAnchorEl(null);

    createPostMock(newPostContent)
      .then((newPost) => {
        setPosts((prev) => [newPost, ...prev]);
        setNewPostContent("");
        setSnackbarMessage("Đã tạo bài viết thành công!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      })
      .catch(() => {
        setSnackbarMessage("Không thể tạo bài viết. Vui lòng thử lại.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
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
          <CreatePostComposer onClick={handleCreatePostClick} />

          {posts.map((post, index) => {
            const isLast = posts.length === index + 1;
            return (
              <Post
                ref={isLast ? lastPostElementRef : null}
                key={post.id}
                post={post}
                onEdit={handleEditPost}
                onDelete={handleDeletePost}
              />
            );
          })}

          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size="32px" color="primary" />
            </Box>
          )}

          {!loading && posts.length > 0 && page >= totalPages && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <Typography sx={{ fontSize: 14, color: "text.secondary", fontWeight: 500 }}>
                Bạn đã xem hết bảng tin
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

      <Fab
        color="primary"
        aria-label="add"
        onClick={handleCreatePostClick}
        sx={(t) => ({
          position: "fixed",
          bottom: 32,
          right: 32,
          width: 64,
          height: 64,
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
            disabled={!newPostContent.trim()}
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
