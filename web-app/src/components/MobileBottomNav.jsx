import { useNavigate, useLocation } from "react-router-dom";
import { Paper, BottomNavigation, BottomNavigationAction } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import GroupsIcon from "@mui/icons-material/Groups";
import PeopleIcon from "@mui/icons-material/People";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";

const NAV_ITEMS = [
  { label: "Home", value: "/", icon: HomeIcon },
  { label: "Groups", value: "/groups", icon: GroupsIcon },
  { label: "Friends", value: "/friends", icon: PeopleIcon },
  { label: "Messages", value: "/chat", icon: ChatBubbleIcon },
];

export default function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentValue = NAV_ITEMS.find(item => item.value === location.pathname)?.value || "/";

  const handleChange = (event, newValue) => {
    navigate(newValue);
  };

  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        display: { xs: "block", md: "none" },
        zIndex: (theme) => theme.zIndex.appBar,
        borderTop: "1px solid",
        borderColor: "divider",
        boxShadow: (theme) =>
          theme.palette.mode === "dark"
            ? "0 -4px 24px rgba(0, 0, 0, 0.4)"
            : "0 -4px 24px rgba(0, 0, 0, 0.08)",
      }}
      elevation={3}
    >
      <BottomNavigation
        value={currentValue}
        onChange={handleChange}
        showLabels
        sx={{
          height: 64,
          bgcolor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(28, 30, 36, 0.95)"
              : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "saturate(180%) blur(20px)",
          "& .MuiBottomNavigationAction-root": {
            minWidth: 60,
            color: "text.secondary",
            "&.Mui-selected": {
              color: "primary.main",
            },
          },
        }}
      >
        {NAV_ITEMS.map((item) => {
          const IconComponent = item.icon;
          return (
            <BottomNavigationAction
              key={item.value}
              label={item.label}
              value={item.value}
              icon={<IconComponent />}
            />
          );
        })}
      </BottomNavigation>
    </Paper>
  );
}
