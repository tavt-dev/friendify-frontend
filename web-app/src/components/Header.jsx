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
import HomeIcon from "@mui/icons-material/Home";
import GroupsIcon from "@mui/icons-material/Groups";
import PeopleIcon from "@mui/icons-material/People";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import { isAuthenticated, logOut } from "../services/identityService";
import { useUser } from "../contexts/UserContext";
import NotificationsPopover from "./NotificationsPopover";

const SEARCH_SUGGESTIONS = [
  { id: 1, type: "user", name: "Sarah Johnson", avatar: "https://i.pravatar.cc/150?img=1" },
  { id: 2, type: "user", name: "Mike Chen", avatar: "https://i.pravatar.cc/150?img=2" },
  { id: 3, type: "trending", name: "#ReactJS", subtitle: "2.5k posts" },
  { id: 4, type: "trending", name: "#WebDev", subtitle: "1.8k posts" },
  { id: 5, type: "recent", name: "JavaScript Tutorial", subtitle: "Recent search" },
];


const NAV_TABS = [
  { label: "Home", value: "/", icon: HomeIcon },
  { label: "Group", value: "/groups", icon: GroupsIcon },
  { label: "Friends", value: "/friends", icon: PeopleIcon },
  { label: "Messages", value: "/chat", icon: ChatBubbleIcon },
];

