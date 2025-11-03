import React from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Button,
  Divider,
  Chip,
  Stack,
  IconButton,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import EventIcon from "@mui/icons-material/Event";
import CloseIcon from "@mui/icons-material/Close";

const FRIEND_SUGGESTIONS = [
  {
    id: 1,
    name: "Sarah Johnson",
    avatar: "https://i.pravatar.cc/150?img=1",
    mutualFriends: 12,
  },
  {
    id: 2,
    name: "Mike Chen",
    avatar: "https://i.pravatar.cc/150?img=2",
    mutualFriends: 8,
  },
  {
    id: 3,
    name: "Emma Wilson",
    avatar: "https://i.pravatar.cc/150?img=3",
    mutualFriends: 15,
  },
];

const TRENDING_TOPICS = [
  { id: 1, tag: "#ReactJS", posts: "2.5k posts" },
  { id: 2, tag: "#WebDevelopment", posts: "1.8k posts" },
  { id: 3, tag: "#AI", posts: "3.2k posts" },
  { id: 4, tag: "#Design", posts: "1.2k posts" },
  { id: 5, tag: "#Startup", posts: "950 posts" },
];

const UPCOMING_EVENTS = [
  {
    id: 1,
    title: "Tech Conference 2024",
    date: "Dec 20, 2024",
    time: "10:00 AM",
    interested: 234,
  },
  {
    id: 2,
    title: "React Meetup",
    date: "Dec 25, 2024",
    time: "6:00 PM",
    interested: 89,
  },
  {
    id: 3,
    title: "Design Workshop",
    date: "Dec 28, 2024",
    time: "2:00 PM",
    interested: 156,
  },
];

