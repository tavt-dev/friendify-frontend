// src/pages/GroupDetailPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  Typography,
  Avatar,
  Button,
  Tabs,
  Tab,
  IconButton,
  Divider,
  Stack,
  Snackbar,
  Alert,
  Chip,
  Grid,
  CircularProgress,
  Badge,
} from "@mui/material";
import PublicIcon from "@mui/icons-material/Public";
import LockIcon from "@mui/icons-material/Lock";
import PeopleIcon from "@mui/icons-material/People";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import SettingsIcon from "@mui/icons-material/Settings";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PageLayout from "./PageLayout";
import { useUser } from "../contexts/UserContext";
import {
  getGroupDetail,
  getGroupMembers,
  getJoinRequests,
  processJoinRequest,
  leaveGroup,
} from "../services/groupService";
import { extractArrayFromResponse } from "../utils/apiHelper";
import { getPostsByGroup } from "../services/postService";

export default function GroupDetailPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useUser();
  const [tabValue, setTabValue] = useState(0);
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const loadGroupDetail = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    try {
      const res = await getGroupDetail(groupId);
      const groupData = res.data?.result || res.data;
      setGroup(groupData);
    } catch (error) {
      console.error('Error loading group:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Không thể tải thông tin nhóm",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  const loadMembers = useCallback(async () => {
    if (!groupId) return;
    try {
      const res = await getGroupMembers(groupId, 1, 50);
      const data = extractArrayFromResponse(res.data);
      setMembers(data.items || []);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  }, [groupId]);

  const loadJoinRequests = useCallback(async () => {
    if (!groupId) return;
    setLoadingRequests(true);
    try {
      const res = await getJoinRequests(groupId, 1, 100);
      const data = extractArrayFromResponse(res.data);
      setJoinRequests(data.items || []);
    } catch (error) {
      console.error('Error loading join requests:', error);
      // Nếu không có quyền, không hiển thị lỗi
      if (error.response?.status !== 403) {
        setSnackbar({
          open: true,
          message: error.response?.data?.message || "Không thể tải yêu cầu tham gia",
          severity: "error"
        });
      }
    } finally {
      setLoadingRequests(false);
    }
  }, [groupId]);

  const loadPosts = useCallback(async () => {
    if (!groupId) return;
    try {
      const res = await getPostsByGroup(groupId, 1, 20);
      const data = extractArrayFromResponse(res.data);
      setPosts(data.items || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  }, [groupId]);

  useEffect(() => {
    loadGroupDetail();
  }, [loadGroupDetail]);

  useEffect(() => {
    if (tabValue === 1) {
      loadMembers();
    } else if (tabValue === 2) {
      loadJoinRequests();
    } else if (tabValue === 0) {
      loadPosts();
    }
  }, [tabValue, loadMembers, loadJoinRequests, loadPosts]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleProcessRequest = async (requestId, approve) => {
    try {
      await processJoinRequest(groupId, requestId, approve);
      setSnackbar({
        open: true,
        message: approve ? "Đã chấp nhận yêu cầu!" : "Đã từ chối yêu cầu!",
        severity: "success"
      });
      await loadJoinRequests();
      await loadMembers();
      await loadGroupDetail();
    } catch (error) {
      console.error('Error processing request:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Không thể xử lý yêu cầu",
        severity: "error"
      });
    }
  };

  const handleLeaveGroup = async () => {
    try {
      await leaveGroup(groupId);
      setSnackbar({ open: true, message: "Đã rời khỏi nhóm!", severity: "info" });
      navigate("/groups");
    } catch (error) {
      console.error('Error leaving group:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Không thể rời khỏi nhóm",
        severity: "error"
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const isAdmin = group?.memberRole?.role === 'ADMIN' || group?.ownerId === currentUser?.id || group?.ownerId === currentUser?.userId;
  const isModerator = group?.memberRole?.role === 'MODERATOR';
  const canManageRequests = isAdmin || isModerator;

  if (loading) {
    return (
      <PageLayout>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  if (!group) {
    return (
      <PageLayout>
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6">Không tìm thấy nhóm</Typography>
          <Button onClick={() => navigate("/groups")} sx={{ mt: 2 }}>
            Quay lại danh sách nhóm
          </Button>
        </Box>
      </PageLayout>
    );
  }

  const groupAvatar = group.avatarUrl || group.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(group.name || 'Group')}&background=667eea&color=fff&size=128`;
  const groupCover = group.coverImageUrl || group.cover || `https://picsum.photos/1200/400?random=${groupId}`;

  return (
    <PageLayout>
      <Box
        sx={{
          width: "100%",
          height: "100%",
          overflow: "auto",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 1200, py: { xs: 1, sm: 2 }, pl: 0, pr: { xs: 1, sm: 2 } }}>
          {/* Cover & Header */}
          <Card
            elevation={0}
            sx={(t) => ({
              borderRadius: { xs: 2, sm: 4 },
              mb: { xs: 2, sm: 3 },
              boxShadow: t.shadows[1],
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              overflow: "hidden",
            })}
          >
            {/* Cover Image */}
            <Box
              sx={{
                width: "100%",
                height: { xs: 200, sm: 250, md: 300 },
                backgroundImage: `url(${groupCover})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                  p: { xs: 2, sm: 3 },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "flex-end", flexWrap: "wrap", gap: { xs: 1, sm: 0 } }}>
                  <Avatar
                    src={groupAvatar}
                    sx={{
                      width: { xs: 80, sm: 100, md: 120 },
                      height: { xs: 80, sm: 100, md: 120 },
                      border: "4px solid white",
                      mr: { xs: 2, sm: 3 },
                    }}
                  />
                  <Box sx={{ flex: 1, color: "white", minWidth: { xs: "100%", sm: "auto" } }}>
                    <Typography variant="h4" fontWeight={700} mb={0.5} sx={{ fontSize: { xs: 20, sm: 28, md: 34 } }}>
                      {group.name}
                    </Typography>
                    <Stack direction="row" spacing={{ xs: 1, sm: 2 }} alignItems="center" flexWrap="wrap">
                      <Chip
                        icon={group.privacy === "PUBLIC" ? <PublicIcon /> : <LockIcon />}
                        label={group.privacy === "PUBLIC" ? "Nhóm công khai" : "Nhóm riêng tư"}
                        size="small"
                        sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }}
                      />
                      <Typography variant="body2">
                        <PeopleIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }} />
                        {group.memberCount?.toLocaleString() || 0} thành viên
                      </Typography>
                    </Stack>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Group Info & Actions */}
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, mb: 2, flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" color="text.secondary" mb={0.5} sx={{ fontSize: { xs: 13, sm: 15 } }}>
                    {group.description || "Không có mô tả"}
                  </Typography>
                  {group.category && (
                    <Chip label={group.category} size="small" sx={{ fontSize: { xs: 10, sm: 12 } }} />
                  )}
                </Box>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {group.isMember && (
                    <>
                      <IconButton size="small" onClick={handleLeaveGroup}>
                        <ExitToAppIcon fontSize="small" />
                      </IconButton>
                      {isAdmin && (
                        <IconButton size="small" onClick={() => navigate(`/groups/${groupId}/settings`)}>
                          <SettingsIcon fontSize="small" />
                        </IconButton>
                      )}
                    </>
                  )}
                </Stack>
              </Box>
            </Box>
          </Card>

          {/* Tabs */}
          <Card
            elevation={0}
            sx={(t) => ({
              borderRadius: { xs: 2, sm: 4 },
              mb: { xs: 2, sm: 3 },
              boxShadow: t.shadows[1],
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            })}
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                px: { xs: 0, sm: 2 },
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontSize: { xs: 13, sm: 15 },
                  fontWeight: 600,
                  minHeight: { xs: 42, sm: 48 },
                  px: { xs: 2, sm: 3 },
                },
                "& .Mui-selected": {
                  color: "primary.main",
                },
              }}
            >
              <Tab label="Bài viết" />
              <Tab label={`Thành viên (${members.length || group.memberCount || 0})`} />
              {canManageRequests && (
                <Tab
                  label={
                    <Badge badgeContent={joinRequests.length} color="error">
                      Yêu cầu tham gia
                    </Badge>
                  }
                />
              )}
              <Tab label="Giới thiệu" />
            </Tabs>
          </Card>

          {/* Tab Content */}
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid item xs={12} md={8}>
              {/* Tab 0: Posts */}
              {tabValue === 0 && (
                <Card
                  elevation={0}
                  sx={(t) => ({
                    borderRadius: 4,
                    p: 3,
                    boxShadow: t.shadows[1],
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  })}
                >
                  {posts.length === 0 ? (
                    <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
                      Chưa có bài viết nào
                    </Typography>
                  ) : (
                    <Typography variant="body1" color="text.secondary">
                      {posts.length} bài viết
                    </Typography>
                  )}
                </Card>
              )}

              {/* Tab 1: Members */}
              {tabValue === 1 && (
                <Card
                  elevation={0}
                  sx={(t) => ({
                    borderRadius: 4,
                    p: 3,
                    boxShadow: t.shadows[1],
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  })}
                >
                  <Typography variant="h6" fontWeight={700} mb={3}>
                    Thành viên
                  </Typography>
                  {members.length === 0 ? (
                    <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
                      Chưa có thành viên nào
                    </Typography>
                  ) : (
                    <Grid container spacing={2}>
                      {members.map((member) => (
                        <Grid item xs={12} sm={6} key={member.id || member.userId}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              p: 2,
                              borderRadius: 3,
                              border: "1px solid",
                              borderColor: "divider",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                bgcolor: "action.hover",
                                transform: "translateY(-2px)",
                              },
                            }}
                          >
                            <Avatar
                              src={member.avatar || member.avatarUrl}
                              sx={{ width: 56, height: 56, mr: 2 }}
                            />
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                                <Typography variant="body1" fontWeight={700}>
                                  {member.username || member.name || "Người dùng"}
                                </Typography>
                                {member.role === "ADMIN" && (
                                  <Chip label="Admin" size="small" color="error" sx={{ height: 20, fontSize: 11 }} />
                                )}
                                {member.role === "MODERATOR" && (
                                  <Chip label="Mod" size="small" color="warning" sx={{ height: 20, fontSize: 11 }} />
                                )}
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                Tham gia {member.joinedDate || "N/A"}
                              </Typography>
                            </Box>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => navigate(`/profile/${member.userId || member.id}`)}
                              sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                borderRadius: 2,
                              }}
                            >
                              Xem trang
                            </Button>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Card>
              )}

              {/* Tab 2: Join Requests (Admin/Moderator only) */}
              {tabValue === 2 && canManageRequests && (
                <Card
                  elevation={0}
                  sx={(t) => ({
                    borderRadius: 4,
                    p: 3,
                    boxShadow: t.shadows[1],
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  })}
                >
                  <Typography variant="h6" fontWeight={700} mb={3}>
                    Yêu cầu tham gia nhóm
                  </Typography>
                  {loadingRequests ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : joinRequests.length === 0 ? (
                    <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
                      Không có yêu cầu tham gia nào
                    </Typography>
                  ) : (
                    <Stack spacing={2}>
                      {joinRequests.map((request) => (
                        <Card
                          key={request.id}
                          sx={{
                            p: 2,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 3,
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                            <Avatar
                              src={request.avatar || request.avatarUrl}
                              sx={{ width: 56, height: 56, mr: 2 }}
                            />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body1" fontWeight={700}>
                                {request.username || request.name || "Người dùng"}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {request.requestedDate || "N/A"}
                              </Typography>
                              {request.message && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                  {request.message}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<CancelIcon />}
                              onClick={() => handleProcessRequest(request.id, false)}
                              sx={{ textTransform: "none", fontWeight: 600 }}
                            >
                              Từ chối
                            </Button>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => handleProcessRequest(request.id, true)}
                              sx={{ textTransform: "none", fontWeight: 600 }}
                            >
                              Chấp nhận
                            </Button>
                          </Stack>
                        </Card>
                      ))}
                    </Stack>
                  )}
                </Card>
              )}

              {/* Tab 3: About */}
              {tabValue === (canManageRequests ? 3 : 2) && (
                <Card
                  elevation={0}
                  sx={(t) => ({
                    borderRadius: 4,
                    p: 3,
                    boxShadow: t.shadows[1],
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  })}
                >
                  <Typography variant="h6" fontWeight={700} mb={3}>
                    Giới thiệu về nhóm
                  </Typography>
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700} mb={1}>
                        Mô tả
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {group.description || "Không có mô tả"}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700} mb={1}>
                        Quyền riêng tư
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {group.privacy === "PUBLIC" ? <PublicIcon /> : <LockIcon />}
                        <Typography variant="body2" color="text.secondary">
                          {group.privacy === "PUBLIC" ? "Nhóm công khai" : "Nhóm riêng tư"} •{" "}
                          {group.privacy === "PUBLIC"
                            ? "Bất kỳ ai cũng có thể xem nội dung của nhóm"
                            : "Chỉ thành viên mới có thể xem nội dung"}
                        </Typography>
                      </Box>
                    </Box>
                    <Divider />
                    {group.createdDate && (
                      <>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700} mb={1}>
                            Lịch sử
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Tạo ngày {new Date(group.createdDate).toLocaleDateString('vi-VN')}
                          </Typography>
                        </Box>
                        <Divider />
                      </>
                    )}
                    {group.category && (
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700} mb={1}>
                          Danh mục
                        </Typography>
                        <Chip label={group.category} />
                      </Box>
                    )}
                  </Stack>
                </Card>
              )}
            </Grid>

            {/* Sidebar */}
            <Grid item xs={12} md={4}>
              <Card
                elevation={0}
                sx={(t) => ({
                  borderRadius: 4,
                  p: 3,
                  mb: 3,
                  boxShadow: t.shadows[1],
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                })}
              >
                <Typography variant="h6" fontWeight={700} mb={2}>
                  Thông tin
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" mb={0.5}>
                      Thành viên
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {group.memberCount?.toLocaleString() || 0}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary" mb={0.5}>
                      Quyền riêng tư
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {group.privacy === "PUBLIC" ? <PublicIcon fontSize="small" /> : <LockIcon fontSize="small" />}
                      <Typography variant="body2" fontWeight={600}>
                        {group.privacy === "PUBLIC" ? "Công khai" : "Riêng tư"}
                      </Typography>
                    </Box>
                  </Box>
                  {group.requiresApproval && (
                    <>
                      <Divider />
                      <Box>
                        <Typography variant="body2" color="text.secondary" mb={0.5}>
                          Yêu cầu phê duyệt
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          Có
                        </Typography>
                      </Box>
                    </>
                  )}
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>

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
          sx={{ width: "100%", borderRadius: 3, boxShadow: 3, fontWeight: 500 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
}