const CompactSearch = styled("div")(({ theme }) => {
  const isDark = theme.palette.mode === "dark";
  const baseBg = isDark ? alpha(theme.palette.common.white, 0.08) : alpha(theme.palette.common.black, 0.04);
  const hoverBg = isDark ? alpha(theme.palette.common.white, 0.12) : alpha(theme.palette.common.black, 0.06);
  const focusBg = isDark ? alpha(theme.palette.common.white, 0.16) : alpha(theme.palette.common.black, 0.08);
  return {
    position: "relative",
    borderRadius: 20,
    backgroundColor: baseBg,
    border: `1px solid ${theme.palette.divider}`,
    transition: "all .2s ease",
    "&:hover": { backgroundColor: hoverBg },
    "&:focus-within": {
      backgroundColor: focusBg,
      borderColor: alpha(theme.palette.primary.main, 0.5),
    },
    width: 240,
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

const NavTabLink = styled(Link)(({ theme, active }) => ({
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 8,
  padding: theme.spacing(1.5, 3),
  color: active ? theme.palette.primary.main : theme.palette.text.secondary,
  textDecoration: "none",
  transition: "all .2s ease",
  "&:hover": {
    backgroundColor: alpha(theme.palette.action.hover, 0.6),
  },
  "&::after": active ? {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: 48,
    height: 2,
    backgroundColor: theme.palette.primary.main,
    borderRadius: "2px 2px 0 0",
  } : {},
  [theme.breakpoints.down("md")]: {
    padding: theme.spacing(1.5, 2),
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
      ? `${userData.firstName} ${userData.lastName}` 
      : userData.username || userData.email || "User",
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

  const currentTab = NAV_TABS.find(tab => tab.value === location.pathname)?.value || false;

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
    <AppBar
      position="sticky"
      elevation={0}
      color="transparent"
      sx={(t) => ({
        width: "100vw",
        left: 0, right: 0,
        ml: "calc(50% - 50vw)",
        mr: "calc(50% - 50vw)",
        bgcolor: t.palette.mode === "dark"
          ? alpha(t.palette.grey[900], 0.85)
          : alpha(t.palette.background.paper, 0.9),
        backdropFilter: "saturate(180%) blur(10px)",
        borderBottom: "1px solid",
        borderColor: "divider",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        zIndex: t.zIndex.appBar,
      })}
    >
      <Toolbar sx={{ minHeight: "60px !important", height: 60, px: { xs: 1.5, md: 3 }, gap: { xs: 1, md: 2 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 2 }, flex: { xs: 1, md: 'initial' } }}>
          <IconButton
            size="medium"
            edge="start"
            color="inherit"
            aria-label="open menu"
            onClick={onMenuClick}
            sx={{
              p: 0.5,
              "&:hover": { backgroundColor: "action.hover" },
              display: { xs: 'inline-flex', lg: 'none' },
              mr: { xs: 0.5, sm: 1 }
            }}
          >
            <MenuIcon />
          </IconButton>

          <IconButton
            size="medium"
            edge="start"
            color="inherit"
            aria-label="logo"
            onClick={() => navigate("/")}
            sx={{ p: 0.5, "&:hover": { backgroundColor: "action.hover" }, display: { xs: 'none', sm: 'inline-flex' } }}
          >
            <Box component="img" src="/src/assets/icons/logo.png" alt="logo" sx={{ width: 36, height: 36, borderRadius: 1 }} />
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

        <Box sx={{ display: { xs: "none", md: "flex" }, flex: 1, justifyContent: "center", gap: { xs: 1, md: 2 } }}>
          {isAuthenticated() && NAV_TABS.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = currentTab === tab.value;
            return (
              <Tooltip key={tab.value} title={tab.label} arrow placement="bottom">
                <NavTabLink
                  to={tab.value}
                  active={isActive ? 1 : 0}
                  aria-label={tab.label}
                >
                  <IconComponent fontSize="medium" />
                </NavTabLink>
              </Tooltip>
            );
          })}
        </Box>

        <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1 }}>
          {isAuthenticated() ? (
            <>
              <Tooltip title="Notifications" arrow placement="bottom">
                <IconButton 
                  size="medium" 
                  aria-label="notifications" 
                  color="inherit" 
                  onClick={handleNotificationClick}
                  sx={{ "&:hover": { backgroundColor: "action.hover" } }}
                >
                  <Badge badgeContent={unreadNotifications} color="error"><NotificationsIcon /></Badge>
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
                  sx={{ "&:hover": { backgroundColor: "action.hover" } }}
                >
                  <Avatar src={user.avatar} alt={user.name} sx={{ width: 32, height: 32 }} />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <Button
              onClick={() => navigate("/login")}
              variant="outlined"
              sx={(t) => ({
                borderColor: alpha(t.palette.common.white, t.palette.mode === "dark" ? 0.35 : 0.45),
                color: "inherit",
                textTransform: "none",
                borderRadius: 2,
                px: 2,
                fontSize: 14,
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: "action.hover",
                  borderColor: alpha(t.palette.common.white, t.palette.mode === "dark" ? 0.55 : 0.65),
                },
              })}
            >
              Đăng Nhập
            </Button>
          )}
        </Box>

        <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 0.5 }}>
          {isAuthenticated() ? (
            <>
              <IconButton
                size="medium"
                aria-label="notifications"
                color="inherit"
                onClick={handleNotificationClick}
                sx={{ "&:hover": { backgroundColor: "action.hover" } }}
              >
                <Badge badgeContent={unreadNotifications} color="error"><NotificationsIcon /></Badge>
              </IconButton>
              <IconButton
                size="medium"
                edge="end"
                aria-label="account of current user"
                aria-controls={menuId}
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
                sx={{ "&:hover": { backgroundColor: "action.hover" } }}
              >
                <Avatar src={user.avatar} alt={user.name} sx={{ width: 32, height: 32 }} />
              </IconButton>
            </>
          ) : (
            <IconButton
              size="medium"
              onClick={() => navigate("/login")}
              color="inherit"
              sx={{ "&:hover": { backgroundColor: "action.hover" } }}
            >
              <Avatar sx={{ width: 32, height: 32 }} />
            </IconButton>
          )}
        </Box>
      </Toolbar>

      {MobileMenu}
      {ProfileCardMenu}
      <NotificationsPopover
        open={isNotificationOpen}
        anchorEl={notificationAnchor}
        onClose={handleNotificationClose}
      />
    </AppBar>
  );
}
