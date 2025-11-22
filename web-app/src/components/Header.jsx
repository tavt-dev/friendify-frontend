import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  AppBar, Toolbar, Box, Avatar, IconButton, InputBase, Badge,
  MenuItem, Menu, Divider, Button, Switch, Typography, Paper, List,
  ListItem, ListItemAvatar, ListItemText, Popper, ClickAwayListener,
  Tooltip
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MoreIcon from "@mui/icons-material/MoreVert";
import MenuIcon from "@mui/icons-material/Menu";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import LogoutOutlined from "@mui/icons-material/LogoutOutlined";
import WbSunnyOutlined from "@mui/icons-material/WbSunnyOutlined";
import DarkModeOutlined from "@mui/icons-material/DarkModeOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import HistoryIcon from "@mui/icons-material/History";
import { isAuthenticated, logOut } from "../services/identityService";
import { useUser } from "../contexts/UserContext";
import NotificationPopover from "./NotificationPopover";

const SEARCH_SUGGESTIONS = [
  { id: 1, type: "user", name: "Sarah Johnson", avatar: "https://i.pravatar.cc/150?img=1" },
  { id: 2, type: "user", name: "Mike Chen", avatar: "https://i.pravatar.cc/150?img=2" },
  { id: 3, type: "trending", name: "#ReactJS", subtitle: "2.5k posts" },
  { id: 4, type: "trending", name: "#WebDev", subtitle: "1.8k posts" },
  { id: 5, type: "recent", name: "JavaScript Tutorial", subtitle: "Recent search" },
];


const CompactSearch = styled("div")(({ theme }) => {
  const isDark = theme.palette.mode === "dark";
  const baseBg = isDark ? alpha(theme.palette.common.white, 0.08) : alpha(theme.palette.common.black, 0.04);
  const hoverBg = isDark ? alpha(theme.palette.common.white, 0.12) : alpha(theme.palette.common.black, 0.06);
  const focusBg = isDark ? alpha(theme.palette.common.white, 0.16) : alpha(theme.palette.common.black, 0.08);
  return {
    position: "relative",
    borderRadius: 24,
    backgroundColor: baseBg,
    border: `1px solid ${isDark ? alpha(theme.palette.common.white, 0.1) : alpha(theme.palette.common.black, 0.08)}`,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": { 
      backgroundColor: hoverBg,
      borderColor: isDark ? alpha(theme.palette.common.white, 0.15) : alpha(theme.palette.common.black, 0.12),
      transform: "translateY(-1px)",
      boxShadow: isDark
        ? "0 4px 12px rgba(0, 0, 0, 0.2)"
        : "0 4px 12px rgba(0, 0, 0, 0.08)",
    },
    "&:focus-within": {
      backgroundColor: focusBg,
      borderColor: alpha(theme.palette.primary.main, 0.6),
      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
      transform: "translateY(-1px)",
    },
    width: 280,
    [theme.breakpoints.down("md")]: { width: "100%", flex: 1 },
  };
});

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 1.5),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(0.875, 1, 0.875, 0),
    paddingLeft: `calc(1em + ${theme.spacing(3)})`,
    fontSize: 14,
  },
}));

