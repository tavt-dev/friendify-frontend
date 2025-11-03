import React from "react";
import {
  Box,
  Paper,
  Avatar,
  TextField,
  IconButton,
  Divider,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ImageIcon from "@mui/icons-material/Image";
import VideocamIcon from "@mui/icons-material/Videocam";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import { isAuthenticated } from "../services/authenticationService";

const getCurrentUser = () => {
  const userStr = localStorage.getItem('mock_user');
  return userStr ? JSON.parse(userStr) : null;
};

export default function CreatePostComposer({ onClick }) {
  if (!isAuthenticated()) return null;

  const user = getCurrentUser();

  return (
    <Paper
      elevation={0}
      sx={(t) => ({
        mb: 3,
        borderRadius: 4,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        p: 2.5,
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        backgroundImage: t.palette.mode === "dark"
          ? "linear-gradient(135deg, rgba(139, 154, 255, 0.03) 0%, rgba(151, 117, 212, 0.03) 100%)"
          : "linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%)",
        boxShadow: t.palette.mode === "dark"
          ? "0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
          : "0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
        "&:hover": {
          boxShadow: t.palette.mode === "dark"
            ? "0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
            : "0 8px 24px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 1)",
          borderColor: alpha(t.palette.primary.main, 0.35),
          transform: "translateY(-2px)",
        },
      })}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
        <Avatar
          src={user?.avatar}
          sx={(t) => ({
            width: 48,
            height: 48,
            border: "3px solid",
            borderColor: t.palette.mode === "dark"
              ? alpha(t.palette.primary.main, 0.3)
              : alpha(t.palette.primary.main, 0.2),
            background: t.palette.mode === "dark"
              ? "linear-gradient(135deg, #8b9aff 0%, #9775d4 100%)"
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            boxShadow: t.palette.mode === "dark"
              ? "0 4px 12px rgba(139, 154, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.2)"
              : "0 4px 12px rgba(102, 126, 234, 0.25), inset 0 -2px 4px rgba(0, 0, 0, 0.1)",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "scale(1.05)",
              boxShadow: t.palette.mode === "dark"
                ? "0 6px 16px rgba(139, 154, 255, 0.4)"
                : "0 6px 16px rgba(102, 126, 234, 0.35)",
            },
          })}
        >
          {user?.username?.charAt(0)?.toUpperCase() || "U"}
        </Avatar>
        <TextField
          fullWidth
          placeholder="Bạn đang nghĩ gì?"
          onClick={onClick}
          variant="outlined"
          sx={{
            cursor: "pointer",
            "& .MuiOutlinedInput-root": {
              borderRadius: 6,
              fontSize: 15,
              bgcolor: (t) =>
                t.palette.mode === "dark"
                  ? alpha(t.palette.common.white, 0.04)
                  : alpha(t.palette.common.black, 0.02),
              "& fieldset": { borderColor: "divider" },
              "&:hover fieldset": { borderColor: "primary.main" },
              "&.Mui-focused fieldset": {
                borderColor: "primary.main",
                borderWidth: 2,
              },
            },
            "& .MuiInputBase-input": {
              cursor: "pointer",
            },
          }}
          InputProps={{
            readOnly: true,
          }}
        />
      </Box>

      <Divider sx={{ mb: 1.5 }} />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        <IconButton
          onClick={onClick}
          sx={(t) => ({
            color: "#45bd62",
            borderRadius: 2.5,
            px: 2,
            py: 1,
            gap: 1,
            flex: 1,
            transition: "all 0.2s ease",
            "&:hover": {
              bgcolor: alpha("#45bd62", 0.08),
              transform: "scale(1.02)",
            },
          })}
        >
          <ImageIcon />
          <Box
            component="span"
            sx={{
              fontSize: 14,
              fontWeight: 600,
              display: { xs: "none", sm: "inline" },
            }}
          >
            Ảnh
          </Box>
        </IconButton>

        <IconButton
          onClick={onClick}
          sx={(t) => ({
            color: "#f3425f",
            borderRadius: 2.5,
            px: 2,
            py: 1,
            gap: 1,
            flex: 1,
            transition: "all 0.2s ease",
            "&:hover": {
              bgcolor: alpha("#f3425f", 0.08),
              transform: "scale(1.02)",
            },
          })}
        >
          <VideocamIcon />
          <Box
            component="span"
            sx={{
              fontSize: 14,
              fontWeight: 600,
              display: { xs: "none", sm: "inline" },
            }}
          >
            Video
          </Box>
        </IconButton>

        <IconButton
          onClick={onClick}
          sx={(t) => ({
            color: "#f7b928",
            borderRadius: 2.5,
            px: 2,
            py: 1,
            gap: 1,
            flex: 1,
            transition: "all 0.2s ease",
            "&:hover": {
              bgcolor: alpha("#f7b928", 0.08),
              transform: "scale(1.02)",
            },
          })}
        >
          <EmojiEmotionsIcon />
          <Box
            component="span"
            sx={{
              fontSize: 14,
              fontWeight: 600,
              display: { xs: "none", sm: "inline" },
            }}
          >
            Cảm xúc
          </Box>
        </IconButton>
      </Box>
    </Paper>
  );
}