export default function RightSidebar() {
  const [friendSuggestions, setFriendSuggestions] = React.useState(FRIEND_SUGGESTIONS);

  const handleAddFriend = (id) => {
    setFriendSuggestions((prev) => prev.filter((friend) => friend.id !== id));
  };

  const handleRemoveSuggestion = (id) => {
    setFriendSuggestions((prev) => prev.filter((friend) => friend.id !== id));
  };

  return (
    <Box
      sx={{
        width: "100%",
        position: "sticky",
        top: 80,
        alignSelf: "flex-start",
        maxHeight: "calc(100vh - 96px)",
        overflowY: "auto",
        overflowX: "hidden",
        "&::-webkit-scrollbar": {
          width: "6px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: (t) => alpha(t.palette.text.primary, 0.2),
          borderRadius: 3,
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: "transparent",
        },
      }}
    >
      {/* Friend Suggestions */}
      <Paper
        elevation={0}
        sx={(t) => ({
          borderRadius: 4,
          p: 2.5,
          mb: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          position: "relative",
          overflow: "hidden",
          backgroundImage: t.palette.mode === "dark"
            ? "linear-gradient(135deg, rgba(139, 154, 255, 0.02) 0%, rgba(151, 117, 212, 0.02) 100%)"
            : "linear-gradient(135deg, rgba(102, 126, 234, 0.015) 0%, rgba(118, 75, 162, 0.015) 100%)",
          boxShadow: t.palette.mode === "dark"
            ? "0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.03)"
            : "0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: t.palette.mode === "dark"
              ? "0 4px 16px rgba(0, 0, 0, 0.4)"
              : "0 4px 16px rgba(0, 0, 0, 0.06)",
            transform: "translateY(-2px)",
          },
        })}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <PersonAddIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 16 }}>
            Gợi ý kết bạn
          </Typography>
        </Box>

        {friendSuggestions.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
            Không có gợi ý
          </Typography>
        ) : (
          <Stack spacing={2}>
            {friendSuggestions.map((friend) => (
              <Box key={friend.id}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, position: "relative" }}>
                  <Avatar
                    src={friend.avatar}
                    sx={{
                      width: 48,
                      height: 48,
                      border: "2px solid",
                      borderColor: "divider",
                    }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, fontSize: 14, mb: 0.3 }}
                      noWrap
                    >
                      {friend.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {friend.mutualFriends} bạn chung
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveSuggestion(friend.id)}
                    sx={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                      bgcolor: "background.default",
                      width: 20,
                      height: 20,
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
                <Button
                  fullWidth
                  size="small"
                  variant="outlined"
                  onClick={() => handleAddFriend(friend.id)}
                  sx={{
                    mt: 1.5,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: 13,
                    borderRadius: 2,
                    py: 0.7,
                    borderColor: "divider",
                    color: "primary.main",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                    },
                  }}
                >
                  Thêm bạn
                </Button>
                {friend.id !== friendSuggestions[friendSuggestions.length - 1].id && (
                  <Divider sx={{ mt: 2 }} />
                )}
              </Box>
            ))}
          </Stack>
        )}
      </Paper>

      {/* Trending Topics */}
      <Paper
        elevation={0}
        sx={(t) => ({
          borderRadius: 4,
          p: 2.5,
          mb: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          position: "relative",
          overflow: "hidden",
          backgroundImage: t.palette.mode === "dark"
            ? "linear-gradient(135deg, rgba(139, 154, 255, 0.02) 0%, rgba(151, 117, 212, 0.02) 100%)"
            : "linear-gradient(135deg, rgba(102, 126, 234, 0.015) 0%, rgba(118, 75, 162, 0.015) 100%)",
          boxShadow: t.palette.mode === "dark"
            ? "0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.03)"
            : "0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: t.palette.mode === "dark"
              ? "0 4px 16px rgba(0, 0, 0, 0.4)"
              : "0 4px 16px rgba(0, 0, 0, 0.06)",
            transform: "translateY(-2px)",
          },
        })}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <TrendingUpIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 16 }}>
            Chủ đề xu hướng
          </Typography>
        </Box>

        <Stack spacing={1.5}>
          {TRENDING_TOPICS.map((topic) => (
            <Box
              key={topic.id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 1.5,
                borderRadius: 2.5,
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: "action.hover",
                  transform: "translateX(4px)",
                },
              }}
            >
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    fontSize: 14,
                    color: "primary.main",
                    mb: 0.3,
                  }}
                >
                  {topic.tag}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {topic.posts}
                </Typography>
              </Box>
              <Chip
                label="Xu hướng"
                size="small"
                sx={(t) => ({
                  height: 22,
                  fontSize: 11,
                  fontWeight: 600,
                  background: t.palette.mode === "dark"
                    ? "linear-gradient(135deg, rgba(139, 154, 255, 0.15) 0%, rgba(151, 117, 212, 0.15) 100%)"
                    : "linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.12) 100%)",
                  color: t.palette.mode === "dark" ? "#8b9aff" : "#667eea",
                  border: `1px solid ${t.palette.mode === "dark" ? "rgba(139, 154, 255, 0.3)" : "rgba(102, 126, 234, 0.3)"}`,
                  boxShadow: t.palette.mode === "dark"
                    ? "0 2px 8px rgba(139, 154, 255, 0.2)"
                    : "0 2px 8px rgba(102, 126, 234, 0.15)",
                })}
              />
            </Box>
          ))}
        </Stack>
      </Paper>

      {/* Upcoming Events */}
      <Paper
        elevation={0}
        sx={(t) => ({
          borderRadius: 4,
          p: 2.5,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          position: "relative",
          overflow: "hidden",
          backgroundImage: t.palette.mode === "dark"
            ? "linear-gradient(135deg, rgba(139, 154, 255, 0.02) 0%, rgba(151, 117, 212, 0.02) 100%)"
            : "linear-gradient(135deg, rgba(102, 126, 234, 0.015) 0%, rgba(118, 75, 162, 0.015) 100%)",
          boxShadow: t.palette.mode === "dark"
            ? "0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.03)"
            : "0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: t.palette.mode === "dark"
              ? "0 4px 16px rgba(0, 0, 0, 0.4)"
              : "0 4px 16px rgba(0, 0, 0, 0.06)",
            transform: "translateY(-2px)",
          },
        })}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <EventIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 16 }}>
            Sự kiện sắp diễn ra
          </Typography>
        </Box>

        <Stack spacing={2}>
          {UPCOMING_EVENTS.map((event) => (
            <Box
              key={event.id}
              sx={(t) => ({
                p: 2,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                background: t.palette.mode === "dark"
                  ? "rgba(28, 30, 36, 0.5)"
                  : "rgba(255, 255, 255, 0.5)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  borderRadius: 3,
                  padding: "1px",
                  background: t.palette.mode === "dark"
                    ? "linear-gradient(135deg, rgba(139, 154, 255, 0.3), rgba(151, 117, 212, 0.3))"
                    : "linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))",
                  mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  maskComposite: "exclude",
                  WebkitMaskComposite: "xor",
                  opacity: 0,
                  transition: "opacity 0.3s ease",
                },
                "&:hover": {
                  bgcolor: "action.hover",
                  borderColor: "transparent",
                  transform: "translateY(-4px)",
                  boxShadow: t.palette.mode === "dark"
                    ? "0 8px 24px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(139, 154, 255, 0.15)"
                    : "0 8px 24px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(102, 126, 234, 0.15)",
                  "&::before": {
                    opacity: 1,
                  },
                },
              })}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, fontSize: 14, mb: 1 }}
              >
                {event.title}
              </Typography>
              <Stack spacing={0.5} sx={{ mb: 1.5 }}>
                <Typography variant="caption" color="text.secondary">
                  📅 {event.date}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  🕐 {event.time}
                </Typography>
              </Stack>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  label={`${event.interested} quan tâm`}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: 11,
                    fontWeight: 600,
                    bgcolor: "action.selected",
                    color: "text.secondary",
                  }}
                />
                <Button
                  size="small"
                  variant="text"
                  sx={{
                    textTransform: "none",
                    fontSize: 12,
                    fontWeight: 600,
                    minWidth: "auto",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1.5,
                  }}
                >
                  Quan tâm
                </Button>
              </Box>
            </Box>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}
