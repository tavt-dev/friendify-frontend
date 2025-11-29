import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Typography,
  Button,
  Tabs,
  Tab,
  TextField,
  IconButton,
  Chip,
  Stack,
  Snackbar,
  Alert,
  Divider,
  CircularProgress,
  Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CheckIcon from "@mui/icons-material/Check";
import PeopleIcon from "@mui/icons-material/People";
import ArticleIcon from "@mui/icons-material/Article";
import GroupIcon from "@mui/icons-material/Group";
import PlaceIcon from "@mui/icons-material/Place";
import CloseIcon from "@mui/icons-material/Close";
import PageLayout from "./PageLayout";
import Post from "../components/Post";
import { search as searchUsers } from "../services/userService";
import { searchPosts } from "../services/postService";
import { searchGroups, joinGroup } from "../services/groupService";
import { addFriend } from "../services/friendService";
import { extractArrayFromResponse } from "../utils/apiHelper";
import { useUser } from "../contexts/UserContext";

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user: currentUser } = useUser();
  
  const initialQuery = searchParams.get("q") || "";
  const [tabIndex, setTabIndex] = useState(0);
  const [query, setQuery] = useState(initialQuery);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState({ users: false, posts: false, groups: false });
  const [snackbar, setSnackbar] = useState({ open: false, severity: "success", message: "" });
  const [pagination, setPagination] = useState({
    users: { page: 1, totalPages: 1, hasMore: false },
    posts: { page: 1, totalPages: 1, hasMore: false },
    groups: { page: 1, totalPages: 1, hasMore: false },
  });

  // Update URL when query changes
  useEffect(() => {
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
    } else {
      setSearchParams({});
    }
  }, [query, setSearchParams]);

  // Load search results when query changes
  useEffect(() => {
    if (query.trim()) {
      performSearch();
    } else {
      // Clear results when query is empty
      setUsers([]);
      setPosts([]);
      setGroups([]);
    }
  }, [query]);

  const performSearch = async () => {
    const keyword = query.trim();
    if (!keyword) return;

    // Search users
    setLoading(prev => ({ ...prev, users: true }));
    try {
      const userResponse = await searchUsers(keyword);
      const { items: usersList } = extractArrayFromResponse(userResponse.data);
      setUsers(usersList.map(user => ({
        id: user.id || user.userId || user._id,
        username: user.username || user.userName || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        avatar: user.avatar || user.avatarUrl || null,
        email: user.email || null,
        bio: user.bio || user.title || '',
        location: user.location || '',
      })));
    } catch (err) {
      console.error('Error searching users:', err);
      setUsers([]);
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }

    // Search posts
    setLoading(prev => ({ ...prev, posts: true }));
    try {
      const postResponse = await searchPosts(keyword, 1, 20);
      const responseData = postResponse.data?.result || postResponse.data;
      let postsList = [];
      let totalPages = 1;
      
      if (responseData?.content && Array.isArray(responseData.content)) {
        postsList = responseData.content;
        totalPages = responseData.totalPages || 1;
      } else if (Array.isArray(responseData)) {
        postsList = responseData;
      } else {
        const extracted = extractArrayFromResponse(postResponse.data);
        postsList = extracted.items;
        totalPages = extracted.totalPages || 1;
      }
      
      setPosts(postsList);
      setPagination(prev => ({
        ...prev,
        posts: { page: 1, totalPages, hasMore: 1 < totalPages }
      }));
    } catch (err) {
      console.error('Error searching posts:', err);
      setPosts([]);
    } finally {
      setLoading(prev => ({ ...prev, posts: false }));
    }

    // Search groups
    setLoading(prev => ({ ...prev, groups: true }));
    try {
      const groupResponse = await searchGroups(keyword, 1, 20);
      const responseData = groupResponse.data?.result || groupResponse.data;
      let groupsList = [];
      let totalPages = 1;
      
      if (responseData?.content && Array.isArray(responseData.content)) {
        groupsList = responseData.content;
        totalPages = responseData.totalPages || 1;
      } else if (Array.isArray(responseData)) {
        groupsList = responseData;
      } else {
        const extracted = extractArrayFromResponse(groupResponse.data);
        groupsList = extracted.items;
        totalPages = extracted.totalPages || 1;
      }
      
      setGroups(groupsList.map(group => ({
        id: group.id || group._id,
        name: group.name || group.groupName || '',
        description: group.description || '',
        avatar: group.avatar || group.avatarUrl || null,
        cover: group.cover || group.coverUrl || null,
        members: group.memberCount || group.members?.length || 0,
        privacy: group.privacy || 'PUBLIC',
        isJoined: group.isJoined || false,
      })));
      setPagination(prev => ({
        ...prev,
        groups: { page: 1, totalPages, hasMore: 1 < totalPages }
      }));
    } catch (err) {
      console.error('Error searching groups:', err);
      setGroups([]);
    } finally {
      setLoading(prev => ({ ...prev, groups: false }));
    }
  };

  const handleAddFriend = async (userId) => {
    try {
      await addFriend(userId);
      setSnackbar({ open: true, severity: "success", message: "Đã gửi lời mời kết bạn!" });
    } catch (err) {
      console.error('Error sending friend request:', err);
      const errorMsg = err.response?.data?.message || "Không thể gửi lời mời kết bạn. Vui lòng thử lại.";
      setSnackbar({ open: true, severity: "error", message: errorMsg });
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await joinGroup(groupId);
      setGroups(prev => prev.map(g => g.id === groupId ? { ...g, isJoined: true } : g));
      setSnackbar({ open: true, severity: "success", message: "Đã tham gia nhóm!" });
    } catch (err) {
      console.error('Error joining group:', err);
      const errorMsg = err.response?.data?.message || "Không thể tham gia nhóm. Vui lòng thử lại.";
      setSnackbar({ open: true, severity: "error", message: errorMsg });
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((s) => ({ ...s, open: false }));
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handleGroupClick = (groupId) => {
    navigate(`/groups/${groupId}`);
  };

  const totalResults = users.length + posts.length + groups.length;

  return (
    <PageLayout>
      <Box sx={{ maxWidth: 1200, mx: "auto", width: "100%", py: { xs: 2, md: 4 } }}>
        {/* Header */}
        <Card variant="outlined" sx={{ borderRadius: 3, mb: 4 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, background: "linear-gradient(90deg,#7c3aed,#4f46e5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Tìm kiếm
              </Typography>

              {query.trim() && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: "primary.main", color: "primary.contrastText", px: 2, py: 0.5, borderRadius: 4 }}>
                  <SearchIcon fontSize="small" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{totalResults} kết quả</Typography>
                </Box>
              )}
            </Box>

            <Box sx={{ display: "flex", gap: 2, alignItems: "center", mt: 1 }}>
              <TextField
                fullWidth
                size="medium"
                placeholder="Tìm kiếm người dùng, bài viết, nhóm..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    performSearch();
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ display: "flex", alignItems: "center", pl: 1 }}>
                      <SearchIcon color="action" />
                    </Box>
                  ),
                  endAdornment: query && (
                    <IconButton
                      size="small"
                      onClick={() => setQuery("")}
                      sx={{ mr: 1 }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
                sx={{ bgcolor: "background.paper", borderRadius: 2 }}
                aria-label="search"
              />
            </Box>
          </CardContent>
        </Card>

        {!query.trim() ? (
          <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
            <SearchIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nhập từ khóa để tìm kiếm
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tìm kiếm người dùng, bài viết, nhóm và nhiều hơn nữa
            </Typography>
          </Paper>
        ) : (
          <>
            {/* Tabs */}
            <Card variant="outlined" sx={{ borderRadius: 3, p: 2 }}>
              <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)} aria-label="search tabs" sx={{ mb: 2 }}>
                <Tab 
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PeopleIcon fontSize="small" />
                      <span>Mọi người ({loading.users ? "..." : users.length})</span>
                    </Box>
                  } 
                  iconPosition="start" 
                />
                <Tab 
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <ArticleIcon fontSize="small" />
                      <span>Bài viết ({loading.posts ? "..." : posts.length})</span>
                    </Box>
                  } 
                  iconPosition="start" 
                />
                <Tab 
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <GroupIcon fontSize="small" />
                      <span>Nhóm ({loading.groups ? "..." : groups.length})</span>
                    </Box>
                  } 
                  iconPosition="start" 
                />
              </Tabs>

              <Divider sx={{ mb: 2 }} />

              {/* Tab panels */}
              {tabIndex === 0 && (
                <Box>
                  {loading.users ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                      <CircularProgress />
                    </Box>
                  ) : users.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 6 }}>
                      <PeopleIcon sx={{ fontSize: 64, color: "text.secondary", mb: 1 }} />
                      <Typography variant="h6" color="text.secondary">Không tìm thấy người dùng nào</Typography>
                    </Box>
                  ) : (
                    <Grid container spacing={3}>
                      {users.map((u) => {
                        const fullName = `${u.lastName || ''} ${u.firstName || ''}`.trim() || u.username || 'Người dùng';
                        return (
                          <Grid item xs={12} sm={6} md={4} key={u.id}>
                            <Card 
                              variant="outlined" 
                              sx={{ 
                                borderRadius: 3, 
                                p: 2, 
                                height: "100%",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                "&:hover": {
                                  boxShadow: 4,
                                  transform: "translateY(-2px)",
                                }
                              }}
                              onClick={() => handleUserClick(u.id)}
                            >
                              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                                <Avatar src={u.avatar} alt={fullName} sx={{ width: 96, height: 96, mb: 1 }}>
                                  {fullName.charAt(0).toUpperCase()}
                                </Avatar>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{fullName}</Typography>
                                {u.username && (
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                    @{u.username}
                                  </Typography>
                                )}
                                {u.bio && (
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, minHeight: 40 }}>
                                    {u.bio}
                                  </Typography>
                                )}
                                {u.location && (
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: "grey.100", px: 1.5, py: 0.5, borderRadius: 2, mb: 1 }}>
                                    <PlaceIcon fontSize="small" color="action" />
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{u.location}</Typography>
                                  </Box>
                                )}

                                <Button
                                  variant="contained"
                                  color="primary"
                                  startIcon={<PersonAddIcon />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddFriend(u.id);
                                  }}
                                  fullWidth
                                  sx={{ textTransform: "none", borderRadius: 2, mt: 1 }}
                                >
                                  Kết bạn
                                </Button>
                              </Box>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>
                  )}
                </Box>
              )}

              {tabIndex === 1 && (
                <Box>
                  {loading.posts ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                      <CircularProgress />
                    </Box>
                  ) : posts.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 6 }}>
                      <ArticleIcon sx={{ fontSize: 64, color: "text.secondary", mb: 1 }} />
                      <Typography variant="h6" color="text.secondary">Không tìm thấy bài viết nào</Typography>
                    </Box>
                  ) : (
                    <Stack spacing={2}>
                      {posts.map((post) => (
                        <Post key={post.id || post._id} post={post} />
                      ))}
                    </Stack>
                  )}
                </Box>
              )}

              {tabIndex === 2 && (
                <Box>
                  {loading.groups ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                      <CircularProgress />
                    </Box>
                  ) : groups.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 6 }}>
                      <GroupIcon sx={{ fontSize: 64, color: "text.secondary", mb: 1 }} />
                      <Typography variant="h6" color="text.secondary">Không tìm thấy nhóm nào</Typography>
                    </Box>
                  ) : (
                    <Grid container spacing={3}>
                      {groups.map((g) => (
                        <Grid item xs={12} sm={6} key={g.id}>
                          <Card 
                            variant="outlined" 
                            sx={{ 
                              borderRadius: 3, 
                              p: 2,
                              cursor: "pointer",
                              transition: "all 0.2s",
                              "&:hover": {
                                boxShadow: 4,
                                transform: "translateY(-2px)",
                              }
                            }}
                            onClick={() => handleGroupClick(g.id)}
                          >
                            <Box sx={{ display: "flex", gap: 2 }}>
                              <Avatar 
                                src={g.avatar} 
                                variant="rounded" 
                                sx={{ width: 80, height: 80 }}
                              >
                                {g.name?.charAt(0)?.toUpperCase() || "G"}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{g.name}</Typography>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                  <Chip 
                                    icon={<PeopleIcon />} 
                                    label={`${g.members.toLocaleString()} thành viên`} 
                                    size="small" 
                                  />
                                  {g.privacy && (
                                    <Chip 
                                      label={g.privacy === 'PUBLIC' ? 'Công khai' : 'Riêng tư'} 
                                      size="small" 
                                      color={g.privacy === 'PUBLIC' ? 'primary' : 'default'}
                                    />
                                  )}
                                </Stack>
                                {g.description && (
                                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, minHeight: 40 }}>
                                    {g.description}
                                  </Typography>
                                )}
                              </Box>
                            </Box>

                            <Box sx={{ mt: 2 }}>
                              <Button
                                variant={g.isJoined ? "outlined" : "contained"}
                                startIcon={g.isJoined ? <CheckIcon /> : <PeopleIcon />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!g.isJoined) {
                                    handleJoinGroup(g.id);
                                  }
                                }}
                                disabled={g.isJoined}
                                sx={{ textTransform: "none", borderRadius: 2 }}
                                fullWidth
                              >
                                {g.isJoined ? "Đã tham gia" : "Tham gia nhóm"}
                              </Button>
                            </Box>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              )}
            </Card>
          </>
        )}
      </Box>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }} iconMapping={{ success: <CheckIcon fontSize="inherit" /> }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
}