export default function Header({
  onToggleTheme = () => {},
  isDarkMode = false,
  onMenuClick = () => {},
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: userData } = useUser();
  
  // Format user data from API to match expected format
  const user = userData ? {
    name: userData.firstName && userData.lastName 
      ? `${userData.lastName} ${userData.firstName}`.trim()
      : userData.firstName || userData.lastName || userData.username || userData.email || "User",
    title: userData.bio || userData.title || userData.email || "Member",
    avatar: userData.avatar || null,
    id: userData.id,
  } : { name: "User", title: "Member", avatar: null };
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchAnchor, setSearchAnchor] = React.useState(null);
  const [notificationAnchor, setNotificationAnchor] = React.useState(null);
  const searchRef = React.useRef(null);
  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
  const isSearchOpen = Boolean(searchAnchor) && searchQuery.trim().length > 0;
  const isNotificationOpen = Boolean(notificationAnchor);

  const handleProfileMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMobileMenuOpen = (e) => setMobileMoreAnchorEl(e.currentTarget);
  const handleMobileMenuClose = () => setMobileMoreAnchorEl(null);
  const handleMenuClose = () => { setAnchorEl(null); handleMobileMenuClose(); };

  const handleOpenProfile = () => { 
    handleMenuClose(); 
    if (user?.id) {
      navigate(`/profile/${user.id}`); 
    } else {
      navigate("/profile"); 
    }
  };
  const handleLogout = () => { handleMenuClose(); logOut(); navigate("/login"); };

  const handleSearchFocus = (e) => setSearchAnchor(e.currentTarget);
  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handleSearchClose = () => {
    setSearchAnchor(null);
    setSearchQuery("");
  };

  const handleNotificationClick = (e) => setNotificationAnchor(e.currentTarget);
  const handleNotificationClose = () => setNotificationAnchor(null);

  const handleTabClick = (value) => {
    navigate(value);
  };

  const [unreadNotifications, setUnreadNotifications] = React.useState(3);

  const filteredSuggestions = SEARCH_SUGGESTIONS.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const menuId = "primary-profile-menu";
  const mobileMenuId = "primary-profile-menu-mobile";

  const ProfileCardMenu = (
    <Menu
      id={menuId}
      anchorEl={anchorEl}
      open={isMenuOpen}
      onClose={handleMenuClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      PaperProps={{
        elevation: 0,
        sx: (t) => ({
          mt: 1.5,
          borderRadius: 3,
          minWidth: 300,
          border: `1px solid ${t.palette.divider}`,
          boxShadow: t.palette.mode === "dark"
            ? "0 12px 48px rgba(0, 0, 0, 0.6), 0 4px 16px rgba(0, 0, 0, 0.5)"
            : "0 12px 48px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(0, 0, 0, 0.08)",
          overflow: "visible",
          p: 1.5,
          bgcolor: "background.paper",
          backdropFilter: "blur(20px)",
          backgroundImage: t.palette.mode === "dark"
            ? "linear-gradient(135deg, rgba(28, 30, 36, 0.98) 0%, rgba(28, 30, 36, 1) 100%)"
            : "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 1) 100%)",
          "&:before": {
            content: '""', position: "absolute", top: 0, right: 18,
            width: 12, height: 12, bgcolor: "background.paper",
            transform: "translateY(-50%) rotate(45deg)",
            borderLeft: `1px solid ${t.palette.divider}`,
            borderTop: `1px solid ${t.palette.divider}`,
          },
        }),
      }}
    >
      {isAuthenticated() ? (
        <>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 0.5, mb: 1 }}>
            <Avatar src={user.avatar} alt={user.name} sx={{ width: 40, height: 40 }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography noWrap sx={{ fontWeight: 700, fontSize: 16 }}>{user.name}</Typography>
              <Typography noWrap sx={{ color: "text.secondary", fontSize: 13 }}>{user.title}</Typography>
            </Box>
            <Box sx={{ ml: "auto" }}>
              <Button size="small" onClick={handleOpenProfile} variant="contained" disableElevation
                sx={{ textTransform: "none", borderRadius: 2, px: 1.2, py: 0.5 }}>
                Trang Cá Nhân
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 1 }} />

          <MenuItem
            onClick={() => { handleMenuClose(); navigate("/settings"); }}
            sx={{ py: 1.2, borderRadius: 2, mx: 0.5, "&:hover": { backgroundColor: "action.hover" } }}
          >
            <SettingsOutlined sx={{ mr: 1 }} fontSize="small" />
            <Typography sx={{ fontSize: 14, fontWeight: 500 }}>Cài Đặt</Typography>
          </MenuItem>

          <MenuItem
            onClick={handleLogout}
            sx={{
              py: 1.2, borderRadius: 2, mx: 0.5, color: "error.main",
              "&:hover": { backgroundColor: (t) => alpha(t.palette.error.main, 0.08) },
            }}
          >
            <LogoutOutlined sx={{ mr: 1 }} fontSize="small" />
            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>Đăng Xuất</Typography>
          </MenuItem>

          <Divider sx={{ my: 1 }} />

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 1, py: 0.5 }}>
            <WbSunnyOutlined fontSize="small" />
            <Typography sx={{ fontSize: 14, fontWeight: 500, flex: 1 }}>Dark mode</Typography>
            <DarkModeOutlined fontSize="small" />
            <Switch edge="end" checked={isDarkMode} onChange={(e) => onToggleTheme?.(e.target.checked)} />
          </Box>
        </>
      ) : (
        <Box sx={{ p: 1 }}>
          <Button fullWidth variant="contained" onClick={() => navigate("/login")}
            sx={{ textTransform: "none", borderRadius: 2 }}>
            Đăng nhập
          </Button>
        </Box>
      )}
    </Menu>
  );


  const MobileMenu = (
    <Menu
      id={mobileMenuId}
      anchorEl={mobileMoreAnchorEl}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      PaperProps={{
        sx: (t) => ({
          mt: 1.5,
          borderRadius: 3,
          border: `1px solid ${t.palette.divider}`,
          boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
        }),
      }}
    >
      {isAuthenticated() ? (
        <>
          <MenuItem onClick={(e) => { handleMobileMenuClose(); handleNotificationClick(e); }} sx={{ py: 1.2 }}>
            <IconButton size="large" color="inherit" sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
              <Badge badgeContent={unreadNotifications} color="error"><NotificationsIcon /></Badge>
            </IconButton>
            <Typography sx={{ ml: 1, fontSize: 14, fontWeight: 500 }}>Notifications</Typography>
          </MenuItem>
          <MenuItem onClick={(e) => { handleMobileMenuClose(); handleProfileMenuOpen(e); }} sx={{ py: 1.2 }}>
            <Avatar src={user.avatar} sx={{ width: 28, height: 28 }} />
            <Typography sx={{ ml: 1, fontSize: 14, fontWeight: 500 }}>Profile</Typography>
          </MenuItem>
        </>
      ) : (
        <MenuItem onClick={() => { handleMobileMenuClose(); navigate("/login"); }} sx={{ py: 1.2 }}>
          <Avatar sx={{ width: 28, height: 28 }} />
          <Typography sx={{ ml: 1, fontSize: 14, fontWeight: 500 }}>Login</Typography>
        </MenuItem>
      )}
    </Menu>
  );

  return (
    <Box sx={{ width: "100%", display: "flex", alignItems: "center" }}>
      <Toolbar sx={{ minHeight: "64px !important", height: 64, width: "100%", px: { xs: 2, md: 3 }, gap: { xs: 1.5, md: 2.5 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 2 }, flex: { xs: 1, md: 'initial' } }}>
          <IconButton
            size="medium"
            edge="start"
            color="inherit"
            aria-label="open menu"
            onClick={onMenuClick}
            sx={(t) => ({
              p: 1,
              borderRadius: 2,
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": { 
                backgroundColor: t.palette.mode === "dark"
                  ? alpha(t.palette.common.white, 0.1)
                  : alpha(t.palette.common.black, 0.05),
                transform: "scale(1.05)",
              },
              display: { xs: 'inline-flex', lg: 'none' },
              mr: { xs: 0.5, sm: 1 }
            })}
          >
            <MenuIcon />
          </IconButton>

          <IconButton
            size="medium"
            edge="start"
            color="inherit"
            aria-label="logo"
            onClick={() => navigate("/")}
            sx={(t) => ({
              p: 0.75,
              borderRadius: 2.5,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                backgroundColor: t.palette.mode === "dark"
                  ? alpha(t.palette.common.white, 0.08)
                  : alpha(t.palette.common.black, 0.04),
                transform: "translateY(-2px) scale(1.05)",
              },
              display: { xs: 'none', sm: 'inline-flex' },
            })}
          >
            <Box
              component="img"
              src="/src/assets/icons/logo.png"
              alt="Friendify Logo"
              onError={(e) => {
                e.target.style.display = "none";
              }}
              sx={{
                width: { xs: 40, sm: 44 },
                height: { xs: 40, sm: 44 },
                borderRadius: 2,
                boxShadow: (t) => t.palette.mode === "dark"
                  ? "0 4px 12px rgba(138, 43, 226, 0.3)"
                  : "0 4px 12px rgba(138, 43, 226, 0.2)",
                transition: "all 0.3s ease",
              }}
            />
          </IconButton>

          <CompactSearch ref={searchRef}>
            <SearchIconWrapper><SearchIcon fontSize="small" /></SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ "aria-label": "search" }}
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
            />
          </CompactSearch>

          <Popper
            open={isSearchOpen}
            anchorEl={searchAnchor}
            placement="bottom-start"
            sx={{ zIndex: (t) => t.zIndex.modal + 1, width: searchRef.current?.offsetWidth || 240 }}
          >
            <ClickAwayListener onClickAway={handleSearchClose}>
              <Paper
                elevation={8}
                sx={(t) => ({
                  mt: 1,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  overflow: "hidden",
                  maxHeight: 400,
                  overflowY: "auto",
                  bgcolor: "background.paper",
                  backdropFilter: "blur(20px)",
                  boxShadow: t.palette.mode === "dark"
                    ? "0 12px 48px rgba(0, 0, 0, 0.6), 0 4px 16px rgba(0, 0, 0, 0.5)"
                    : "0 12px 48px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(0, 0, 0, 0.08)",
                  backgroundImage: t.palette.mode === "dark"
                    ? "linear-gradient(180deg, rgba(28, 30, 36, 0.98) 0%, rgba(28, 30, 36, 1) 100%)"
                    : "linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 1) 100%)",
                })}
              >
                <List sx={{ py: 1 }}>
                  {filteredSuggestions.length > 0 ? (
                    filteredSuggestions.map((item) => (
                      <ListItem
                        key={item.id}
                        button
                        onClick={handleSearchClose}
                        sx={{
                          py: 1.5,
                          "&:hover": { bgcolor: "action.hover" },
                        }}
                      >
                        <ListItemAvatar>
                          {item.type === "user" ? (
                            <Avatar src={item.avatar} sx={{ width: 36, height: 36 }} />
                          ) : item.type === "trending" ? (
                            <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main" }}>
                              <TrendingUpIcon fontSize="small" />
                            </Avatar>
                          ) : (
                            <Avatar sx={{ width: 36, height: 36, bgcolor: "action.selected" }}>
                              <HistoryIcon fontSize="small" />
                            </Avatar>
                          )}
                        </ListItemAvatar>
                        <ListItemText
                          primary={item.name}
                          secondary={item.subtitle}
                          primaryTypographyProps={{ fontWeight: 600, fontSize: 13 }}
                          secondaryTypographyProps={{ fontSize: 11 }}
                        />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText
                        primary="No results found"
                        secondary={`Try searching for "${searchQuery}"`}
                        primaryTypographyProps={{ fontSize: 13, color: "text.secondary" }}
                        secondaryTypographyProps={{ fontSize: 11 }}
                      />
                    </ListItem>
                  )}
                </List>
              </Paper>
            </ClickAwayListener>
          </Popper>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, ml: "auto" }}>
          {isAuthenticated() ? (
            <>
              <Tooltip title="Notifications" arrow placement="bottom">
                <IconButton 
                  size="medium" 
                  aria-label="notifications" 
                  color="inherit" 
                  onClick={handleNotificationClick}
                  sx={(t) => ({
                    borderRadius: 2,
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": { 
                      backgroundColor: t.palette.mode === "dark"
                        ? alpha(t.palette.common.white, 0.1)
                        : alpha(t.palette.common.black, 0.05),
                      transform: "scale(1.1)",
                    },
                    display: { xs: 'none', md: 'inline-flex' },
                  })}
                >
                  <Badge 
                    badgeContent={unreadNotifications} 
                    color="error"
                    sx={{
                      "& .MuiBadge-badge": {
                        fontSize: "0.625rem",
                        fontWeight: 700,
                        minWidth: 18,
                        height: 18,
                      },
                    }}
                  >
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Tooltip title="Profile" arrow placement="bottom">
                <IconButton
                  size="medium"
                  edge="end"
                  aria-label="account of current user"
                  aria-controls={menuId}
                  aria-haspopup="true"
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                  sx={(t) => ({
                    borderRadius: "50%",
                    p: 0.25,
                    border: `2px solid ${t.palette.mode === "dark" 
                      ? alpha(t.palette.common.white, 0.1) 
                      : alpha(t.palette.common.black, 0.08)}`,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": { 
                      backgroundColor: t.palette.mode === "dark"
                        ? alpha(t.palette.common.white, 0.1)
                        : alpha(t.palette.common.black, 0.05),
                      transform: "scale(1.05)",
                      borderColor: t.palette.primary.main,
                      boxShadow: `0 0 0 3px ${alpha(t.palette.primary.main, 0.1)}`,
                    },
                    display: { xs: 'none', md: 'inline-flex' },
                  })}
                >
                  <Avatar 
                    src={user.avatar} 
                    alt={user.name} 
                    sx={{ 
                      width: 36, 
                      height: 36,
                      border: (t) => `2px solid ${t.palette.background.paper}`,
                    }} 
                  />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <Button
              onClick={() => navigate("/login")}
              variant="contained"
              sx={(t) => ({
                background: "linear-gradient(135deg, #8a2be2 0%, #4a00e0 50%, #8a2be2 100%)",
                backgroundSize: "200% 200%",
                color: "white",
                textTransform: "none",
                borderRadius: 2.5,
                px: 2.5,
                py: 1,
                fontSize: 14,
                fontWeight: 700,
                boxShadow: "0 4px 12px rgba(138, 43, 226, 0.4)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                animation: "gradientShift 3s ease infinite",
                "@keyframes gradientShift": {
                  "0%, 100%": { backgroundPosition: "0% 50%" },
                  "50%": { backgroundPosition: "100% 50%" },
                },
                "&:hover": {
                  backgroundPosition: "100% 50%",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(138, 43, 226, 0.5)",
                },
              })}
            >
              Đăng Nhập
            </Button>
          )}
        </Box>

        <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 1 }}>
          {isAuthenticated() ? (
            <>
              <IconButton
                size="medium"
                aria-label="notifications"
                color="inherit"
                onClick={handleNotificationClick}
                sx={(t) => ({
                  borderRadius: 2,
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": { 
                    backgroundColor: t.palette.mode === "dark"
                      ? alpha(t.palette.common.white, 0.1)
                      : alpha(t.palette.common.black, 0.05),
                    transform: "scale(1.1)",
                  },
                })}
              >
                <Badge 
                  badgeContent={unreadNotifications} 
                  color="error"
                  sx={{
                    "& .MuiBadge-badge": {
                      fontSize: "0.625rem",
                      fontWeight: 700,
                      minWidth: 18,
                      height: 18,
                    },
                  }}
                >
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              <IconButton
                size="medium"
                edge="end"
                aria-label="account of current user"
                aria-controls={menuId}
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
                sx={(t) => ({
                  borderRadius: "50%",
                  p: 0.25,
                  border: `2px solid ${t.palette.mode === "dark" 
                    ? alpha(t.palette.common.white, 0.1) 
                    : alpha(t.palette.common.black, 0.08)}`,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": { 
                    backgroundColor: t.palette.mode === "dark"
                      ? alpha(t.palette.common.white, 0.1)
                      : alpha(t.palette.common.black, 0.05),
                    transform: "scale(1.05)",
                    borderColor: t.palette.primary.main,
                    boxShadow: `0 0 0 3px ${alpha(t.palette.primary.main, 0.1)}`,
                  },
                })}
              >
                <Avatar 
                  src={user.avatar} 
                  alt={user.name} 
                  sx={{ 
                    width: 36, 
                    height: 36,
                    border: (t) => `2px solid ${t.palette.background.paper}`,
                  }} 
                />
              </IconButton>
            </>
          ) : (
            <Button
              onClick={() => navigate("/login")}
              variant="contained"
              size="small"
              sx={(t) => ({
                background: "linear-gradient(135deg, #8a2be2 0%, #4a00e0 50%, #8a2be2 100%)",
                backgroundSize: "200% 200%",
                color: "white",
                textTransform: "none",
                borderRadius: 2,
                px: 2,
                py: 0.75,
                fontSize: 13,
                fontWeight: 700,
                boxShadow: "0 4px 12px rgba(138, 43, 226, 0.4)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                animation: "gradientShift 3s ease infinite",
                "@keyframes gradientShift": {
                  "0%, 100%": { backgroundPosition: "0% 50%" },
                  "50%": { backgroundPosition: "100% 50%" },
                },
                "&:hover": {
                  backgroundPosition: "100% 50%",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(138, 43, 226, 0.5)",
                },
              })}
            >
              Đăng Nhập
            </Button>
          )}
        </Box>
      </Toolbar>

      {MobileMenu}
      {ProfileCardMenu}
      <NotificationPopover
        open={isNotificationOpen}
        anchorEl={notificationAnchor}
        onClose={handleNotificationClose}
      />
    </Box>
  );
}
