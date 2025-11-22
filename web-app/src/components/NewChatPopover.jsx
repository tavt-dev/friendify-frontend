// src/components/NewChatPopover.jsx
import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Popover,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  CircularProgress,
  InputAdornment,
  IconButton,
  Alert,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { apiFetch } from "../services/apiHelper";
import { API_ENDPOINTS } from "../config/apiConfig";
import { extractArrayFromResponse } from "../utils/apiHelper";

const NewChatPopover = ({ anchorEl, open, onClose, onSelectUser }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // color tokens tuned for dark/light
  const paperBg = isDark ? alpha(theme.palette.background.paper, 0.95) : theme.palette.background.paper;
  const inputBg = isDark ? alpha("#ffffff", 0.03) : alpha(theme.palette.primary.light, 0.06);
  const listHoverBg = isDark ? alpha("#ffffff", 0.03) : "rgba(0,0,0,0.04)";
  const placeholderColor = isDark ? alpha("#ffffff", 0.6) : theme.palette.text.secondary;

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);

  // Search users from API
  const handleSearch = useCallback(
    async (query) => {
      if (!query?.trim()) {
        setSearchResults([]);
        setHasSearched(false);
        setError(null);
        return;
      }

      setLoading(true);
      setHasSearched(true);
      setError(null);

      try {
        const keyword = query.trim();
        // Use POST method as per userService.js
        const response = await apiFetch(API_ENDPOINTS.USER.SEARCH, {
          method: 'POST',
          body: JSON.stringify({ keyword }),
        });

        const { items: usersList } = extractArrayFromResponse(response.data);
        
        // Normalize user data
        const normalizedUsers = usersList.map(user => ({
          id: user.id || user.userId || user._id,
          username: user.username || user.userName || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          avatar: user.avatar || user.avatarUrl || null,
          email: user.email || null,
        }));

        setSearchResults(normalizedUsers);
      } catch (err) {
        setLoading(false);
        setSearchResults([]);
        
        // Handle different error cases
        if (!err || !err.response) {
          // Network error or unexpected error
          setError("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
          return;
        }

        const status = err.response.status;
        const errorData = err.response.data || {};
        const errorMessage = errorData.message || errorData.error || errorData.msg;

        // Don't show error for 404 (no results found)
        if (status === 404) {
          setHasSearched(true);
          setError(null);
          return;
        }

        // Handle specific status codes
        if (status === 401) {
          setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        } else if (status === 403) {
          setError("Bạn không có quyền thực hiện thao tác này.");
        } else if (status === 400) {
          // Bad Request - might be invalid search query
          setError(errorMessage || "Từ khóa tìm kiếm không hợp lệ. Vui lòng thử lại.");
        } else if (status === 500) {
          setError("Lỗi server. Vui lòng thử lại sau.");
        } else if (status >= 400 && status < 500) {
          setError(errorMessage || "Yêu cầu không hợp lệ. Vui lòng thử lại.");
        } else {
          setError(errorMessage || "Không thể tìm kiếm người dùng. Vui lòng thử lại.");
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Debounced search effect (500ms)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) handleSearch(searchQuery);
      else {
        setSearchResults([]);
        setHasSearched(false);
        setError(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearch]);

  // Clear when popover closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setSearchResults([]);
      setHasSearched(false);
      setError(null);
      setLoading(false);
    }
  }, [open]);

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    setError(null);
  };

  const handleUserSelect = (user) => {
    // Validate user has ID
    if (!user || !user.id) {
      setError("Người dùng không hợp lệ. Vui lòng chọn lại.");
      return;
    }

    // normalize shape so parent gets: { userId, displayName, avatar }
    const fullName = user.firstName && user.lastName 
      ? `${user.lastName} ${user.firstName}`.trim()
      : user.firstName || user.lastName || '';
    
    const displayName = fullName || user.username || `User ${user.id}`;
    
    const normalized = {
      userId: String(user.id), // Ensure it's a string
      displayName: displayName,
      avatar: user.avatar || null,
    };
    onSelectUser(normalized);
    // reset local state
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    onClose();
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      slotProps={{
        paper: {
          sx: {
            width: 320,
            p: 2,
            mt: 1,
            bgcolor: paperBg,
            boxShadow: isDark
              ? "0 6px 18px rgba(2,6,23,0.8)"
              : "0 6px 18px rgba(15,15,15,0.08)",
            border: `1px solid ${isDark ? alpha("#ffffff", 0.03) : alpha("#000000", 0.06)}`,
          },
        },
      }}
    >
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold", color: "text.primary" }}>
        Bắt đầu cuộc trò chuyện mới
      </Typography>

      <TextField
        fullWidth
        placeholder="Tìm kiếm người dùng..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: placeholderColor }} />
            </InputAdornment>
          ),
          endAdornment: searchQuery && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={handleClearSearch} aria-label="clear search">
                <ClearIcon fontSize="small" sx={{ color: placeholderColor }} />
              </IconButton>
            </InputAdornment>
          ),
          sx: {
            bgcolor: inputBg,
            borderRadius: 1.5,
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: isDark ? alpha("#ffffff", 0.04) : alpha("#000", 0.06),
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: isDark ? alpha("#ffffff", 0.08) : alpha("#000", 0.12),
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: theme.palette.primary.main,
              boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.12)}`,
            },
            input: { color: "text.primary" },
          },
        }}
        sx={{ mb: 2 }}
        autoFocus
      />

      <Box sx={{ height: 300, overflow: "auto" }}>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress size={28} />
          </Box>
        )}

        {!loading && error && (
          <Box sx={{ p: 2 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          </Box>
        )}

        {!loading && !error && searchResults.length > 0 && (
          <List>
            {searchResults.map((user) => (
              <ListItem
                key={user.id}
                onClick={() => handleUserSelect(user)}
                sx={{
                  borderRadius: 1,
                  cursor: "pointer",
                  px: 0.5,
                  "&:hover": {
                    bgcolor: listHoverBg,
                    transform: "translateX(4px)",
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    src={user.avatar || ""}
                    alt={user.username}
                    sx={{
                      width: 40,
                      height: 40,
                      border: `2px solid ${isDark ? alpha("#ffffff", 0.06) : alpha("#000", 0.06)}`,
                    }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography sx={{ color: "text.primary", fontWeight: 600 }}>
                      {user.firstName && user.lastName 
                        ? `${user.lastName} ${user.firstName}`.trim()
                        : user.firstName || user.lastName || user.username || `User ${user.id}`
                      }
                    </Typography>
                  }
                  secondary={
                    <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                      {user.username && (user.firstName || user.lastName) ? `@${user.username}` : user.email || ''}
                    </Typography>
                  }
                  primaryTypographyProps={{ variant: "body1" }}
                />
              </ListItem>
            ))}
          </List>
        )}

        {!loading && !error && searchResults.length === 0 && hasSearched && (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography color="text.secondary">Không tìm thấy người dùng nào khớp với "{searchQuery}"</Typography>
          </Box>
        )}

        {!loading && !error && !hasSearched && (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography color="text.secondary">Tìm kiếm người dùng để bắt đầu cuộc trò chuyện</Typography>
          </Box>
        )}
      </Box>
    </Popover>
  );
};

NewChatPopover.propTypes = {
  anchorEl: PropTypes.object,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelectUser: PropTypes.func.isRequired,
};

export default NewChatPopover;
