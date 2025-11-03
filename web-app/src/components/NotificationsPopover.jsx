import * as React from "react";
import { alpha } from "@mui/material/styles";
import {
  Paper, Box, Typography, List, ListItemButton, ListItemAvatar,
  ListItemText, Avatar, Badge, Chip, Button, Popper,
  ClickAwayListener, Skeleton, CircularProgress
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CommentIcon from "@mui/icons-material/Comment";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import NotificationsIcon from "@mui/icons-material/Notifications";

const ALL_NOTIFICATIONS = [
  { id: 1, type: "like", user: "Sarah Johnson", avatar: "https://i.pravatar.cc/150?img=1", message: "liked your post", time: "5m ago", read: false },
  { id: 2, type: "comment", user: "Mike Chen", avatar: "https://i.pravatar.cc/150?img=2", message: "commented on your photo", time: "1h ago", read: false },
  { id: 3, type: "friend", user: "Emma Wilson", avatar: "https://i.pravatar.cc/150?img=3", message: "sent you a friend request", time: "2h ago", read: false },
  { id: 4, type: "like", user: "John Doe", avatar: "https://i.pravatar.cc/150?img=4", message: "and 12 others liked your photo", time: "5h ago", read: true },
  { id: 5, type: "comment", user: "Alice Smith", avatar: "https://i.pravatar.cc/150?img=5", message: "replied to your comment", time: "6h ago", read: true },
  { id: 6, type: "like", user: "Bob Anderson", avatar: "https://i.pravatar.cc/150?img=6", message: "liked your comment", time: "8h ago", read: true },
  { id: 7, type: "friend", user: "Carol White", avatar: "https://i.pravatar.cc/150?img=7", message: "accepted your friend request", time: "10h ago", read: true },
  { id: 8, type: "comment", user: "David Brown", avatar: "https://i.pravatar.cc/150?img=8", message: "mentioned you in a comment", time: "12h ago", read: true },
  { id: 9, type: "like", user: "Eve Davis", avatar: "https://i.pravatar.cc/150?img=9", message: "and 5 others liked your post", time: "1d ago", read: true },
  { id: 10, type: "friend", user: "Frank Miller", avatar: "https://i.pravatar.cc/150?img=10", message: "sent you a friend request", time: "1d ago", read: true },
  { id: 11, type: "comment", user: "Grace Lee", avatar: "https://i.pravatar.cc/150?img=11", message: "commented on your photo", time: "2d ago", read: true },
  { id: 12, type: "like", user: "Henry Wilson", avatar: "https://i.pravatar.cc/150?img=12", message: "liked your post", time: "2d ago", read: true },
  { id: 13, type: "friend", user: "Ivy Taylor", avatar: "https://i.pravatar.cc/150?img=13", message: "sent you a friend request", time: "3d ago", read: true },
  { id: 14, type: "comment", user: "Jack Moore", avatar: "https://i.pravatar.cc/150?img=14", message: "replied to your comment", time: "3d ago", read: true },
  { id: 15, type: "like", user: "Kelly Martin", avatar: "https://i.pravatar.cc/150?img=15", message: "liked your comment", time: "4d ago", read: true },
  { id: 16, type: "friend", user: "Liam Garcia", avatar: "https://i.pravatar.cc/150?img=16", message: "accepted your friend request", time: "4d ago", read: true },
  { id: 17, type: "comment", user: "Mia Rodriguez", avatar: "https://i.pravatar.cc/150?img=17", message: "mentioned you in a comment", time: "5d ago", read: true },
  { id: 18, type: "like", user: "Noah Martinez", avatar: "https://i.pravatar.cc/150?img=18", message: "and 8 others liked your photo", time: "5d ago", read: true },
  { id: 19, type: "friend", user: "Olivia Hernandez", avatar: "https://i.pravatar.cc/150?img=19", message: "sent you a friend request", time: "6d ago", read: true },
  { id: 20, type: "comment", user: "Paul Lopez", avatar: "https://i.pravatar.cc/150?img=20", message: "commented on your post", time: "6d ago", read: true },
];

const PAGE_SIZE = 10;

const getNotificationIcon = (type) => {
  switch (type) {
    case "like":
      return <FavoriteIcon fontSize="small" sx={{ color: "error.main" }} />;
    case "comment":
      return <CommentIcon fontSize="small" sx={{ color: "primary.main" }} />;
    case "friend":
      return <PersonAddIcon fontSize="small" sx={{ color: "success.main" }} />;
    default:
      return <NotificationsIcon fontSize="small" />;
  }
};

const NotificationSkeleton = () => (
  <Box sx={{ py: 1.5, px: 2, display: "flex", gap: 2 }}>
    <Skeleton variant="circular" width={48} height={48} />
    <Box sx={{ flex: 1 }}>
      <Skeleton variant="text" width="80%" height={20} />
      <Skeleton variant="text" width="40%" height={16} />
    </Box>
  </Box>
);

export default function NotificationsPopover({ open, anchorEl, onClose }) {
  const [notifications, setNotifications] = React.useState(ALL_NOTIFICATIONS);
  const [displayedNotifications, setDisplayedNotifications] = React.useState([]);
  const [after, setAfter] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [autoPaginate, setAutoPaginate] = React.useState(false);
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  const [hoverTimers, setHoverTimers] = React.useState({});
  const listRef = React.useRef(null);
  const itemRefs = React.useRef({});
  const sentinelRef = React.useRef(null);
  const loadMoreTimeoutRef = React.useRef(null);
  const observerRef = React.useRef(null);

  const hasMore = after + displayedNotifications.length < notifications.length;
  const unreadCount = notifications.filter(n => !n.read).length;

  React.useEffect(() => {
    if (open) {
      setDisplayedNotifications(notifications.slice(0, PAGE_SIZE));
      setAfter(0);
      setFocusedIndex(-1);
    } else {
      setAutoPaginate(false);
    }
  }, [open, notifications]);

  const loadMore = React.useCallback(() => {
    if (hasMore && !loading) {
      setLoading(true);
      setTimeout(() => {
        const currentLength = displayedNotifications.length;
        const nextBatch = notifications.slice(currentLength, currentLength + PAGE_SIZE);
        setDisplayedNotifications(prev => [...prev, ...nextBatch]);
        setAfter(currentLength);
        setLoading(false);
      }, 500);
    }
  }, [hasMore, loading, displayedNotifications.length, notifications]);

  React.useEffect(() => {
    if (!autoPaginate || !hasMore || !sentinelRef.current) {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      return;
    }

    const handleIntersection = (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loading) {
        if (loadMoreTimeoutRef.current) {
          clearTimeout(loadMoreTimeoutRef.current);
        }
        loadMoreTimeoutRef.current = setTimeout(() => {
          loadMore();
        }, 500);
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: listRef.current,
      threshold: 0.1,
    });

    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (loadMoreTimeoutRef.current) {
        clearTimeout(loadMoreTimeoutRef.current);
        loadMoreTimeoutRef.current = null;
      }
    };
  }, [autoPaginate, hasMore, loading, loadMore]);

  const markAsRead = React.useCallback((notificationId) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
  }, []);

  const handleNotificationHover = React.useCallback((notificationId, isEntering) => {
    if (isEntering) {
      const timer = setTimeout(() => {
        markAsRead(notificationId);
      }, 500);
      setHoverTimers(prev => ({ ...prev, [notificationId]: timer }));
    } else {
      if (hoverTimers[notificationId]) {
        clearTimeout(hoverTimers[notificationId]);
        setHoverTimers(prev => {
          const newTimers = { ...prev };
          delete newTimers[notificationId];
          return newTimers;
        });
      }
    }
  }, [hoverTimers, markAsRead]);

  const handleNotificationFocus = React.useCallback((notificationId, isFocusing) => {
    handleNotificationHover(notificationId, isFocusing);
  }, [handleNotificationHover]);

  const handleNotificationClick = React.useCallback((notification) => {
    markAsRead(notification.id);
    onClose();
  }, [markAsRead, onClose]);

  const handleKeyDown = React.useCallback((e) => {
    const currentListSize = displayedNotifications.length;
    
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }

    if (e.key === "PageDown") {
      e.preventDefault();
      if (!autoPaginate) {
        loadMore();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex(prev => {
        const next = prev < currentListSize - 1 ? prev + 1 : prev;
        if (itemRefs.current[next]) {
          itemRefs.current[next].focus();
        }
        return next;
      });
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex(prev => {
        const next = prev > 0 ? prev - 1 : 0;
        if (itemRefs.current[next]) {
          itemRefs.current[next].focus();
        }
        return next;
      });
      return;
    }

    if (e.key === "Enter" && focusedIndex >= 0 && focusedIndex < currentListSize) {
      e.preventDefault();
      handleNotificationClick(displayedNotifications[focusedIndex]);
      return;
    }
  }, [focusedIndex, displayedNotifications, onClose, loadMore, handleNotificationClick, autoPaginate]);

  React.useEffect(() => {
    return () => {
      Object.values(hoverTimers).forEach(timer => clearTimeout(timer));
    };
  }, [hoverTimers]);

  const handleLoadMoreClick = (e) => {
    e.preventDefault();
    setAutoPaginate(true);
    loadMore();
  };

  const handleLoadMoreKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setAutoPaginate(true);
      loadMore();
    }
  };

  if (!open) return null;

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-end"
      sx={{ zIndex: (t) => t.zIndex.modal + 1 }}
    >
      <ClickAwayListener onClickAway={onClose}>
        <Paper
          elevation={8}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
          sx={(t) => ({
            mt: 1.5,
            width: 380,
            maxWidth: "calc(100vw - 32px)",
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
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
          <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18 }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Chip 
                label={`${unreadCount} new`} 
                size="small" 
                color="primary" 
                sx={{ borderRadius: 2, fontWeight: 600 }}
              />
            )}
          </Box>

          <List 
            ref={listRef}
            sx={{ py: 0, maxHeight: 400, overflowY: "auto" }}
            role="list"
            aria-label="Notifications list"
          >
            {displayedNotifications.length === 0 && loading ? (
              <>
                {[...Array(3)].map((_, i) => (
                  <NotificationSkeleton key={i} />
                ))}
              </>
            ) : (
              <>
                {displayedNotifications.map((notification, index) => (
                  <ListItemButton
                    key={notification.id}
                    ref={el => itemRefs.current[index] = el}
                    onClick={() => handleNotificationClick(notification)}
                    onMouseEnter={() => handleNotificationHover(notification.id, true)}
                    onMouseLeave={() => handleNotificationHover(notification.id, false)}
                    onFocus={() => handleNotificationFocus(notification.id, true)}
                    onBlur={() => handleNotificationFocus(notification.id, false)}
                    role="listitem"
                    aria-label={`${notification.user} ${notification.message} ${notification.time}`}
                    sx={{
                      py: 1.5,
                      px: 2,
                      bgcolor: notification.read ? "transparent" : (t) => alpha(t.palette.primary.main, 0.05),
                      borderLeft: notification.read ? "none" : "3px solid",
                      borderLeftColor: "primary.main",
                      "&:hover": { bgcolor: "action.hover" },
                      "&:focus": { 
                        bgcolor: "action.focus",
                        outline: "2px solid",
                        outlineColor: "primary.main",
                        outlineOffset: "-2px"
                      },
                    }}
                  >
                    <ListItemAvatar sx={{ position: "relative" }}>
                      <Avatar src={notification.avatar} sx={{ width: 48, height: 48 }} />
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 0,
                          right: 0,
                          bgcolor: "background.paper",
                          borderRadius: "50%",
                          p: 0.3,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {getNotificationIcon(notification.type)}
                      </Box>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                          {notification.user}{" "}
                          <Typography component="span" sx={{ fontSize: 14, fontWeight: 400 }}>
                            {notification.message}
                          </Typography>
                        </Typography>
                      }
                      secondary={notification.time}
                      secondaryTypographyProps={{ fontSize: 12, color: "text.secondary" }}
                    />
                  </ListItemButton>
                ))}
                {autoPaginate && hasMore && (
                  <Box 
                    ref={sentinelRef}
                    sx={{ 
                      py: 1, 
                      px: 2, 
                      textAlign: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                      minHeight: 40
                    }}
                  >
                    {loading && (
                      <>
                        <CircularProgress size={14} />
                        <Typography variant="body2" sx={{ fontSize: 13, color: "text.secondary" }}>
                          Loading…
                        </Typography>
                      </>
                    )}
                  </Box>
                )}
              </>
            )}
          </List>

          {!autoPaginate && hasMore && (
            <Box sx={{ p: 1.5, borderTop: 1, borderColor: "divider" }}>
              <Button 
                fullWidth 
                onClick={handleLoadMoreClick}
                onKeyDown={handleLoadMoreKeyDown}
                disabled={loading}
                aria-label="Load more notifications"
                sx={{ 
                  textTransform: "none", 
                  borderRadius: 2, 
                  fontWeight: 600,
                  display: "flex",
                  gap: 1,
                  alignItems: "center"
                }}
              >
                {loading && <CircularProgress size={16} />}
                {loading ? "Loading…" : "See more"}
              </Button>
            </Box>
          )}

          {!hasMore && displayedNotifications.length > 0 && (
            <Box sx={{ py: 1.5, px: 2, borderTop: 1, borderColor: "divider", textAlign: "center" }}>
              <Typography variant="body2" sx={{ fontSize: 13, color: "text.secondary" }}>
                No more notifications
              </Typography>
            </Box>
          )}
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
}
