import * as React from "react";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import { alpha } from "@mui/material/styles";
import HomeIcon from "@mui/icons-material/Home";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleIcon from "@mui/icons-material/People";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import GroupsIcon from "@mui/icons-material/Groups";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import ChatIcon from "@mui/icons-material/Chat";
import ChatOutlinedIcon from "@mui/icons-material/ChatBubbleOutline";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkOutlinedIcon from "@mui/icons-material/BookmarkBorder";
import { Link, useLocation } from "react-router-dom";

function SideMenu({ onNavigate }) {
  const location = useLocation();
  const [activeItem, setActiveItem] = React.useState(() => {
    const p = location.pathname || "/";
    if (p.startsWith("/friends")) return "friends";
    if (p.startsWith("/groups")) return "groups";
    if (p.startsWith("/chat")) return "chat";
    if (p.startsWith("/saved")) return "saved";
    return "home";
  });

  React.useEffect(() => {
    const p = location.pathname || "/";
    if (p.startsWith("/friends")) setActiveItem("friends");
    else if (p.startsWith("/groups")) setActiveItem("groups");
    else if (p.startsWith("/chat")) setActiveItem("chat");
    else if (p.startsWith("/saved")) setActiveItem("saved");
    else setActiveItem("home");
  }, [location.pathname]);

  const menuItems = [
    { 
      key: "home", 
      icon: HomeIcon, 
      iconOutlined: HomeOutlinedIcon, 
      text: "Trang Chủ", 
      to: "/" 
    },
    { 
      key: "chat", 
      icon: ChatIcon, 
      iconOutlined: ChatOutlinedIcon, 
      text: "Nhắn Tin", 
      to: "/chat" 
    },
    { 
      key: "friends", 
      icon: PeopleIcon, 
      iconOutlined: PeopleOutlinedIcon, 
      text: "Bạn Bè", 
      to: "/friends" 
    },
    { 
      key: "groups", 
      icon: GroupsIcon, 
      iconOutlined: GroupOutlinedIcon, 
      text: "Nhóm", 
      to: "/groups" 
    },
    { 
      key: "saved", 
      icon: BookmarkIcon, 
      iconOutlined: BookmarkOutlinedIcon, 
      text: "Đã Lưu", 
      to: "/saved" 
    },
  ];

  return (
    <>
      <Toolbar />
      <Divider sx={{ mx: 2, mb: 1 }} />
      <List sx={{ px: 1.5, py: 1 }}>
        {menuItems.map((item) => {
          const isActive = activeItem === item.key;
          const IconComponent = isActive ? item.icon : item.iconOutlined;
          return (
            <ListItem key={item.key} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                to={item.to}
                onClick={() => {
                  setActiveItem(item.key);
                  onNavigate?.();
                }}
                selected={isActive}
                sx={(t) => ({
                  borderRadius: 3,
                  py: 1.5,
                  px: 2,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  overflow: "visible",
                  background: isActive
                    ? t.palette.mode === "dark"
                      ? `linear-gradient(135deg, ${alpha("#8a2be2", 0.15)} 0%, ${alpha("#4a00e0", 0.15)} 100%)`
                      : `linear-gradient(135deg, ${alpha("#8a2be2", 0.12)} 0%, ${alpha("#4a00e0", 0.12)} 100%)`
                    : "transparent",
                  boxShadow: isActive
                    ? t.palette.mode === "dark"
                      ? "0 4px 16px rgba(138, 43, 226, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                      : "0 4px 16px rgba(138, 43, 226, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)"
                    : "none",
                  border: isActive
                    ? `1px solid ${t.palette.mode === "dark" 
                      ? alpha("#8a2be2", 0.3) 
                      : alpha("#8a2be2", 0.25)}`
                    : "1px solid transparent",
                  "&::before": isActive
                    ? {
                        content: '""',
                        position: "absolute",
                        left: 0,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 4,
                        height: "70%",
                        borderRadius: "0 4px 4px 0",
                        background: "linear-gradient(180deg, #8a2be2 0%, #4a00e0 100%)",
                        boxShadow: "0 0 12px rgba(138, 43, 226, 0.6)",
                      }
                    : {},
                  "&:hover": {
                    background: isActive
                      ? t.palette.mode === "dark"
                        ? `linear-gradient(135deg, ${alpha("#8a2be2", 0.2)} 0%, ${alpha("#4a00e0", 0.2)} 100%)`
                        : `linear-gradient(135deg, ${alpha("#8a2be2", 0.18)} 0%, ${alpha("#4a00e0", 0.18)} 100%)`
                      : t.palette.mode === "dark"
                      ? alpha(t.palette.common.white, 0.06)
                      : alpha(t.palette.common.black, 0.04),
                    transform: "translateX(4px)",
                    boxShadow: isActive
                      ? t.palette.mode === "dark"
                        ? "0 6px 20px rgba(138, 43, 226, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)"
                        : "0 6px 20px rgba(138, 43, 226, 0.2), inset 0 1px 0 rgba(255, 255, 255, 1)"
                      : t.palette.mode === "dark"
                      ? "0 2px 8px rgba(0, 0, 0, 0.3)"
                      : "0 2px 8px rgba(0, 0, 0, 0.08)",
                  },
                  "&:active": {
                    transform: "translateX(2px) scale(0.98)",
                  },
                })}
              >
                <ListItemIcon
                  sx={(t) => ({
                    minWidth: 40,
                    color: isActive
                      ? "#8a2be2"
                      : t.palette.text.secondary,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "& svg": {
                      fontSize: 24,
                      filter: isActive
                        ? "drop-shadow(0 2px 4px rgba(138, 43, 226, 0.4))"
                        : "none",
                    },
                  })}
                >
                  <IconComponent />
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 15,
                    color: isActive
                      ? "#8a2be2"
                      : "text.primary",
                    sx: {
                      transition: "all 0.3s ease",
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </>
  );
}

export default SideMenu;
