import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CircularProgress,
  Typography,
  Avatar,
  Button,
  Tabs,
  Tab,
  Grid,
  Paper,
  IconButton,
  Divider,
  Chip,
  Stack,
  TextField,
  Snackbar,
  Alert,
  Dialog,
  DialogContent,
  DialogActions,
  Badge,
  Tooltip,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Menu,
  MenuItem,
  ListItemIcon,
  Collapse,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import MessageIcon from "@mui/icons-material/Message";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EditIcon from "@mui/icons-material/Edit";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import CakeIcon from "@mui/icons-material/Cake";
import FavoriteIcon from "@mui/icons-material/Favorite";
import VerifiedIcon from "@mui/icons-material/Verified";
import CloseIcon from "@mui/icons-material/Close";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import PeopleIcon from "@mui/icons-material/People";
import ArticleIcon from "@mui/icons-material/Article";
import BlockIcon from "@mui/icons-material/Block";
import ReportIcon from "@mui/icons-material/Report";
import ShareIcon from "@mui/icons-material/Share";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  getMyInfo,
  uploadAvatar,
} from "../services/userService";
import { isAuthenticated, logOut } from "../services/authenticationService";
import Scene from "./Scene";
import Post from "../components/Post";

const mockPosts = [
  {
    id: "p1",
    avatar: "https://i.pravatar.cc/150?img=1",
    username: "John Doe",
    created: "2 hours ago",
    content: "Just finished an amazing project! 🚀",
    likes: 42,
    comments: 12,
  },
  {
    id: "p2",
    avatar: "https://i.pravatar.cc/150?img=1",
    username: "John Doe",
    created: "1 day ago",
    content: "Beautiful sunset today 🌅",
    likes: 87,
    comments: 23,
  },
  {
    id: "p3",
    avatar: "https://i.pravatar.cc/150?img=1",
    username: "John Doe",
    created: "3 days ago",
    content: "Learning new technologies every day! 💻",
    likes: 156,
    comments: 34,
  },
];

const mockFriends = [
  { id: 1, name: "Sarah Johnson", avatar: "https://i.pravatar.cc/150?img=2", mutualFriends: 12 },
  { id: 2, name: "Mike Chen", avatar: "https://i.pravatar.cc/150?img=3", mutualFriends: 8 },
  { id: 3, name: "Emma Wilson", avatar: "https://i.pravatar.cc/150?img=4", mutualFriends: 15 },
  { id: 4, name: "David Brown", avatar: "https://i.pravatar.cc/150?img=5", mutualFriends: 6 },
  { id: 5, name: "Lisa Anderson", avatar: "https://i.pravatar.cc/150?img=6", mutualFriends: 9 },
  { id: 6, name: "Tom Garcia", avatar: "https://i.pravatar.cc/150?img=7", mutualFriends: 11 },
  { id: 7, name: "Amy Lee", avatar: "https://i.pravatar.cc/150?img=8", mutualFriends: 7 },
  { id: 8, name: "Chris Martinez", avatar: "https://i.pravatar.cc/150?img=9", mutualFriends: 5 },
];

const mockPhotos = [
  "https://picsum.photos/400/300?random=1",
  "https://picsum.photos/400/300?random=2",
  "https://picsum.photos/400/300?random=3",
  "https://picsum.photos/400/300?random=4",
  "https://picsum.photos/400/300?random=5",
  "https://picsum.photos/400/300?random=6",
  "https://picsum.photos/400/300?random=7",
  "https://picsum.photos/400/300?random=8",
  "https://picsum.photos/400/300?random=9",
  "https://picsum.photos/400/300?random=10",
  "https://picsum.photos/400/300?random=11",
  "https://picsum.photos/400/300?random=12",
];

const mockSkills = [
  { name: "JavaScript", level: 90 },
  { name: "React", level: 85 },
  { name: "Node.js", level: 80 },
  { name: "Python", level: 75 },
  { name: "UI/UX Design", level: 70 },
  { name: "TypeScript", level: 82 },
];

