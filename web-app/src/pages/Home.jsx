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
  const [hasMore, setHasMore] = useState(false);
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
    setSnackbarMessage("Post updated successfully!");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const handleDeletePost = (id) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setSnackbarMessage("Post deleted successfully!");
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
        setHasMore(res.data.length > 0);
      })
      .catch(() => {
        logOut();
        navigate("/login");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!hasMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && page < totalPages) setPage((prev) => prev + 1);
    });
    if (lastPostElementRef.current) observer.current.observe(lastPostElementRef.current);
    setHasMore(false);
  }, [hasMore, page, totalPages]);

  const handlePostContent = () => {
    if (!newPostContent.trim()) return;

    setAnchorEl(null);

    createPostMock(newPostContent)
      .then((newPost) => {
        setPosts((prev) => [newPost, ...prev]);
        setNewPostContent("");
        setSnackbarMessage("Post created successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      })
      .catch(() => {
        setSnackbarMessage("Failed to create post. Please try again.");
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
          gap: 3,
          px: { xs: 0, md: 2 },
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 680,
            flex: "1 1 auto",
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
        </Box>

        <RightSidebar />
      </Box>

      <Fab
        color="primary"
        aria-label="add"
        onClick={handleCreatePostClick}
        sx={{
          position: "fixed",
          bottom: 32,
          right: 32,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
          "&:hover": {
            background: "linear-gradient(135deg, #5568d3 0%, #63428a 100%)",
            transform: "scale(1.12) rotate(90deg)",
          },
          transition: "all 0.3s ease",
        }}
      >
        <AddIcon />
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
              boxShadow: t.shadows[6],
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }),
          },
        }}
      >
        <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 700, fontSize: 19, color: "text.primary" }}>
          Create new Post
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="What's on your mind?"
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
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handlePostContent}
            disabled={!newPostContent.trim()}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 3,
              px: 3.5,
              py: 1,
              fontSize: 14,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "&:hover": { background: "linear-gradient(135deg, #5568d3 0%, #63428a 100%)" },
              "&:disabled": { background: "action.disabledBackground", color: "text.disabled" },
            }}
          >
            Post
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
