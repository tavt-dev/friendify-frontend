// src/pages/Settings.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  Typography,
  Avatar,
  Button,
  Tabs,
  Tab,
  TextField,
  Divider,
  Stack,
  IconButton,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import SecurityIcon from "@mui/icons-material/Security";
import CloseIcon from "@mui/icons-material/Close";
import PageLayout from "./PageLayout";
import { useUser } from "../contexts/UserContext";
import { getMyInfo, updateProfile, uploadAvatar } from "../services/userService";
import { changePassword } from "../services/identityService";
import { isAuthenticated, logOut } from "../services/identityService";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, loadUser } = useUser();
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const avatarInputRef = useRef(null);

  // Profile Settings
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    bio: "",
    city: "",
    country: "",
    website: "",
    avatar: "",
  });


  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Load user profile and settings on mount
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        // Load user profile
        if (user) {
          setProfile({
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email || "",
            phoneNumber: user.phoneNumber || user.phone || "",
            bio: user.bio || "",
            city: user.city || "",
            country: user.country || "",
            website: user.website || "",
            avatar: user.avatar || "",
          });
        } else {
          // If user not loaded, fetch it
          const profileResponse = await getMyInfo();
          if (profileResponse.data?.result) {
            const userData = profileResponse.data.result;
            setProfile({
              firstName: userData.firstName || "",
              lastName: userData.lastName || "",
              email: userData.email || "",
              phoneNumber: userData.phoneNumber || userData.phone || "",
              bio: userData.bio || "",
              city: userData.city || "",
              country: userData.country || "",
              website: userData.website || "",
              avatar: userData.avatar || "",
            });
          }
        }

      } catch (error) {
        console.error("Error loading settings data:", error);
        setSnackbar({
          open: true,
          message: "Không thể tải dữ liệu cài đặt",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, navigate]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleProfileChange = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };


  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const profileData = {
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
        bio: profile.bio.trim() || null,
        phoneNumber: profile.phoneNumber.trim() || null,
        city: profile.city.trim() || null,
        country: profile.country.trim() || null,
        website: profile.website.trim() || null,
      };

      const response = await updateProfile(profileData);
      if (response.data) {
        // Reload user data
        await loadUser();
        setSnackbar({
          open: true,
          message: "Đã lưu thông tin cá nhân!",
          severity: "success",
        });
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Không thể lưu thông tin cá nhân";
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };


  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setSnackbar({
        open: true,
        message: "Vui lòng điền đầy đủ thông tin",
        severity: "error",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSnackbar({
        open: true,
        message: "Mật khẩu mới và xác nhận mật khẩu không khớp",
        severity: "error",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setSnackbar({
        open: true,
        message: "Mật khẩu mới phải có ít nhất 6 ký tự",
        severity: "error",
      });
      return;
    }

    setSaving(true);
    try {
      const response = await changePassword(
        passwordForm.currentPassword.trim(),
        passwordForm.newPassword.trim()
      );
      
      // Check if response is successful (status 200-299)
      if (response && (response.status === 200 || response.status === 201 || response.data)) {
        setPasswordDialogOpen(false);
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setSnackbar({
          open: true,
          message: response.data?.message || "Đã đổi mật khẩu thành công!",
          severity: "success",
        });
      } else {
        throw new Error("Không thể đổi mật khẩu");
      }
    } catch (error) {
      console.error("Change password error:", error);
      let errorMessage = "Không thể đổi mật khẩu";
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };


  const handleAvatarChange = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setSnackbar({
        open: true,
        message: "Vui lòng chọn file ảnh",
        severity: "error",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSnackbar({
        open: true,
        message: "Kích thước file không được vượt quá 5MB",
        severity: "error",
      });
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await uploadAvatar(formData);
      if (response.data?.result?.avatar) {
        setProfile({ ...profile, avatar: response.data.result.avatar });
        await loadUser();
        setSnackbar({
          open: true,
          message: "Đã cập nhật ảnh đại diện!",
          severity: "success",
        });
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Không thể cập nhật ảnh đại diện";
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setSaving(false);
      // Reset input
      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <PageLayout>
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

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
        <Box sx={{ width: "100%", maxWidth: 1000, py: 2 }}>
          {/* Header */}
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
            <Typography
              sx={{
                fontSize: 26,
                fontWeight: 700,
                mb: 2,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Cài đặt
            </Typography>

            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontSize: 15,
                  fontWeight: 600,
                  minHeight: 48,
                },
                "& .Mui-selected": {
                  color: "primary.main",
                },
              }}
            >
              <Tab icon={<EditIcon />} iconPosition="start" label="Thông tin cá nhân" />
              <Tab icon={<SecurityIcon />} iconPosition="start" label="Bảo mật" />
            </Tabs>
          </Card>

          {/* Tab 0: Profile Settings */}
          {tabValue === 0 && (
            <Card
              elevation={0}
              sx={(t) => ({
                borderRadius: 4,
                p: 4,
                boxShadow: t.shadows[1],
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              })}
            >
              <Typography variant="h6" fontWeight={700} mb={3}>
                Thông tin cá nhân
              </Typography>

              {/* Avatar Section */}
              <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
                <Box sx={{ position: "relative" }}>
                  <Avatar
                    src={profile.avatar}
                    sx={{
                      width: 120,
                      height: 120,
                      border: "4px solid",
                      borderColor: "divider",
                    }}
                  />
                  <IconButton
                    onClick={handleAvatarChange}
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      bgcolor: "primary.main",
                      color: "white",
                      "&:hover": { bgcolor: "primary.dark" },
                    }}
                    aria-label="change-avatar"
                  >
                    <PhotoCameraIcon />
                  </IconButton>
                </Box>
                <Box sx={{ ml: 3 }}>
                  <Typography variant="h6" fontWeight={700}>
                    {`${profile.firstName} ${profile.lastName}`.trim() || "Người dùng"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    {profile.email}
                  </Typography>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleAvatarFileChange}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleAvatarChange}
                    disabled={saving}
                    sx={{
                      textTransform: "none",
                      borderRadius: 2,
                      fontWeight: 600,
                    }}
                  >
                    {saving ? "Đang tải..." : "Thay đổi ảnh đại diện"}
                  </Button>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Profile Form */}
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Họ"
                  value={profile.firstName}
                  onChange={(e) => handleProfileChange("firstName", e.target.value)}
                  disabled={saving}
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 3 },
                  }}
                />
                <TextField
                  fullWidth
                  label="Tên"
                  value={profile.lastName}
                  onChange={(e) => handleProfileChange("lastName", e.target.value)}
                  disabled={saving}
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 3 },
                  }}
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={profile.email}
                  disabled
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 3 },
                  }}
                  helperText="Email không thể thay đổi"
                />
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  value={profile.phoneNumber}
                  onChange={(e) => handleProfileChange("phoneNumber", e.target.value)}
                  disabled={saving}
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 3 },
                  }}
                />
                <TextField
                  fullWidth
                  label="Giới thiệu"
                  multiline
                  rows={3}
                  value={profile.bio}
                  onChange={(e) => handleProfileChange("bio", e.target.value)}
                  disabled={saving}
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 3 },
                  }}
                />
                <Stack direction="row" spacing={2}>
                  <TextField
                    fullWidth
                    label="Thành phố"
                    value={profile.city}
                    onChange={(e) => handleProfileChange("city", e.target.value)}
                    disabled={saving}
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: 3 },
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Quốc gia"
                    value={profile.country}
                    onChange={(e) => handleProfileChange("country", e.target.value)}
                    disabled={saving}
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: 3 },
                    }}
                  />
                </Stack>
                <TextField
                  fullWidth
                  label="Website"
                  value={profile.website}
                  onChange={(e) => handleProfileChange("website", e.target.value)}
                  disabled={saving}
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 3 },
                  }}
                />
              </Stack>

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4, gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleSaveProfile}
                  disabled={saving}
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
                  {saving ? <CircularProgress size={20} color="inherit" /> : "Lưu thay đổi"}
                </Button>
              </Box>
            </Card>
          )}

          {/* Tab 1: Security Settings */}
          {tabValue === 1 && (
            <Card
              elevation={0}
              sx={(t) => ({
                borderRadius: 4,
                p: 4,
                boxShadow: t.shadows[1],
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              })}
            >
              <Typography variant="h6" fontWeight={700} mb={3}>
                Bảo mật
              </Typography>

              <Alert severity="info" sx={{ borderRadius: 3 }}>
                <Typography variant="body2" fontWeight={600} mb={1}>
                  Đổi mật khẩu
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Để bảo vệ tài khoản, bạn nên đổi mật khẩu định kỳ
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setPasswordDialogOpen(true)}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 2,
                  }}
                >
                  Đổi mật khẩu
                </Button>
              </Alert>
            </Card>
          )}
        </Box>
      </Box>

      {/* Change Password Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => !saving && setPasswordDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: 4, maxWidth: 500 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Đổi mật khẩu</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Mật khẩu hiện tại"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
              }
              disabled={saving}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
            />
            <TextField
              fullWidth
              label="Mật khẩu mới"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
              }
              disabled={saving}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
            />
            <TextField
              fullWidth
              label="Xác nhận mật khẩu mới"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
              }
              disabled={saving}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => {
              setPasswordDialogOpen(false);
              setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            }}
            disabled={saving}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            disabled={saving}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #5568d3 0%, #63428a 100%)",
              },
            }}
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : "Đổi mật khẩu"}
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
          sx={{ borderRadius: 2, minWidth: 240, boxShadow: 3 }}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleCloseSnackbar}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
}
