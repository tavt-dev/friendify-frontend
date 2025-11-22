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
import PeopleIcon from "@mui/icons-material/People";
import GroupsIcon from "@mui/icons-material/Groups";
import ChatIcon from "@mui/icons-material/Chat";
import FlagIcon from "@mui/icons-material/Flag";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import { Link, useLocation } from "react-router-dom";

function SideMenu({ onNavigate }) {
  const location = useLocation();
  const [activeItem, setActiveItem] = React.useState(() => {
    const p = location.pathname || "/";
    if (p.startsWith("/friends")) return "friends";
    if (p.startsWith("/groups")) return "groups";
    if (p.startsWith("/chat")) return "chat";
    if (p.startsWith("/pages")) return "pages";
    if (p.startsWith("/saved")) return "saved";
    return "home";
  });

  React.useEffect(() => {
    const p = location.pathname || "/";
    if (p.startsWith("/friends")) setActiveItem("friends");
    else if (p.startsWith("/groups")) setActiveItem("groups");
    else if (p.startsWith("/chat")) setActiveItem("chat");
    else if (p.startsWith("/pages")) setActiveItem("pages");
    else if (p.startsWith("/saved")) setActiveItem("saved");
    else setActiveItem("home");
  }, [location.pathname]);

  const menuItems = [
    { key: "home", icon: <HomeIcon />, text: "Trang Chủ", to: "/" },
    { key: "chat", icon: <ChatIcon />, text: "Nhắn Tin  ", to: "/chat" },
    { key: "friends", icon: <PeopleIcon />, text: "Bạn Bè", to: "/friends" },
    { key: "groups", icon: <GroupsIcon />, text: "Nhóm", to: "/groups" },
    { key: "pages", icon: <FlagIcon />, text: "Trang", to: "/pages" },
    { key: "saved", icon: <BookmarkIcon />, text: "Đã Lưu", to: "/saved" },
  ];

  return (
    <>
      <Toolbar />
      <List sx={{ px: 2, py: 2 }}>
        {menuItems.map((item) => {
          const isActive = activeItem === item.key;
          return (
            <ListItem key={item.key} disablePadding sx={{ mb: 1 }}>
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
                  py: 2,
                  px: 2,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  overflow: "hidden",
                  background: isActive
                    ? t.palette.mode === "dark"
                      ? "linear-gradient(135deg, rgba(139, 154, 255, 0.12) 0%, rgba(151, 117, 212, 0.12) 100%)"
                      : "linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.12) 100%)"
                    : "transparent",
                  boxShadow: isActive
                    ? t.palette.mode === "dark"
                      ? "0 4px 12px rgba(139, 154, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                      : "0 4px 12px rgba(102, 126, 234, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)"
                    : "none",
                  border: isActive
                    ? `1px solid ${t.palette.mode === "dark" ? "rgba(139, 154, 255, 0.2)" : "rgba(102, 126, 234, 0.2)"}`
                    : "1px solid transparent",
                  "&::before": isActive
                    ? {
                        content: '""',
                        position: "absolute",
                        left: 0,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 4,
                        height: "60%",
                        borderRadius: "0 4px 4px 0",
                        background: t.palette.mode === "dark"
                          ? "linear-gradient(180deg, #8b9aff 0%, #9775d4 100%)"
                          : "linear-gradient(180deg, #667eea 0%, #764ba2 100%)",
                        boxShadow: t.palette.mode === "dark"
                          ? "0 0 12px rgba(139, 154, 255, 0.6)"
                          : "0 0 12px rgba(102, 126, 234, 0.6)",
                      }
                    : {},
                  "&:hover": {
                    background: isActive
                      ? t.palette.mode === "dark"
                        ? "linear-gradient(135deg, rgba(139, 154, 255, 0.18) 0%, rgba(151, 117, 212, 0.18) 100%)"
                        : "linear-gradient(135deg, rgba(102, 126, 234, 0.18) 0%, rgba(118, 75, 162, 0.18) 100%)"
                      : t.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.04)",
                    transform: "translateX(6px)",
                    boxShadow: isActive
                      ? t.palette.mode === "dark"
                        ? "0 6px 16px rgba(139, 154, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)"
                        : "0 6px 16px rgba(102, 126, 234, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.9)"
                      : t.palette.mode === "dark"
                      ? "0 2px 8px rgba(0, 0, 0, 0.3)"
                      : "0 2px 8px rgba(0, 0, 0, 0.08)",
                  },
                  "&:active": {
                    transform: "translateX(4px) scale(0.98)",
                  },
                })}
              >
                <ListItemIcon
                  sx={(t) => ({
                    minWidth: 44,
                    color: isActive
                      ? t.palette.mode === "dark" ? "#8b9aff" : "#667eea"
                      : "text.secondary",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    filter: isActive
                      ? "drop-shadow(0 2px 4px rgba(102, 126, 234, 0.3))"
                      : "none",
                  })}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 700 : 600,
                    fontSize: 15,
                    color: isActive
                      ? (t) => t.palette.mode === "dark" ? "#8b9aff" : "#667eea"
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
      <Divider sx={{ mx: 2 }} />
    </>
  );
}

export default SideMenu;