const mockActivities = [
  { id: 1, type: "post", text: "Posted a new update", time: "2 hours ago", icon: "📝" },
  { id: 2, type: "friend", text: "Added 3 new friends", time: "1 day ago", icon: "👥" },
  { id: 3, type: "photo", text: "Uploaded 5 new photos", time: "2 days ago", icon: "📸" },
  { id: 4, type: "achievement", text: "Reached 1000 followers", time: "1 week ago", icon: "🏆" },
];

export default function ProfileEnhanced() {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [uploading, setUploading] = useState(false);
  const [editingAbout, setEditingAbout] = useState(false);
  const [photoDialog, setPhotoDialog] = useState({ open: false, index: 0 });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [coverHover, setCoverHover] = useState(false);
  const [avatarHover, setAvatarHover] = useState(false);
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const [coverImage, setCoverImage] = useState("https://picsum.photos/1200/400?random=10");
  const [profileStats, setProfileStats] = useState({
    views: 1234,
    likes: 567,
    friends: mockFriends.length,
    photos: mockPhotos.length,
    posts: mockPosts.length,
  });

  const [aboutData, setAboutData] = useState({
    bio: "Passionate developer and tech enthusiast 🚀\nLove to build amazing products and connect with people! 💻✨\nAlways learning, always growing 🌱",
    workplace: "Tech Company Inc.",
    position: "Senior Software Engineer",
    education: "Computer Science Graduate",
    location: "San Francisco, CA",
    birthdate: "January 15, 1995",
    relationship: "Single",
    interests: ["Technology", "Travel", "Photography", "Music"],
    isVerified: true,
  });

  const getUserDetails = async () => {
    try {
      const response = await getMyInfo();
      setUserDetails(response.data.result);
    } catch (error) {
      if (error.response?.status === 401) {
        logOut();
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    } else {
      getUserDetails();
    }
  }, [navigate]);

  const handleAvatarClick = () => avatarInputRef.current?.click();
  const handleCoverClick = () => coverInputRef.current?.click();

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      setSnackbar({ open: true, message: "Please select an image file", severity: "error" });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      const response = await uploadAvatar(formData);
      setUserDetails({ ...userDetails, avatar: response.data.result.avatar });
      setSnackbar({ open: true, message: "Avatar updated successfully!", severity: "success" });
    } catch (error) {
      setSnackbar({ open: true, message: "Failed to upload avatar", severity: "error" });
    } finally {
      setUploading(false);
    }
  };

  const handleCoverUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      setSnackbar({ open: true, message: "Please select an image file", severity: "error" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setCoverImage(e.target.result);
      setSnackbar({ open: true, message: "Cover photo updated!", severity: "success" });
    };
    reader.readAsDataURL(file);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handlePhotoClick = (index) => {
    setPhotoDialog({ open: true, index });
  };

  const handlePhotoClose = () => {
    setPhotoDialog({ ...photoDialog, open: false });
  };

  const handlePhotoNav = (direction) => {
    const newIndex = direction === "next" 
      ? (photoDialog.index + 1) % mockPhotos.length
      : (photoDialog.index - 1 + mockPhotos.length) % mockPhotos.length;
    setPhotoDialog({ ...photoDialog, index: newIndex });
  };

  const handleSaveAbout = () => {
    setEditingAbout(false);
    setSnackbar({ open: true, message: "Profile updated successfully!", severity: "success" });
  };

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const getBioPreview = (bio) => {
    const lines = bio.split('\n');
    if (lines.length <= 2 && bio.length <= 120) return bio;
    
    const preview = lines.slice(0, 2).join('\n');
    return preview.length > 120 ? preview.substring(0, 120) + '...' : preview;
  };

  const shouldShowSeeMore = (bio) => {
    const lines = bio.split('\n');
    return lines.length > 2 || bio.length > 120;
  };

  if (!userDetails) {
    return (
      <Scene>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress size={50} />
        </Box>
      </Scene>
    );
  }

  return (
    <Scene>
      <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto", pb: 4 }}>
        <Paper
          elevation={0}
          sx={{
            position: "relative",
            height: { xs: 280, sm: 380, md: 420 },
            borderRadius: { xs: 0, sm: "16px 16px 0 0" },
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
            borderBottom: "none",
          }}
          onMouseEnter={() => setCoverHover(true)}
          onMouseLeave={() => setCoverHover(false)}
        >
          <Box
            component="img"
            src={coverImage}
            alt="Cover"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.3s ease",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.2) 100%)",
            }}
          />
          <Tooltip title="Change cover photo" arrow>
            <IconButton
              onClick={handleCoverClick}
              sx={{
                position: "absolute",
                bottom: 20,
                right: 20,
                bgcolor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                opacity: coverHover ? 1 : 0,
                transition: "all 0.3s ease",
                "&:hover": { 
                  bgcolor: "white",
                  transform: "scale(1.1)",
                },
                boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
              }}
            >
              <PhotoCameraIcon />
            </IconButton>
          </Tooltip>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleCoverUpload}
          />
        </Paper>

        <Paper
          elevation={0}
          sx={{
            borderRadius: { xs: 0, sm: "0 0 16px 16px" },
            border: "1px solid",
            borderColor: "divider",
            borderTop: "none",
            p: { xs: 2, sm: 3 },
            mb: 3,
            bgcolor: "background.paper",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3, alignItems: { xs: "center", md: "flex-start" } }}>
            <Box 
              sx={{ 
                position: "relative", 
                mt: { xs: -14, md: -10 },
                alignSelf: { xs: "center", md: "flex-start" }
              }}
              onMouseEnter={() => setAvatarHover(true)}
              onMouseLeave={() => setAvatarHover(false)}
            >
              <Avatar
                src={userDetails.avatar}
                sx={{
                  width: { xs: 150, sm: 160 },
                  height: { xs: 150, sm: 160 },
                  border: "5px solid",
                  borderColor: "background.paper",
                  bgcolor: "primary.main",
                  fontSize: 64,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                }}
                onClick={handleAvatarClick}
              >
                {userDetails.firstName?.[0]}{userDetails.lastName?.[0]}
              </Avatar>
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  bgcolor: "rgba(0, 0, 0, 0.5)",
                  opacity: avatarHover ? 1 : 0,
                  transition: "opacity 0.3s ease",
                  cursor: "pointer",
                }}
                onClick={handleAvatarClick}
              >
                <PhotoCameraIcon sx={{ color: "white", fontSize: 40 }} />
              </Box>
              {uploading && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    bgcolor: "rgba(0, 0, 0, 0.5)",
                  }}
                >
                  <CircularProgress size={48} sx={{ color: "white" }} />
                </Box>
              )}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAvatarUpload}
              />
            </Box>

            <Box sx={{ flex: 1, textAlign: { xs: "center", md: "left" }, width: "100%" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: { xs: "center", md: "flex-start" }, flexWrap: "wrap" }}>
                <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: 28, sm: 34 } }}>
                  {userDetails.firstName} {userDetails.lastName}
                </Typography>
                {aboutData.isVerified && (
                  <Tooltip title="Verified Account" arrow>
                    <VerifiedIcon sx={{ fontSize: 28, color: "#1DA1F2" }} />
                  </Tooltip>
                )}
              </Box>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2, fontSize: 15 }}>
                @{userDetails.username}
              </Typography>
              
              {aboutData.bio && (
                <Box sx={{ mb: 2, maxWidth: 680, mx: { xs: "auto", md: 0 } }}>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      whiteSpace: "pre-line",
                      lineHeight: 1.6,
                      fontSize: 14,
                    }}
                  >
                    {bioExpanded ? aboutData.bio : getBioPreview(aboutData.bio)}
                  </Typography>
                  {shouldShowSeeMore(aboutData.bio) && (
                    <Button
                      size="small"
                      onClick={() => setBioExpanded(!bioExpanded)}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: 13,
                        p: 0,
                        mt: 0.5,
                        minWidth: "auto",
                        color: "primary.main",
                        "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
                      }}
                    >
                      {bioExpanded ? "See less" : "See more"}
                    </Button>
                  )}
                </Box>
              )}

              <Stack
                direction="row"
                spacing={1}
                sx={{ 
                  mb: 2.5, 
                  justifyContent: { xs: "center", md: "flex-start" }, 
                  flexWrap: "wrap", 
                  gap: 1.5,
                }}
              >
                <Chip 
                  icon={<VisibilityIcon sx={{ fontSize: 18 }} />} 
                  label={`${profileStats.views.toLocaleString()}`} 
                  size="medium"
                  sx={{ 
                    fontWeight: 600,
                    bgcolor: (t) => alpha(t.palette.mode === "dark" ? "#667eea" : "#667eea", 0.08),
                    color: "#667eea",
                    borderRadius: 3,
                    px: 1,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: (t) => alpha("#667eea", 0.15),
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.2)",
                    },
                  }}
                />
                <Chip 
                  icon={<ThumbUpIcon sx={{ fontSize: 18 }} />} 
                  label={`${profileStats.likes.toLocaleString()}`} 
                  size="medium"
                  sx={{ 
                    fontWeight: 600,
                    bgcolor: (t) => alpha("#764ba2", 0.08),
                    color: "#764ba2",
                    borderRadius: 3,
                    px: 1,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: (t) => alpha("#764ba2", 0.15),
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(118, 75, 162, 0.2)",
                    },
                  }}
                />
                <Chip 
                  icon={<PeopleIcon sx={{ fontSize: 18 }} />} 
                  label={`${profileStats.friends}`} 
                  size="medium"
                  sx={{ 
                    fontWeight: 600,
                    bgcolor: (t) => alpha("#667eea", 0.08),
                    color: "#667eea",
                    borderRadius: 3,
                    px: 1,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: (t) => alpha("#667eea", 0.15),
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.2)",
                    },
                  }}
                />
                <Chip 
                  icon={<PhotoLibraryIcon sx={{ fontSize: 18 }} />} 
                  label={`${profileStats.photos}`} 
                  size="medium"
                  sx={{ 
                    fontWeight: 600,
                    bgcolor: (t) => alpha("#764ba2", 0.08),
                    color: "#764ba2",
                    borderRadius: 3,
                    px: 1,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: (t) => alpha("#764ba2", 0.15),
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(118, 75, 162, 0.2)",
                    },
                  }}
                />
                <Chip 
                  icon={<ArticleIcon sx={{ fontSize: 18 }} />} 
                  label={`${profileStats.posts}`} 
                  size="medium"
                  sx={{ 
                    fontWeight: 600,
                    bgcolor: (t) => alpha("#667eea", 0.08),
                    color: "#667eea",
                    borderRadius: 3,
                    px: 1,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: (t) => alpha("#667eea", 0.15),
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.2)",
                    },
                  }}
                />
              </Stack>

              <Stack
                direction="row"
                spacing={1.5}
                sx={{ justifyContent: { xs: "center", md: "flex-start" }, flexWrap: "wrap", gap: 1.5 }}
              >
                <Button
                  variant="contained"
                  startIcon={<PersonAddIcon />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 3,
                    px: 3,
                    py: 1,
                    fontSize: 15,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                      boxShadow: "0 6px 20px rgba(102, 126, 234, 0.5)",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Add Friend
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<MessageIcon />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 3,
                    px: 3,
                    py: 1,
                    fontSize: 15,
                    borderWidth: 2,
                    borderColor: (t) => t.palette.mode === "dark" ? alpha("#667eea", 0.5) : "#667eea",
                    color: "#667eea",
                    "&:hover": {
                      borderWidth: 2,
                      borderColor: "#764ba2",
                      bgcolor: alpha("#667eea", 0.05),
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.2)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Message
                </Button>
                <IconButton
                  onClick={handleMenuOpen}
                  sx={{
                    border: "2px solid",
                    borderColor: "divider",
                    borderRadius: 3,
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: alpha("#667eea", 0.05),
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  <MoreHorizIcon />
                </IconButton>
              </Stack>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />
          <Box
            sx={{
              bgcolor: "background.paper",
              borderRadius: 0,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              mx: -3,
              px: 3,
            }}
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 48,
                "& .MuiTabs-indicator": {
                  height: 3,
                  borderRadius: "3px 3px 0 0",
                  background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                },
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontSize: 15,
                  fontWeight: 500,
                  minHeight: 48,
                  color: "text.secondary",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    color: "primary.main",
                    bgcolor: alpha("#667eea", 0.04),
                  },
                  "&.Mui-selected": {
                    color: "primary.main",
                    fontWeight: 700,
                  },
                },
              }}
            >
              <Tab label="Posts" />
              <Tab label="About" />
              <Tab label="Friends" />
              <Tab label="Photos" />
              <Tab label="Activity" />
            </Tabs>
          </Box>
        </Paper>

        <Box>
          {activeTab === 0 && (
            <Box sx={{ maxWidth: 680, mx: "auto" }}>
              {mockPosts.map((post) => (
                <Post key={post.id} post={post} />
              ))}
            </Box>
          )}

          {activeTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 4,
                    p: 3,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      About Me
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => setEditingAbout(!editingAbout)}
                      sx={{
                        bgcolor: editingAbout ? "primary.main" : alpha("#667eea", 0.1),
                        color: editingAbout ? "white" : "primary.main",
                        "&:hover": {
                          bgcolor: editingAbout ? "primary.dark" : alpha("#667eea", 0.2),
                          transform: "scale(1.1)",
                        },
                        transition: "all 0.2s ease",
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  {editingAbout ? (
                    <Stack spacing={3}>
                      <TextField
                        fullWidth
                        label="Bio"
                        multiline
                        rows={4}
                        value={aboutData.bio}
                        onChange={(e) => setAboutData({ ...aboutData, bio: e.target.value })}
                      />
                      <TextField
                        fullWidth
                        label="Workplace"
                        value={aboutData.workplace}
                        onChange={(e) => setAboutData({ ...aboutData, workplace: e.target.value })}
                      />
                      <TextField
                        fullWidth
                        label="Position"
                        value={aboutData.position}
                        onChange={(e) => setAboutData({ ...aboutData, position: e.target.value })}
                      />
                      <TextField
                        fullWidth
                        label="Education"
                        value={aboutData.education}
                        onChange={(e) => setAboutData({ ...aboutData, education: e.target.value })}
                      />
                      <TextField
                        fullWidth
                        label="Location"
                        value={aboutData.location}
                        onChange={(e) => setAboutData({ ...aboutData, location: e.target.value })}
                      />
                      <TextField
                        fullWidth
                        label="Birthdate"
                        value={aboutData.birthdate}
                        onChange={(e) => setAboutData({ ...aboutData, birthdate: e.target.value })}
                      />
                      <TextField
                        fullWidth
                        label="Relationship Status"
                        value={aboutData.relationship}
                        onChange={(e) => setAboutData({ ...aboutData, relationship: e.target.value })}
                      />
                      
                      <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          onClick={() => setEditingAbout(false)}
                          sx={{ 
                            textTransform: "none", 
                            borderRadius: 2,
                            borderWidth: 2,
                            "&:hover": {
                              borderWidth: 2,
                            },
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          onClick={handleSaveAbout}
                          sx={{
                            textTransform: "none",
                            borderRadius: 2,
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                            "&:hover": {
                              background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                            },
                          }}
                        >
                          Save Changes
                        </Button>
                      </Stack>
                    </Stack>
                  ) : (
                    <Stack spacing={3}>
                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                        <WorkIcon sx={{ color: "primary.main", mt: 0.5 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Works at
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {aboutData.workplace}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {aboutData.position}
                          </Typography>
                        </Box>
                      </Box>

                      <Divider />

                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                        <SchoolIcon sx={{ color: "primary.main", mt: 0.5 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Studied at
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {aboutData.education}
                          </Typography>
                        </Box>
                      </Box>

                      <Divider />

                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                        <LocationOnIcon sx={{ color: "primary.main", mt: 0.5 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Lives in
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {aboutData.location}
                          </Typography>
                        </Box>
                      </Box>

                      <Divider />

                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                        <CakeIcon sx={{ color: "primary.main", mt: 0.5 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Born on
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {aboutData.birthdate}
                          </Typography>
                        </Box>
                      </Box>

                      <Divider />

                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                        <FavoriteIcon sx={{ color: "primary.main", mt: 0.5 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Relationship
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {aboutData.relationship}
                          </Typography>
                        </Box>
                      </Box>

                      {aboutData.interests && aboutData.interests.length > 0 && (
                        <>
                          <Divider />
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                              Interests
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                              {aboutData.interests.map((interest, idx) => (
                                <Chip 
                                  key={idx} 
                                  label={interest} 
                                  size="small"
                                  sx={{ 
                                    bgcolor: alpha("#667eea", 0.1),
                                    color: "primary.main",
                                    fontWeight: 600,
                                  }}
                                />
                              ))}
                            </Stack>
                          </Box>
                        </>
                      )}
                    </Stack>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 4,
                    p: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    mb: 3,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                    <TrendingUpIcon sx={{ color: "primary.main" }} />
                    Skills
                  </Typography>
                  <Stack spacing={2}>
                    {mockSkills.map((skill, idx) => (
                      <Box key={idx}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                          <Typography variant="body2" fontWeight={600}>
                            {skill.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {skill.level}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={skill.level}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: alpha("#667eea", 0.1),
                            "& .MuiLinearProgress-bar": {
                              background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                              borderRadius: 4,
                            },
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 4,
                    p: 3,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                    <EmojiEventsIcon sx={{ color: "primary.main" }} />
                    Achievements
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 24,
                        }}
                      >
                        🏆
                      </Box>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          Top Contributor
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Earned last month
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 24,
                        }}
                      >
                        ⭐
                      </Box>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          Rising Star
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          100+ connections
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          )}

          {activeTab === 2 && (
            <Paper
              elevation={0}
              sx={{
                borderRadius: 4,
                p: 3,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Friends ({mockFriends.length})
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  sx={{ 
                    textTransform: "none",
                    borderRadius: 2,
                    borderWidth: 2,
                    "&:hover": {
                      borderWidth: 2,
                    },
                  }}
                >
                  See All
                </Button>
              </Box>
              <Grid container spacing={2}>
                {mockFriends.map((friend) => (
                  <Grid item xs={6} sm={4} md={3} lg={3} key={friend.id}>
                    <Card
                      elevation={0}
                      sx={{
                        borderRadius: 3,
                        p: 2,
                        textAlign: "center",
                        border: "1px solid",
                        borderColor: "divider",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                        "&:hover": {
                          transform: "translateY(-8px)",
                          boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
                          borderColor: "primary.main",
                        },
                      }}
                    >
                      <Avatar
                        src={friend.avatar}
                        sx={{
                          width: 80,
                          height: 80,
                          mx: "auto",
                          mb: 1.5,
                          border: "3px solid",
                          borderColor: alpha("#667eea", 0.2),
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, fontSize: 14, mb: 0.5 }}
                        noWrap
                      >
                        {friend.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {friend.mutualFriends} mutual friends
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        sx={{
                          mt: 1.5,
                          textTransform: "none",
                          borderRadius: 2,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        View Profile
                      </Button>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}

          {activeTab === 3 && (
            <Paper
              elevation={0}
              sx={{
                borderRadius: 4,
                p: 3,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Photos ({mockPhotos.length})
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  sx={{ 
                    textTransform: "none",
                    borderRadius: 2,
                    borderWidth: 2,
                    "&:hover": {
                      borderWidth: 2,
                    },
                  }}
                >
                  Upload
                </Button>
              </Box>
              <Grid container spacing={1.5}>
                {mockPhotos.map((photo, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Box
                      component="img"
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      onClick={() => handlePhotoClick(index)}
                      sx={{
                        width: "100%",
                        height: 200,
                        objectFit: "cover",
                        borderRadius: 2,
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "scale(1.05)",
                          boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                        },
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}

          {activeTab === 4 && (
            <Paper
              elevation={0}
              sx={{
                borderRadius: 4,
                p: 3,
                border: "1px solid",
                borderColor: "divider",
                maxWidth: 800,
                mx: "auto",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Recent Activity
              </Typography>
              <List sx={{ width: "100%" }}>
                {mockActivities.map((activity, idx) => (
                  <Box key={activity.id}>
                    <ListItem
                      sx={{
                        px: 2,
                        py: 2,
                        borderRadius: 2,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          bgcolor: alpha("#667eea", 0.05),
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: alpha("#667eea", 0.1),
                            color: "text.primary",
                          }}
                        >
                          {activity.icon}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body1" fontWeight={600}>
                            {activity.text}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {activity.time}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {idx < mockActivities.length - 1 && <Divider variant="inset" component="li" />}
                  </Box>
                ))}
              </List>
            </Paper>
          )}
        </Box>
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1,
            minWidth: 200,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
          },
        }}
      >
        <MenuItem onClick={handleMenuClose} sx={{ py: 1.5, borderRadius: 1 }}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Share Profile</Typography>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={handleMenuClose} sx={{ py: 1.5, borderRadius: 1, color: "error.main" }}>
          <ListItemIcon>
            <BlockIcon fontSize="small" sx={{ color: "error.main" }} />
          </ListItemIcon>
          <Typography variant="body2">Block User</Typography>
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ py: 1.5, borderRadius: 1, color: "error.main" }}>
          <ListItemIcon>
            <ReportIcon fontSize="small" sx={{ color: "error.main" }} />
          </ListItemIcon>
          <Typography variant="body2">Report User</Typography>
        </MenuItem>
      </Menu>

      <Dialog
        open={photoDialog.open}
        onClose={handlePhotoClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "transparent",
            boxShadow: "none",
            overflow: "visible",
          },
        }}
      >
        <DialogContent sx={{ p: 0, position: "relative" }}>
          <IconButton
            onClick={handlePhotoClose}
            sx={{
              position: "absolute",
              top: -16,
              right: -16,
              bgcolor: "white",
              zIndex: 1,
              "&:hover": {
                bgcolor: "white",
                transform: "scale(1.1)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          <Box
            component="img"
            src={mockPhotos[photoDialog.index]}
            alt={`Photo ${photoDialog.index + 1}`}
            sx={{
              width: "100%",
              maxHeight: "80vh",
              objectFit: "contain",
              borderRadius: 2,
            }}
          />
          <IconButton
            onClick={() => handlePhotoNav("prev")}
            sx={{
              position: "absolute",
              left: -60,
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: "white",
              "&:hover": {
                bgcolor: "white",
                transform: "translateY(-50%) scale(1.1)",
              },
            }}
          >
            <NavigateBeforeIcon />
          </IconButton>
          <IconButton
            onClick={() => handlePhotoNav("next")}
            sx={{
              position: "absolute",
              right: -60,
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: "white",
              "&:hover": {
                bgcolor: "white",
                transform: "translateY(-50%) scale(1.1)",
              },
            }}
          >
            <NavigateNextIcon />
          </IconButton>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pt: 2 }}>
          <Typography variant="body2" color="white">
            {photoDialog.index + 1} / {mockPhotos.length}
          </Typography>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ mt: 8 }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: 3 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Scene>
  );
}
