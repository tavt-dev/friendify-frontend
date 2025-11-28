// src/pages/GroupDetailPage.jsx
import { useState, useEffect, useCallback, useRef } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import PublicIcon from "@mui/icons-material/Public";
import LockIcon from "@mui/icons-material/Lock";
import PeopleIcon from "@mui/icons-material/People";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import SettingsIcon from "@mui/icons-material/Settings";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ShieldIcon from "@mui/icons-material/Shield";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import ImageIcon from "@mui/icons-material/Image";
import EditIcon from "@mui/icons-material/Edit";
import PageLayout from "./PageLayout";
import { useUser } from "../contexts/UserContext";
import {
  getGroupDetail,
  getGroupMembers,
  getJoinRequests,
  processJoinRequest,
  leaveGroup,
  updateGroup,
  deleteGroup,
  removeMember,
  updateMemberRole,
  addMember,
  uploadGroupAvatar,
  uploadGroupCover,
} from "../services/groupService";
import { extractArrayFromResponse } from "../utils/apiHelper";
import { getPostsByGroup } from "../services/postService";
import { apiFetch } from "../services/apiHelper";
import { API_ENDPOINTS } from "../config/apiConfig";
import CreatePostButton from "../components/CreatePostButton";
import Post from "../components/Post";

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
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberMenuAnchor, setMemberMenuAnchor] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [editingAbout, setEditingAbout] = useState(false);
  const [aboutEditData, setAboutEditData] = useState({
    description: "",
  });
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const [groupSettings, setGroupSettings] = useState({
    name: "",
    description: "",
    privacy: "PUBLIC",
    requiresApproval: false,
    allowPosting: true,
    onlyAdminCanPost: false,
    moderationRequired: false,
  });

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

  const handlePostCreated = useCallback((newPost) => {
    // Reload posts after creating a new one
    loadPosts();
    setSnackbar({
      open: true,
      message: "Đăng bài thành công!",
      severity: "success"
    });
  }, [loadPosts]);

  useEffect(() => {
    loadGroupDetail();
  }, [loadGroupDetail]);

  // Load settings khi mở dialog
  useEffect(() => {
    if (settingsDialogOpen && group) {
      setGroupSettings({
        name: group.name || "",
        description: group.description || "",
        privacy: group.privacy || "PUBLIC",
        requiresApproval: group.requiresApproval || false,
        allowPosting: group.allowPosting !== undefined ? group.allowPosting : true,
        onlyAdminCanPost: group.onlyAdminCanPost || false,
        moderationRequired: group.moderationRequired || false,
      });
      setAvatarPreview(group.avatarUrl || group.avatar || null);
      setCoverPreview(group.coverImageUrl || group.cover || null);
      setAvatarFile(null);
      setCoverFile(null);
    }
  }, [settingsDialogOpen, group]);

  const handleAvatarSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setSnackbar({
          open: true,
          message: "Vui lòng chọn file ảnh!",
          severity: "error"
        });
        return;
      }
      
      // Nếu đang trong dialog settings, chỉ set file để upload sau
      if (settingsDialogOpen) {
        setAvatarFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatarPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        // Upload ngay lập tức nếu chọn từ header
        setUploadingAvatar(true);
        try {
          const avatarResponse = await uploadGroupAvatar(groupId, file);
          const newAvatarUrl = avatarResponse?.data?.result?.avatarUrl || avatarResponse?.data?.avatarUrl;
          if (newAvatarUrl) {
            setGroup(prev => prev ? { ...prev, avatarUrl: newAvatarUrl } : null);
          }
          setSnackbar({
            open: true,
            message: "Đã cập nhật avatar nhóm!",
            severity: "success"
          });
          await loadGroupDetail();
        } catch (error) {
          console.error('Error uploading avatar:', error);
          setSnackbar({
            open: true,
            message: error.response?.data?.message || "Không thể upload avatar. Vui lòng thử lại!",
            severity: "error"
          });
        } finally {
          setUploadingAvatar(false);
          // Reset input để có thể chọn lại file cùng tên
          if (avatarInputRef.current) {
            avatarInputRef.current.value = '';
          }
        }
      }
    }
  };

  const handleCoverSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setSnackbar({
          open: true,
          message: "Vui lòng chọn file ảnh!",
          severity: "error"
        });
        return;
      }
      
      // Nếu đang trong dialog settings, chỉ set file để upload sau
      if (settingsDialogOpen) {
        setCoverFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setCoverPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        // Upload ngay lập tức nếu chọn từ header
        setUploadingCover(true);
        try {
          const coverResponse = await uploadGroupCover(groupId, file);
          const newCoverUrl = coverResponse?.data?.result?.coverImageUrl || coverResponse?.data?.coverImageUrl;
          if (newCoverUrl) {
            setGroup(prev => prev ? { ...prev, coverImageUrl: newCoverUrl } : null);
          }
          setSnackbar({
            open: true,
            message: "Đã cập nhật ảnh bìa nhóm!",
            severity: "success"
          });
          await loadGroupDetail();
        } catch (error) {
          console.error('Error uploading cover:', error);
          setSnackbar({
            open: true,
            message: error.response?.data?.message || "Không thể upload ảnh bìa. Vui lòng thử lại!",
            severity: "error"
          });
        } finally {
          setUploadingCover(false);
          // Reset input để có thể chọn lại file cùng tên
          if (coverInputRef.current) {
            coverInputRef.current.value = '';
          }
        }
      }
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiFetch(API_ENDPOINTS.FILE.UPLOAD, {
      method: 'POST',
      body: formData,
    });
    return res.data?.result || res.data?.url || res.data?.data?.url;
  };

  useEffect(() => {
    if (tabValue === 1) {
      loadMembers();
    } else if (tabValue === 2) {
      loadJoinRequests();
    } else if (tabValue === 0) {
      loadPosts();
      // Also load members to check if user is a member (for showing create post button)
      loadMembers();
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

  const handleOpenSettings = () => {
    setSettingsDialogOpen(true);
  };

  const handleCloseSettings = () => {
    setSettingsDialogOpen(false);
  };

  const handleUpdateGroup = async () => {
    if (!groupSettings.name.trim()) {
      setSnackbar({
        open: true,
        message: "Vui lòng nhập tên nhóm!",
        severity: "error"
      });
      return;
    }

    setUpdating(true);
    try {
      let avatarUrl = null;
      let coverImageUrl = null;

      // Upload avatar trực tiếp qua group API nếu có
      if (avatarFile) {
        setUploadingAvatar(true);
        try {
          const avatarResponse = await uploadGroupAvatar(groupId, avatarFile);
          // Cập nhật preview với URL mới từ response
          const newAvatarUrl = avatarResponse?.data?.result?.avatarUrl || avatarResponse?.data?.avatarUrl;
          if (newAvatarUrl) {
            setAvatarPreview(newAvatarUrl);
            // Cập nhật group state ngay lập tức
            setGroup(prev => prev ? { ...prev, avatarUrl: newAvatarUrl } : null);
          }
          setSnackbar({
            open: true,
            message: "Đã cập nhật avatar nhóm!",
            severity: "success"
          });
        } catch (error) {
          console.error('Error uploading avatar:', error);
          setSnackbar({
            open: true,
            message: error.response?.data?.message || "Không thể upload avatar. Vui lòng thử lại!",
            severity: "error"
          });
          setUploadingAvatar(false);
          setUpdating(false);
          return;
        }
        setUploadingAvatar(false);
        setAvatarFile(null); // Clear file sau khi upload thành công
      }

      // Upload cover trực tiếp qua group API nếu có
      if (coverFile) {
        setUploadingCover(true);
        try {
          const coverResponse = await uploadGroupCover(groupId, coverFile);
          // Cập nhật preview với URL mới từ response
          const newCoverUrl = coverResponse?.data?.result?.coverImageUrl || coverResponse?.data?.coverImageUrl;
          if (newCoverUrl) {
            setCoverPreview(newCoverUrl);
            // Cập nhật group state ngay lập tức
            setGroup(prev => prev ? { ...prev, coverImageUrl: newCoverUrl } : null);
          }
          setSnackbar({
            open: true,
            message: "Đã cập nhật ảnh bìa nhóm!",
            severity: "success"
          });
        } catch (error) {
          console.error('Error uploading cover:', error);
          setSnackbar({
            open: true,
            message: error.response?.data?.message || "Không thể upload ảnh bìa. Vui lòng thử lại!",
            severity: "error"
          });
          setUploadingCover(false);
          setUpdating(false);
          return;
        }
        setUploadingCover(false);
        setCoverFile(null); // Clear file sau khi upload thành công
      }

      // Chỉ update group settings nếu có thay đổi về text fields
      const hasTextChanges = 
        groupSettings.name.trim() !== (group?.name || "") ||
        groupSettings.description.trim() !== (group?.description || "") ||
        groupSettings.privacy !== (group?.privacy || "PUBLIC") ||
        groupSettings.requiresApproval !== (group?.requiresApproval || false) ||
        groupSettings.allowPosting !== (group?.allowPosting !== undefined ? group.allowPosting : true) ||
        groupSettings.onlyAdminCanPost !== (group?.onlyAdminCanPost || false) ||
        groupSettings.moderationRequired !== (group?.moderationRequired || false);

      if (hasTextChanges) {
        const updateData = {
          name: groupSettings.name.trim(),
          description: groupSettings.description.trim() || null,
          privacy: groupSettings.privacy,
          requiresApproval: groupSettings.requiresApproval,
          allowPosting: groupSettings.allowPosting,
          onlyAdminCanPost: groupSettings.onlyAdminCanPost,
          moderationRequired: groupSettings.moderationRequired,
        };

        await updateGroup(groupId, updateData);
        setSnackbar({
          open: true,
          message: "Đã cập nhật thông tin nhóm!",
          severity: "success"
        });
      }

      // Reload group detail để đảm bảo UI được cập nhật
      await loadGroupDetail();
      
      // Đóng dialog sau khi hoàn thành
      setSettingsDialogOpen(false);
    } catch (error) {
      console.error('Error updating group:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Không thể cập nhật nhóm",
        severity: "error"
      });
    } finally {
      setUpdating(false);
      setUploadingAvatar(false);
      setUploadingCover(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleDeleteGroup = async () => {
    setDeleting(true);
    try {
      await deleteGroup(groupId);
      setSnackbar({
        open: true,
        message: "Đã xóa nhóm thành công!",
        severity: "success"
      });
      setDeleteDialogOpen(false);
      navigate("/groups");
    } catch (error) {
      console.error('Error deleting group:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Không thể xóa nhóm",
        severity: "error"
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleMemberMenuOpen = (event, member) => {
    setMemberMenuAnchor(event.currentTarget);
    setSelectedMember(member);
  };

  const handleMemberMenuClose = () => {
    setMemberMenuAnchor(null);
    setSelectedMember(null);
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;
    try {
      await removeMember(groupId, selectedMember.userId || selectedMember.id);
      setSnackbar({
        open: true,
        message: "Đã xóa thành viên khỏi nhóm!",
        severity: "success"
      });
      handleMemberMenuClose();
      await loadMembers();
      await loadGroupDetail();
    } catch (error) {
      console.error('Error removing member:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Không thể xóa thành viên",
        severity: "error"
      });
    }
  };

  const handleUpdateMemberRole = async (role) => {
    if (!selectedMember) return;
    try {
      await updateMemberRole(groupId, selectedMember.userId || selectedMember.id, role);
      setSnackbar({
        open: true,
        message: `Đã thay đổi quyền thành ${role === 'ADMIN' ? 'Admin' : role === 'MODERATOR' ? 'Moderator' : 'Member'}!`,
        severity: "success"
      });
      handleMemberMenuClose();
      await loadMembers();
    } catch (error) {
      console.error('Error updating member role:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Không thể thay đổi quyền",
        severity: "error"
      });
    }
  };

  const isOwner = group?.ownerId === currentUser?.id || group?.ownerId === currentUser?.userId;
  const isAdmin = group?.memberRole?.role === 'ADMIN' || isOwner;
  const isModerator = group?.memberRole?.role === 'MODERATOR';
  const canManageRequests = isAdmin || isModerator;
  const canManageMembers = isAdmin;
  
  // Check if user is a member (owner, in members list, or group.isMember is true)
  const currentUserId = currentUser?.id || currentUser?.userId;
  const isMember = isOwner || 
                   group?.isMember || 
                   members.some(m => (m.userId || m.id) === currentUserId);
  
  // Check if user can post to group
  // - User must be a member
  // - Group must allow posting (allowPosting = true, default to true if not set)
  // - If onlyAdminCanPost = true, user must be admin/moderator/owner
  // - If onlyAdminCanPost = false or undefined/null, ALL members can post
  const allowPosting = group?.allowPosting !== false; // Default to true if not set
  const onlyAdminCanPost = group?.onlyAdminCanPost === true; // Explicitly check for true
  
  const canPost = isMember && 
                  allowPosting && 
                  (!onlyAdminCanPost || isAdmin || isModerator);

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
              {/* Cover Upload Button */}
              {(isOwner || isAdmin) && (
                <>
                  <input
                    type="file"
                    ref={coverInputRef}
                    onChange={handleCoverSelect}
                    accept="image/*"
                    style={{ display: "none" }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={uploadingCover}
                    sx={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      bgcolor: "rgba(0,0,0,0.6)",
                      color: "white",
                      "&:hover": {
                        bgcolor: "rgba(0,0,0,0.8)",
                      },
                    }}
                  >
                    <ImageIcon />
                  </IconButton>
                </>
              )}
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
                  <Box sx={{ position: "relative", mr: { xs: 2, sm: 3 } }}>
                    <Avatar
                      src={groupAvatar}
                      sx={{
                        width: { xs: 80, sm: 100, md: 120 },
                        height: { xs: 80, sm: 100, md: 120 },
                        border: "4px solid white",
                      }}
                    />
                    {(isOwner || isAdmin) && (
                      <>
                        <input
                          type="file"
                          ref={avatarInputRef}
                          onChange={handleAvatarSelect}
                          accept="image/*"
                          style={{ display: "none" }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => avatarInputRef.current?.click()}
                          disabled={uploadingAvatar}
                          sx={{
                            position: "absolute",
                            bottom: 0,
                            right: 0,
                            bgcolor: "primary.main",
                            color: "white",
                            border: "2px solid white",
                            "&:hover": {
                              bgcolor: "primary.dark",
                            },
                            width: { xs: 28, sm: 32 },
                            height: { xs: 28, sm: 32 },
                          }}
                        >
                          <PhotoCameraIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
                        </IconButton>
                      </>
                    )}
                  </Box>
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
                </Box>

                <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                  {group.isMember && (
                    <>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ExitToAppIcon />}
                        onClick={handleLeaveGroup}
                        sx={{ textTransform: "none", borderRadius: 2 }}
                      >
                        Rời nhóm
                      </Button>
                      {(isOwner || isAdmin) && (
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<SettingsIcon />}
                          onClick={handleOpenSettings}
                          sx={{ 
                            textTransform: "none", 
                            borderRadius: 2,
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            "&:hover": {
                              background: "linear-gradient(135deg, #5568d3 0%, #63428a 100%)",
                            },
                          }}
                        >
                          Chỉnh sửa nhóm
                        </Button>
                      )}
                      {isOwner && (
                        <IconButton 
                          size="small" 
                          onClick={() => setDeleteDialogOpen(true)}
                          sx={{ color: "error.main" }}
                          title="Xóa nhóm"
                        >
                          <DeleteIcon fontSize="small" />
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
                <Box>
                  {/* Posts List */}
                  {posts.length === 0 ? (
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
                      <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
                        Chưa có bài viết nào trong nhóm này
                      </Typography>
                    </Card>
                  ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {posts.map((post) => {
                        // Format post data for Post component
                        const formattedPost = {
                          id: post.id,
                          avatar: post.avatar || post.userAvatar || null,
                          username: post.username || post.userName || "Unknown",
                          firstName: post.firstName || "",
                          lastName: post.lastName || "",
                          displayName: post.displayName || 
                            (post.lastName && post.firstName 
                              ? `${post.lastName} ${post.firstName}`.trim()
                              : post.firstName || post.lastName || post.username || "Unknown"),
                          created: post.createdDate || post.created || new Date().toISOString(),
                          content: post.content || "",
                          media: (post.imageUrls || []).map((url) => ({
                            url: url,
                            type: "image",
                            alt: `Post image ${post.id}`,
                          })),
                          userId: post.userId || post.ownerId,
                          privacy: post.privacy || "PUBLIC",
                          likeCount: post.likeCount || 0,
                          commentCount: post.commentCount || 0,
                          isLiked: post.isLiked || false,
                          ...post,
                        };
                        return (
                          <Post
                            key={post.id}
                            post={formattedPost}
                            onDelete={() => {
                              loadPosts();
                            }}
                            onEdit={() => {
                              loadPosts();
                            }}
                          />
                        );
                      })}
                    </Box>
                  )}
                </Box>
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
                                {member.userId === group?.ownerId || member.id === group?.ownerId ? (
                                  <Chip label="Chủ nhóm" size="small" color="error" sx={{ height: 20, fontSize: 11 }} />
                                ) : member.role === "ADMIN" ? (
                                  <Chip label="Admin" size="small" color="error" sx={{ height: 20, fontSize: 11 }} />
                                ) : member.role === "MODERATOR" ? (
                                  <Chip label="Mod" size="small" color="warning" sx={{ height: 20, fontSize: 11 }} />
                                ) : null}
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                Tham gia {member.joinedDate || "N/A"}
                              </Typography>
                            </Box>
                            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
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
                              {canManageMembers && 
                               (member.userId !== group?.ownerId && member.id !== group?.ownerId) &&
                               (member.userId !== currentUser?.id && member.id !== currentUser?.userId) && (
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleMemberMenuOpen(e, member)}
                                >
                                  <MoreVertIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
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
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                    <Typography variant="h6" fontWeight={700}>
                      Giới thiệu về nhóm
                    </Typography>
                    {isAdmin && !editingAbout && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => {
                          setEditingAbout(true);
                          setAboutEditData({
                            description: group.description || "",
                          });
                        }}
                        sx={{ textTransform: "none", borderRadius: 2 }}
                      >
                        Chỉnh sửa
                      </Button>
                    )}
                    {isAdmin && editingAbout && (
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            setEditingAbout(false);
                            setAboutEditData({ description: "" });
                          }}
                          sx={{ textTransform: "none", borderRadius: 2 }}
                        >
                          Hủy
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={async () => {
                            try {
                              await updateGroup(groupId, {
                                description: aboutEditData.description.trim() || null,
                              });
                              setSnackbar({
                                open: true,
                                message: "Đã cập nhật giới thiệu nhóm!",
                                severity: "success"
                              });
                              setEditingAbout(false);
                              await loadGroupDetail();
                            } catch (error) {
                              console.error('Error updating about:', error);
                              setSnackbar({
                                open: true,
                                message: error.response?.data?.message || "Không thể cập nhật",
                                severity: "error"
                              });
                            }
                          }}
                          sx={{ textTransform: "none", borderRadius: 2 }}
                        >
                          Lưu
                        </Button>
                      </Box>
                    )}
                  </Box>
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700} mb={1}>
                        Mô tả
                      </Typography>
                      {editingAbout ? (
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          value={aboutEditData.description}
                          onChange={(e) => setAboutEditData({ ...aboutEditData, description: e.target.value })}
                          placeholder="Nhập mô tả về nhóm..."
                          sx={{
                            "& .MuiOutlinedInput-root": { borderRadius: 2 },
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          {group.description || "Không có mô tả"}
                        </Typography>
                      )}
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700} mb={1}>
                        Quyền riêng tư
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {group.privacy === "PUBLIC" ? <PublicIcon /> : group.privacy === "PRIVATE" ? <LockIcon /> : <PeopleIcon />}
                        <Typography variant="body2" color="text.secondary">
                          {group.privacy === "PUBLIC" ? "Nhóm công khai" : group.privacy === "PRIVATE" ? "Nhóm riêng tư" : "Nhóm đóng"} •{" "}
                          {group.privacy === "PUBLIC"
                            ? "Bất kỳ ai cũng có thể xem nội dung của nhóm"
                            : group.privacy === "PRIVATE"
                            ? "Chỉ thành viên mới có thể xem nội dung"
                            : "Ai cũng có thể xem nhưng cần tham gia để tương tác"}
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

      {/* Settings Dialog */}
      <Dialog
        open={settingsDialogOpen}
        onClose={handleCloseSettings}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4, maxHeight: '90vh' },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1, fontSize: '1.5rem' }}>
          Chỉnh sửa thông tin nhóm
        </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: 'calc(90vh - 200px)', overflowY: 'auto' }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Avatar Upload */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} mb={1}>
                Avatar nhóm
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  src={avatarPreview || group?.avatarUrl || group?.avatar}
                  sx={{ width: 80, height: 80 }}
                />
                <Box>
                  <input
                    type="file"
                    ref={avatarInputRef}
                    onChange={handleAvatarSelect}
                    accept="image/*"
                    style={{ display: "none" }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<PhotoCameraIcon />}
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar || updating}
                    sx={{ textTransform: "none", borderRadius: 2 }}
                  >
                    {uploadingAvatar ? "Đang upload..." : "Chọn ảnh"}
                  </Button>
                  {avatarFile && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                      {avatarFile.name}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Cover Image Upload */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} mb={1}>
                Ảnh bìa nhóm
              </Typography>
              <Box>
                {coverPreview && (
                  <Box
                    sx={{
                      width: "100%",
                      height: 150,
                      borderRadius: 2,
                      overflow: "hidden",
                      mb: 1,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </Box>
                )}
                <input
                  type="file"
                  ref={coverInputRef}
                  onChange={handleCoverSelect}
                  accept="image/*"
                  style={{ display: "none" }}
                />
                <Button
                  variant="outlined"
                  startIcon={<ImageIcon />}
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploadingCover || updating}
                  fullWidth
                  sx={{ textTransform: "none", borderRadius: 2 }}
                >
                  {uploadingCover ? "Đang upload..." : coverPreview ? "Thay đổi ảnh bìa" : "Chọn ảnh bìa"}
                </Button>
                {coverFile && (
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                    {coverFile.name}
                  </Typography>
                )}
              </Box>
            </Box>

            <Divider />

            <Typography variant="h6" fontWeight={700} sx={{ mt: 1 }}>
              Thông tin cơ bản
            </Typography>

            <TextField
              fullWidth
              label="Tên nhóm *"
              value={groupSettings.name}
              onChange={(e) => setGroupSettings({ ...groupSettings, name: e.target.value })}
              required
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
            />

            <TextField
              fullWidth
              label="Mô tả"
              value={groupSettings.description}
              onChange={(e) => setGroupSettings({ ...groupSettings, description: e.target.value })}
              multiline
              rows={3}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
            />

            <FormControl fullWidth>
              <InputLabel>Quyền riêng tư</InputLabel>
              <Select
                value={groupSettings.privacy}
                onChange={(e) => setGroupSettings({ ...groupSettings, privacy: e.target.value })}
                label="Quyền riêng tư"
                sx={{
                  borderRadius: 2,
                }}
              >
                <MenuItem value="PUBLIC">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PublicIcon fontSize="small" />
                    <span>Công khai</span>
                  </Box>
                </MenuItem>
                <MenuItem value="PRIVATE">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LockIcon fontSize="small" />
                    <span>Riêng tư</span>
                  </Box>
                </MenuItem>
                <MenuItem value="CLOSED">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PeopleIcon fontSize="small" />
                    <span>Đóng</span>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <Divider />
            
            <Typography variant="h6" fontWeight={700} sx={{ mt: 2, mb: 1.5 }}>
              Cài đặt đăng bài
            </Typography>

            <Box sx={{ 
              p: 2, 
              borderRadius: 2, 
              bgcolor: "action.hover",
              mb: 2,
              border: "1px solid",
              borderColor: "divider"
            }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Điều chỉnh quyền đăng bài cho thành viên trong nhóm
              </Typography>

              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={groupSettings.allowPosting}
                      onChange={(e) => {
                        const newValue = e.target.checked;
                        setGroupSettings({ 
                          ...groupSettings, 
                          allowPosting: newValue,
                          // Tự động tắt các tùy chọn liên quan nếu tắt đăng bài
                          onlyAdminCanPost: newValue ? groupSettings.onlyAdminCanPost : false,
                          moderationRequired: newValue ? groupSettings.moderationRequired : false
                        });
                      }}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        Cho phép đăng bài
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Bật/tắt tính năng đăng bài trong nhóm. Khi tắt, không ai có thể đăng bài.
                      </Typography>
                    </Box>
                  }
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={groupSettings.onlyAdminCanPost}
                      onChange={(e) => setGroupSettings({ ...groupSettings, onlyAdminCanPost: e.target.checked })}
                      color="primary"
                      disabled={!groupSettings.allowPosting}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        Chỉ admin/moderator được đăng bài
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {groupSettings.onlyAdminCanPost 
                          ? "Chỉ admin và moderator mới có thể đăng bài. Thành viên thông thường không thể đăng."
                          : "Tất cả thành viên đều có thể đăng bài (yêu cầu bật 'Cho phép đăng bài')"
                        }
                      </Typography>
                    </Box>
                  }
                />
              </Stack>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={groupSettings.moderationRequired}
                  onChange={(e) => setGroupSettings({ ...groupSettings, moderationRequired: e.target.checked })}
                  color="primary"
                  disabled={!groupSettings.allowPosting}
                />
              }
              label={
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    Cần kiểm duyệt bài đăng
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Mọi bài đăng cần được admin/moderator duyệt trước khi hiển thị (yêu cầu bật "Cho phép đăng bài")
                  </Typography>
                </Box>
              }
            />

            <Divider />

            <Typography variant="h6" fontWeight={700} sx={{ mt: 1 }}>
              Cài đặt tham gia
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={groupSettings.requiresApproval}
                  onChange={(e) => setGroupSettings({ ...groupSettings, requiresApproval: e.target.checked })}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    Yêu cầu phê duyệt tham gia
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Khi bật, mọi yêu cầu tham gia nhóm cần được admin/moderator phê duyệt
                  </Typography>
                </Box>
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleCloseSettings}
            disabled={updating || uploadingAvatar || uploadingCover}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 3,
              px: 3,
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleUpdateGroup}
            variant="contained"
            disabled={updating || uploadingAvatar || uploadingCover}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 3,
              px: 4,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #5568d3 0%, #63428a 100%)",
              },
            }}
          >
            {updating || uploadingAvatar || uploadingCover ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Member Management Menu */}
      <Menu
        anchorEl={memberMenuAnchor}
        open={Boolean(memberMenuAnchor)}
        onClose={handleMemberMenuClose}
        PaperProps={{
          sx: { borderRadius: 3, minWidth: 200 },
        }}
      >
        <MenuItem onClick={() => handleUpdateMemberRole('ADMIN')}>
          <ListItemIcon>
            <AdminPanelSettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Thăng làm Admin</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleUpdateMemberRole('MODERATOR')}>
          <ListItemIcon>
            <ShieldIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Thăng làm Moderator</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleUpdateMemberRole('MEMBER')}>
          <ListItemIcon>
            <PeopleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Hạ xuống Member</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleRemoveMember} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <PersonRemoveIcon fontSize="small" sx={{ color: "error.main" }} />
          </ListItemIcon>
          <ListItemText>Xóa khỏi nhóm</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Group Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: 4 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Xóa nhóm</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Bạn có chắc chắn muốn xóa nhóm <strong>{group?.name}</strong> không?
          </Typography>
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            Hành động này không thể hoàn tác. Tất cả dữ liệu của nhóm sẽ bị xóa vĩnh viễn.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 3,
              px: 3,
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleDeleteGroup}
            variant="contained"
            color="error"
            disabled={deleting}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 3,
              px: 4,
            }}
          >
            {deleting ? "Đang xóa..." : "Xóa nhóm"}
          </Button>
        </DialogActions>
      </Dialog>

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

      {/* Floating Create Post Button - Only show if user can post and on Posts tab */}
      {canPost && currentUser && tabValue === 0 && (
        <CreatePostButton
          user={currentUser}
          onPostCreated={handlePostCreated}
          defaultGroupId={groupId}
          hideGroupSelector={true}
          show={true}
        />
      )}
    </PageLayout>
  );
}
