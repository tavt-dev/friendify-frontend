// src/components/AddMembersDialog.jsx
import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
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
  Checkbox,
  Box,
  Chip,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { apiFetch } from "../services/apiHelper";
import { API_ENDPOINTS } from "../config/apiConfig";
import { extractArrayFromResponse } from "../utils/apiHelper";

const AddMembersDialog = ({ open, onClose, onAddMembers, existingParticipantIds = [] }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);

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
        const response = await apiFetch(API_ENDPOINTS.USER.SEARCH, {
          method: 'POST',
          body: JSON.stringify({ keyword }),
        });

        const { items: usersList } = extractArrayFromResponse(response.data);
        
        // Normalize user data and filter out existing participants
        // Prioritize userId field from API response
        const normalizedUsers = usersList
          .map(user => {
            const userId = user.userId || user.id || user._id;
            return {
              id: userId,
              userId: userId, // Also include userId field for consistency
              username: user.username || user.userName || '',
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              avatar: user.avatar || user.avatarUrl || null,
              email: user.email || null,
            };
          })
          .filter(user => {
            // Filter out users who are already participants
            const userId = String(user.userId || user.id);
            return !existingParticipantIds.some(existingId => String(existingId) === userId);
          });

        setSearchResults(normalizedUsers);
      } catch (err) {
        setLoading(false);
        setSearchResults([]);
        
        if (!err || !err.response) {
          setError("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
          return;
        }

        const status = err.response.status;
        const errorData = err.response.data || {};
        const errorMessage = errorData.message || errorData.error || errorData.msg;

        if (status === 404) {
          setHasSearched(true);
          setError(null);
          return;
        }

        if (status === 401) {
          setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        } else if (status === 403) {
          setError("Bạn không có quyền thực hiện thao tác này.");
        } else if (status === 400) {
          setError(errorMessage || "Từ khóa tìm kiếm không hợp lệ. Vui lòng thử lại.");
        } else if (status === 500) {
          setError("Lỗi server. Vui lòng thử lại sau.");
        } else {
          setError(errorMessage || "Không thể tìm kiếm người dùng. Vui lòng thử lại.");
        }
      } finally {
        setLoading(false);
      }
    },
    [existingParticipantIds]
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

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setSearchResults([]);
      setHasSearched(false);
      setError(null);
      setLoading(false);
      setSelectedUsers([]);
    }
  }, [open]);

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    setError(null);
  };

  const handleToggleUser = (user) => {
    setSelectedUsers(prev => {
      const exists = prev.find(u => u.id === user.id);
      if (exists) {
        return prev.filter(u => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleAdd = () => {
    if (selectedUsers.length === 0) {
      setError("Vui lòng chọn ít nhất một người dùng để thêm.");
      return;
    }

    // Return both participantIds and user details for better UX
    const participantIds = selectedUsers.map(user => {
      const userId = user.userId || user.id || user._id;
      return String(userId);
    });
    
    // Also pass user details if available (for creating group)
    if (typeof onAddMembers === 'function') {
      // Check if onAddMembers accepts 2 parameters (ids and users)
      try {
        onAddMembers(participantIds, selectedUsers);
      } catch (e) {
        // Fallback to single parameter
        onAddMembers(participantIds);
      }
    }
    onClose();
  };

  const getDisplayName = (user) => {
    const fullName = user.firstName && user.lastName 
      ? `${user.lastName} ${user.firstName}`.trim()
      : user.firstName || user.lastName || '';
    return fullName || user.username || `User ${user.id}`;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Thêm thành viên vào nhóm</Typography>
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          placeholder="Tìm kiếm người dùng..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClearSearch} aria-label="clear search">
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2, mt: 1 }}
          autoFocus
        />

        {selectedUsers.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Đã chọn ({selectedUsers.length}):
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {selectedUsers.map(user => (
                <Chip
                  key={user.id}
                  label={getDisplayName(user)}
                  avatar={<Avatar src={user.avatar} />}
                  onDelete={() => handleToggleUser(user)}
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}

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
              {searchResults.map((user) => {
                const isSelected = selectedUsers.some(u => u.id === user.id);
                return (
                  <ListItem
                    key={user.id}
                    onClick={() => handleToggleUser(user)}
                    sx={{
                      borderRadius: 1,
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor: isDark ? alpha("#ffffff", 0.05) : "rgba(0,0,0,0.04)",
                      },
                    }}
                  >
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleToggleUser(user)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <ListItemAvatar>
                      <Avatar src={user.avatar || ""} alt={user.username} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography sx={{ fontWeight: isSelected ? 600 : 400 }}>
                          {getDisplayName(user)}
                        </Typography>
                      }
                      secondary={
                        <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                          {user.username && (user.firstName || user.lastName) ? `@${user.username}` : user.email || ''}
                        </Typography>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          )}

          {!loading && !error && searchResults.length === 0 && hasSearched && (
            <Box sx={{ p: 2, textAlign: "center" }}>
              <Typography color="text.secondary">
                Không tìm thấy người dùng nào khớp với "{searchQuery}"
              </Typography>
            </Box>
          )}

          {!loading && !error && !hasSearched && (
            <Box sx={{ p: 2, textAlign: "center" }}>
              <Typography color="text.secondary">
                Tìm kiếm người dùng để thêm vào nhóm
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button 
          onClick={handleAdd} 
          variant="contained" 
          disabled={selectedUsers.length === 0}
        >
          Thêm ({selectedUsers.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

AddMembersDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAddMembers: PropTypes.func.isRequired,
  existingParticipantIds: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
};

export default AddMembersDialog;

