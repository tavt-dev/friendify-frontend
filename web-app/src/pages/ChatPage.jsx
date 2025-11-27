import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Card,
  TextField,
  Typography,
  Paper,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Badge,
  CircularProgress,
  Alert,
  Stack,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Tooltip,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import PageLayout from "./PageLayout";
import CreateChatPopover from "../components/CreateChatPopover";
import {
  getConversations,
  getMessagesPaginated,
  sendMessage,
  createConversation,
  updateMessage,
  deleteMessage,
  markMessageAsRead,
  getUnreadCount,
  getConversationDetail,
  deleteConversation,
  removeParticipant,
  leaveConversation,
} from "../services/chatService";
import { extractArrayFromResponse } from "../utils/apiHelper";
import { useUser } from "../contexts/UserContext";
import websocketService from "../services/websocketService";

// ---------- Utilities ----------
const normalizeConversation = (item, currentUserId) => {
  if (!item) return null;

  const participants = item.participants || [];
  const otherParticipant = participants.find(
    (p) => p.userId && String(p.userId) !== String(currentUserId)
  );

  return {
    id: item.id || item.conversationId || item._id,
    conversationName:
      item.conversationName ||
      (otherParticipant
        ? `${otherParticipant.firstName || ""} ${
            otherParticipant.lastName || ""
          }`.trim() || otherParticipant.username
        : "Unknown") ||
      "Unknown",
    conversationAvatar:
      item.conversationAvatar || otherParticipant?.avatar || null,
    typeConversation: item.typeConversation || item.type || "DIRECT",
    participants: participants,
    modifiedDate:
      item.modifiedDate || item.updatedAt || item.lastTimestamp || new Date().toISOString(),
    createdDate: item.createdDate || item.createdAt || new Date().toISOString(),
    unread: item.unreadCount || item.unread || 0,
    lastMessage: item.lastMessage || item.lastMessageText || "",
    lastTimestamp:
      item.lastTimestamp ||
      item.lastMessageDate ||
      item.modifiedDate ||
      new Date().toISOString(),
    participantId: otherParticipant?.userId || item.participantId || null,
  };
};

const normalizeMessage = (item, currentUserId) => {
  if (!item) return null;

  const sender = item.sender || {};
  const senderId = sender.userId || item.senderId || item.userId;

  let isMe = false;
  if (typeof item.me === "boolean") {
    isMe = item.me;
  } else if (currentUserId && senderId) {
    isMe = String(senderId) === String(currentUserId);
  }

  if (currentUserId && senderId && typeof item.me !== "boolean") {
    const calculatedIsMe = String(senderId) === String(currentUserId);
    if (calculatedIsMe !== isMe) {
      if (import.meta.env.DEV) {
        console.warn("Mismatch in me calculation:", {
          itemMe: item.me,
          calculatedIsMe,
          senderId,
          currentUserId,
        });
      }
      isMe = calculatedIsMe;
    }
  }

  const pending = isMe ? !!item.pending : false;

  return {
    id: item.id || item._id || `m-${Date.now()}-${Math.random()}`,
    conversationId: item.conversationId || null,
    message: item.message ?? item.content ?? item.text ?? "",
    createdDate:
      item.createdDate ?? item.timestamp ?? item.createdAt ?? new Date().toISOString(),
    me: isMe,
    sender: sender.userId
      ? {
          id: sender.userId,
          userId: sender.userId,
          username: sender.username || null,
          firstName: sender.firstName || null,
          lastName: sender.lastName || null,
          avatar: sender.avatar || null,
          role: sender.role || null,
          name:
            sender.firstName || sender.lastName
              ? `${sender.firstName || ""} ${
                  sender.lastName || ""
                }`.trim()
              : sender.username || null,
        }
      : isMe
      ? null
      : {
          id: senderId,
          userId: senderId,
          avatar: item.senderAvatar || item.avatar || null,
          name: item.senderName || null,
          username: null,
        },
    pending: pending,
    failed: isMe ? !!item.failed : false,
  };
};

// ---------- Component ----------
export default function ChatPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { user } = useUser();
  const currentUserId = user?.id || user?.userId;

  const [message, setMessage] = useState("");
  const [newChatAnchorEl, setNewChatAnchorEl] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationDetail, setConversationDetail] = useState(null);
  const [messagesMap, setMessagesMap] = useState({});
  const [messagesPageMap, setMessagesPageMap] = useState({});
  const [messagesTotalPagesMap, setMessagesTotalPagesMap] = useState({});
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState({});
  const [loadingMoreMessages, setLoadingMoreMessages] = useState({});
  const [wsConnected, setWsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [messageMenuAnchor, setMessageMenuAnchor] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editMessageText, setEditMessageText] = useState("");
  const [conversationInfoOpen, setConversationInfoOpen] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const messageContainerRef = useRef(null);
  const typingTimeoutRef = useRef({});

  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
      setTimeout(() => {
        if (messageContainerRef.current) {
          messageContainerRef.current.scrollTop =
            messageContainerRef.current.scrollHeight;
        }
      }, 100);
      setTimeout(() => {
        if (messageContainerRef.current) {
          messageContainerRef.current.scrollTop =
            messageContainerRef.current.scrollHeight;
        }
      }, 300);
    }
  }, []);

  const handleNewChatClick = (event) => {
    setNewChatAnchorEl(event.currentTarget);
  };
  const handleCloseNewChat = () => {
    setNewChatAnchorEl(null);
  };

  const handleSelectNewChatUser = async (selectedUser) => {
    const exists = conversations.find(
      (c) =>
        c.participantId &&
        String(c.participantId) === String(selectedUser.userId)
    );
    if (exists) {
      setSelectedConversation(exists);
      if (isMobile) setShowChatOnMobile(true);
      handleCloseNewChat();
      return;
    }

    try {
      if (!selectedUser.userId) {
        setError("Không tìm thấy ID người dùng. Vui lòng thử lại.");
        handleCloseNewChat();
        return;
      }

      const response = await createConversation({
        typeConversation: "DIRECT",
        participantIds: [String(selectedUser.userId).trim()],
      });

      const conversationData = response.data?.result || response.data;

      if (!conversationData) {
        setError("Không thể tạo cuộc trò chuyện. Dữ liệu trả về không hợp lệ.");
        handleCloseNewChat();
        return;
      }

      const newConversation = normalizeConversation(
        conversationData,
        currentUserId
      );

      if (!newConversation) {
        setError("Không thể tạo cuộc trò chuyện. Dữ liệu không hợp lệ.");
        handleCloseNewChat();
        return;
      }

      if (!mountedRef.current) return;

      setConversations((prev) => [newConversation, ...prev]);
      setSelectedConversation(newConversation);
      if (isMobile) setShowChatOnMobile(true);

      handleCloseNewChat();
    } catch (err) {
      if (!mountedRef.current) return;

      if (!err || !err.response) {
        setError(
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
        );
        handleCloseNewChat();
        return;
      }

      const status = err.response.status;
      const errorData = err.response.data || {};

      const errorMessage =
        errorData.message ||
        errorData.error ||
        errorData.msg ||
        errorData.errors?.[0]?.message ||
        (typeof errorData.errors === "string"
          ? errorData.errors
          : null) ||
        errorData.details;

      if (status === 400) {
        let detailedMsg = errorMessage;

        if (errorData.errors) {
          if (Array.isArray(errorData.errors)) {
            const msgs = errorData.errors
              .map((e) => e.message || e.field || e)
              .filter(Boolean);
            if (msgs.length > 0) {
              detailedMsg = msgs.join(", ");
            }
          } else if (typeof errorData.errors === "object") {
            const msgs = Object.entries(errorData.errors)
              .map(([key, value]) =>
                `${key}: ${
                  Array.isArray(value) ? value.join(", ") : value
                }`
              )
              .filter(Boolean);
            if (msgs.length > 0) {
              detailedMsg = msgs.join("; ");
            }
          } else if (typeof errorData.errors === "string") {
            detailedMsg = errorData.errors;
          }
        }

        if (!detailedMsg) {
          detailedMsg =
            "Yêu cầu không hợp lệ. Vui lòng kiểm tra lại thông tin người dùng.";
        }

        setError(detailedMsg);
      } else if (status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else if (status === 403) {
        setError("Bạn không có quyền tạo cuộc trò chuyện.");
      } else if (status === 404) {
        setError("Không tìm thấy người dùng này.");
      } else if (status === 500) {
        setError("Lỗi server. Vui lòng thử lại sau.");
      } else {
        setError(
          errorMessage || "Không thể tạo cuộc trò chuyện. Vui lòng thử lại."
        );
      }

      handleCloseNewChat();
    }
  };

  const fetchConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getConversations();
      const responseData = response.data?.result || response.data;

      let conversationsList = [];
      if (Array.isArray(responseData)) {
        conversationsList = responseData;
      } else if (responseData?.data && Array.isArray(responseData.data)) {
        conversationsList = responseData.data;
      } else {
        const extracted = extractArrayFromResponse(response.data);
        conversationsList = extracted.items;
      }

      if (!mountedRef.current) return;

      const normalizedConversations = conversationsList
        .map((conv) => normalizeConversation(conv, currentUserId))
        .filter((conv) => conv !== null);
      setConversations(normalizedConversations);
    } catch (err) {
      if (!mountedRef.current) return;

      if (!err || !err.response) {
        setError(
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
        );
        return;
      }

      const status = err.response.status;
      const errorData = err.response.data || {};
      const errorMessage =
        errorData.message || errorData.error || errorData.msg;

      if (status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else if (status === 403) {
        setError("Bạn không có quyền xem danh sách cuộc trò chuyện.");
      } else if (status === 404) {
        setConversations([]);
        setError(null);
      } else if (status === 500) {
        setError("Lỗi server. Vui lòng thử lại sau.");
      } else {
        setError(
          errorMessage ||
            "Không thể tải danh sách cuộc trò chuyện. Vui lòng thử lại."
        );
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Subscribe to all conversations when WebSocket is connected
  useEffect(() => {
    if (
      !websocketService ||
      typeof websocketService.getConnectionState !== "function" ||
      !wsConnected ||
      conversations.length === 0
    ) {
      return;
    }

    if (import.meta.env.DEV) {
      console.log("Subscribing to all conversations for real-time updates");
    }

    conversations.forEach((conv) => {
      try {
        // Messages subscription
        websocketService.subscribeToMessages(conv.id, (messageData) => {
          if (!mountedRef.current) return;

          if (import.meta.env.DEV) {
            console.log(
              "Received message via WebSocket for conversation:",
              conv.id,
              messageData
            );
          }

          const normalizedMessage = normalizeMessage(
            messageData,
            currentUserId
          );
          if (!normalizedMessage) return;

          setMessagesMap((prev) => {
            const existing = prev[conv.id] || [];
            const exists = existing.some(
              (m) => m.id === normalizedMessage.id
            );
            if (exists) {
              if (normalizedMessage.me) {
                return {
                  ...prev,
                  [conv.id]: existing.map((m) =>
                    m.id === normalizedMessage.id
                      ? { ...m, pending: false, failed: false, me: true }
                      : m
                  ),
                };
              }
              return prev;
            }

            if (normalizedMessage.me) {
              const filtered = existing.filter((m) => {
                if (m.id.startsWith("temp-")) {
                  const timeDiff = Math.abs(
                    new Date(m.createdDate) -
                      new Date(normalizedMessage.createdDate)
                  );
                  const isMatch =
                    m.message === normalizedMessage.message && timeDiff < 5000;
                  return !isMatch;
                }
                return true;
              });
              const serverMessage = {
                ...normalizedMessage,
                pending: false,
                failed: false,
              };
              return {
                ...prev,
                [conv.id]: [...filtered, serverMessage].sort(
                  (a, b) =>
                    new Date(a.createdDate) - new Date(b.createdDate)
                ),
              };
            }

            const otherMessage = {
              ...normalizedMessage,
              pending: false,
              me: false,
            };
            return {
              ...prev,
              [conv.id]: [...existing, otherMessage].sort(
                (a, b) =>
                  new Date(a.createdDate) - new Date(b.createdDate)
              ),
            };
          });

          setConversations((prev) =>
            prev.map((c) =>
              c.id === conv.id
                ? {
                    ...c,
                    lastMessage: normalizedMessage.message,
                    modifiedDate: normalizedMessage.createdDate,
                    lastTimestamp: normalizedMessage.createdDate,
                    unread: normalizedMessage.me
                      ? 0
                      : (c.unread || 0) + 1,
                  }
                : c
            )
          );

          if (selectedConversation?.id === conv.id) {
            scrollToBottom();
          }
        });

        // Typing indicator subscription with auto clear
        websocketService.subscribeToTyping(conv.id, (typingData) => {
          if (!mountedRef.current) return;

          if (import.meta.env.DEV) {
            console.log("Received typing indicator:", typingData);
          }

          const userId = typingData.userId;
          if (!userId || String(userId) === String(currentUserId)) {
            if (import.meta.env.DEV) {
              console.log(
                "Ignoring typing indicator from self or invalid userId"
              );
            }
            return;
          }

          setTypingUsers((prev) => {
            const current = prev[conv.id] || new Set();
            const updated = new Set(current);

            if (typingData.isTyping) {
              updated.add(userId);
              if (import.meta.env.DEV) {
                console.log("User is typing:", userId);
              }
            } else {
              updated.delete(userId);
              if (import.meta.env.DEV) {
                console.log("User stopped typing:", userId);
              }
            }

            return {
              ...prev,
              [conv.id]: updated,
            };
          });

          if (typingData.isTyping) {
            const timeoutKey = `${conv.id}-${userId}`;
            if (typingTimeoutRef.current[timeoutKey]) {
              clearTimeout(typingTimeoutRef.current[timeoutKey]);
            }

            typingTimeoutRef.current[timeoutKey] = setTimeout(() => {
              if (mountedRef.current) {
                setTypingUsers((prev) => {
                  const current = prev[conv.id] || new Set();
                  const updated = new Set(current);
                  updated.delete(userId);
                  if (import.meta.env.DEV) {
                    console.log(
                      "Auto cleared typing indicator for user:",
                      userId
                    );
                  }
                  return {
                    ...prev,
                    [conv.id]: updated,
                  };
                });
              }
              delete typingTimeoutRef.current[timeoutKey];
            }, 3000);
          }
        });
      } catch (error) {
        console.error(
          `Error subscribing to conversation ${conv.id}:`,
          error
        );
      }
    });

    return () => {
      conversations.forEach((conv) => {
        try {
          websocketService.unsubscribeFromMessages(conv.id);
        } catch (error) {
          console.error(
            `Error unsubscribing from conversation ${conv.id}:`,
            error
          );
        }
        try {
          websocketService.unsubscribeFromTyping(conv.id);
        } catch (error) {
          console.error(
            `Error unsubscribing typing from conversation ${conv.id}:`,
            error
          );
        }
      });
    };
  }, [
    conversations,
    currentUserId,
    selectedConversation,
    scrollToBottom,
    wsConnected,
  ]);

  // WebSocket connect and connection state
  useEffect(() => {
    if (!currentUserId) return;

    try {
      const handleConnectionChange = (connected) => {
        if (mountedRef.current) {
          setWsConnected(connected);
        }
      };

      if (
        websocketService &&
        typeof websocketService.onConnectionChange === "function"
      ) {
        websocketService.onConnectionChange(handleConnectionChange);

        if (typeof websocketService.connect === "function") {
          websocketService.connect(
            () => {
              if (import.meta.env.DEV) {
                console.log("WebSocket connected successfully");
              }
            },
            (error) => {
              console.error("WebSocket connection error:", error);
            }
          );
        }
      }

      return () => {
        if (
          websocketService &&
          typeof websocketService.offConnectionChange === "function"
        ) {
          websocketService.offConnectionChange(handleConnectionChange);
        }
        if (
          websocketService &&
          typeof websocketService.disconnect === "function"
        ) {
          websocketService.disconnect();
        }
      };
    } catch (error) {
      console.error("Error setting up WebSocket:", error);
    }
  }, [currentUserId]);

  // Init selected conversation on desktop
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation && !isMobile) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, selectedConversation, isMobile]);

  // Load messages when conversation changes
  useEffect(() => {
    let canceled = false;

    const fetchMessages = async (conversationId) => {
      if (!conversationId) return;

      setLoadingMessages((prev) => ({ ...prev, [conversationId]: true }));

      try {
        const response = await getMessagesPaginated(conversationId, 1, 50);
        const responseData = response.data?.result || response.data;

        let messagesList = [];
        let totalPages = 1;

        if (responseData?.data && Array.isArray(responseData.data)) {
          messagesList = responseData.data;
          totalPages = responseData.totalPages || 1;
        } else if (Array.isArray(responseData)) {
          messagesList = responseData;
          totalPages = 1;
        } else {
          const extracted = extractArrayFromResponse(response.data);
          messagesList = extracted.items;
          totalPages = extracted.totalPages || 1;
        }

        if (canceled || !mountedRef.current) return;

        const normalizedMessages = messagesList
          .map((msg) => normalizeMessage(msg, currentUserId))
          .filter((msg) => msg !== null);

        setMessagesMap((prev) => ({
          ...prev,
          [conversationId]: normalizedMessages.sort(
            (a, b) => new Date(a.createdDate) - new Date(b.createdDate)
          ),
        }));

        setMessagesPageMap((prev) => ({
          ...prev,
          [conversationId]: 1,
        }));
        setMessagesTotalPagesMap((prev) => ({
          ...prev,
          [conversationId]: totalPages,
        }));

        const unreadMessages = normalizedMessages.filter((msg) => !msg.me);
        if (unreadMessages.length > 0) {
          Promise.all(
            unreadMessages.slice(0, 10).map((msg) =>
              markMessageAsRead(msg.id).catch((err) => {
                console.error("Error marking message as read:", err);
                return null;
              })
            )
          );
        }

        try {
          const unreadResponse = await getUnreadCount(conversationId);
          const unreadCount = unreadResponse.data?.result || 0;
          setUnreadCounts((prev) => ({
            ...prev,
            [conversationId]: unreadCount,
          }));

          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === conversationId ? { ...conv, unread: unreadCount } : conv
            )
          );
        } catch (err) {
          console.error("Error getting unread count:", err);
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === conversationId ? { ...conv, unread: 0 } : conv
            )
          );
        }
      } catch (err) {
        if (!canceled && mountedRef.current) {
          if (err.response?.status === 404) {
            setMessagesMap((prev) => ({
              ...prev,
              [conversationId]: prev[conversationId] || [],
            }));
            return;
          }

          if (!err || !err.response) {
            setError(
              "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
            );
          } else {
            const status = err.response.status;
            const errorData = err.response.data || {};
            const errorMessage =
              errorData.message || errorData.error || errorData.msg;

            if (status === 401) {
              setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            } else if (status === 403) {
              setError("Bạn không có quyền xem tin nhắn này.");
            } else if (status === 500) {
              setError("Lỗi server. Vui lòng thử lại sau.");
            } else {
              setError(
                errorMessage || "Không thể tải tin nhắn. Vui lòng thử lại."
              );
            }
          }

          setMessagesMap((prev) => ({
            ...prev,
            [conversationId]: prev[conversationId] || [],
          }));
        }
      } finally {
        if (!canceled && mountedRef.current) {
          setLoadingMessages((prev) => ({
            ...prev,
            [conversationId]: false,
          }));
        }
      }
    };

    if (selectedConversation?.id) {
      fetchMessages(selectedConversation.id);
    }

    return () => {
      canceled = true;
    };
  }, [selectedConversation, currentUserId]);

  const currentMessages = selectedConversation
    ? messagesMap[selectedConversation.id] || []
    : [];

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation, scrollToBottom]);

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    if (isMobile) {
      setShowChatOnMobile(true);
    }
  };

  const handleBackToConversations = () => {
    setShowChatOnMobile(false);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConversation) return;

    const convId = selectedConversation.id;
    const messageText = message.trim();
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const optimistic = {
      id: tempId,
      message: messageText,
      createdDate: new Date().toISOString(),
      me: true,
      pending: true,
      failed: false,
    };

    setMessagesMap((prev) => ({
      ...prev,
      [convId]: [...(prev[convId] || []), optimistic],
    }));

    setConversations((prevConversations) =>
      prevConversations.map((conv) =>
        conv.id === convId
          ? {
              ...conv,
              lastMessage: messageText,
              modifiedDate: new Date().toISOString(),
              lastTimestamp: new Date().toISOString(),
            }
          : conv
      )
    );

    setMessage("");

    let useWebSocket = false;
    if (
      websocketService &&
      typeof websocketService.getConnectionState === "function"
    ) {
      useWebSocket = websocketService.getConnectionState();
    }

    if (
      useWebSocket &&
      websocketService &&
      typeof websocketService.sendMessage === "function"
    ) {
      try {
        if (import.meta.env.DEV) {
          console.log("Sending message via WebSocket:", {
            convId,
            messageText,
          });
        }
        websocketService.sendMessage(convId, messageText);

        setTimeout(() => {
          if (mountedRef.current) {
            setMessagesMap((prev) => {
              const existing = prev[convId] || [];
              const hasPending = existing.some(
                (m) => m.id === tempId && m.pending
              );
              if (hasPending) {
                if (import.meta.env.DEV) {
                  console.warn(
                    "No WebSocket response after timeout, clearing pending state"
                  );
                }
                return {
                  ...prev,
                  [convId]: existing.map((m) =>
                    m.id === tempId ? { ...m, pending: false } : m
                  ),
                };
              }
              return prev;
            });
          }
        }, 5000);
      } catch (wsError) {
        console.error("WebSocket send error, fallback to REST:", wsError);
        useWebSocket = false;
      }
    } else if (useWebSocket) {
      useWebSocket = false;
    }

    if (!useWebSocket) {
      try {
        const response = await sendMessage(convId, messageText);
        if (!mountedRef.current) return;

        const serverMessageData = response.data?.result || response.data;
        const serverMessage = normalizeMessage(
          serverMessageData,
          currentUserId
        );

        if (!serverMessage) {
          console.error(
            "Failed to normalize server message:",
            serverMessageData
          );
          setMessagesMap((prev) => {
            const existing = prev[convId] || [];
            return {
              ...prev,
              [convId]: existing.filter((m) => m.id !== tempId),
            };
          });
          return;
        }

        setMessagesMap((prev) => {
          const existing = prev[convId] || [];
          const filtered = existing.filter((m) => m.id !== tempId);
          const exists = filtered.some((m) => m.id === serverMessage.id);
          if (exists) {
            return { ...prev, [convId]: filtered };
          }
          return {
            ...prev,
            [convId]: [...filtered, serverMessage].sort(
              (a, b) => new Date(a.createdDate) - new Date(b.createdDate)
            ),
          };
        });
      } catch (err) {
        if (!mountedRef.current) return;

        setMessagesMap((prev) => {
          const updated = (prev[convId] || []).map((m) =>
            m.id === tempId ? { ...m, failed: true, pending: false } : m
          );
          return { ...prev, [convId]: updated };
        });

        if (!err || !err.response) {
          setError(
            "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
          );
          return;
        }

        const status = err.response.status;
        const errorData = err.response.data || {};
        const errorMessage =
          errorData.message || errorData.error || errorData.msg;

        if (status === 401) {
          setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        } else if (status === 403) {
          setError(
            "Bạn không có quyền gửi tin nhắn vào cuộc trò chuyện này."
          );
        } else if (status === 404) {
          setError("Cuộc trò chuyện không tồn tại.");
        } else if (status === 500) {
          setError("Lỗi server. Vui lòng thử lại sau.");
        } else {
          setError(
            errorMessage || "Không thể gửi tin nhắn. Vui lòng thử lại."
          );
        }
      }
    }
  };

  const handleMessageMenuOpen = (event, message) => {
    event.stopPropagation();
    setMessageMenuAnchor(event.currentTarget);
    setSelectedMessage(message);
  };

  const handleMessageMenuClose = () => {
    setMessageMenuAnchor(null);
    setSelectedMessage(null);
  };

  const handleEditMessage = () => {
    if (selectedMessage) {
      setEditingMessage(selectedMessage);
      setEditMessageText(selectedMessage.message);
      handleMessageMenuClose();
    }
  };

  const handleSaveEditMessage = async () => {
    if (!editingMessage || !editMessageText.trim()) return;

    try {
      const response = await updateMessage(
        editingMessage.id,
        editMessageText.trim()
      );
      if (!mountedRef.current) return;

      const updatedMessageData = response.data?.result || response.data;
      const updatedMessage = normalizeMessage(
        updatedMessageData,
        currentUserId
      );

      if (!updatedMessage) {
        console.error(
          "Failed to normalize updated message:",
          updatedMessageData
        );
        setError("Không thể cập nhật tin nhắn. Dữ liệu không hợp lệ.");
        return;
      }

      const convId = selectedConversation.id;
      setMessagesMap((prev) => ({
        ...prev,
        [convId]: (prev[convId] || []).map((m) =>
          m.id === editingMessage.id ? updatedMessage : m
        ),
      }));

      setEditingMessage(null);
      setEditMessageText("");
    } catch (err) {
      console.error("Error updating message:", err);
      setError("Không thể cập nhật tin nhắn. Vui lòng thử lại.");
    }
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditMessageText("");
  };

  const handleDeleteMessage = async () => {
    if (!selectedMessage) return;

    if (!window.confirm("Bạn có chắc chắn muốn xóa tin nhắn này?")) {
      handleMessageMenuClose();
      return;
    }

    try {
      await deleteMessage(selectedMessage.id);
      if (!mountedRef.current) return;

      const convId = selectedConversation.id;
      setMessagesMap((prev) => ({
        ...prev,
        [convId]: (prev[convId] || []).filter(
          (m) => m.id !== selectedMessage.id
        ),
      }));

      handleMessageMenuClose();
    } catch (err) {
      console.error("Error deleting message:", err);
      setError("Không thể xóa tin nhắn. Vui lòng thử lại.");
      handleMessageMenuClose();
    }
  };

  const handleLoadMoreMessages = async () => {
    if (!selectedConversation?.id) return;

    const convId = selectedConversation.id;
    const currentPage = messagesPageMap[convId] || 1;
    const totalPages = messagesTotalPagesMap[convId] || 1;

    if (currentPage >= totalPages || loadingMoreMessages[convId]) return;

    setLoadingMoreMessages((prev) => ({ ...prev, [convId]: true }));

    try {
      const nextPage = currentPage + 1;
      const response = await getMessagesPaginated(convId, nextPage, 50);
      const responseData = response.data?.result || response.data;

      let newMessages = [];
      let totalPagesResponse = 1;

      if (responseData?.data && Array.isArray(responseData.data)) {
        newMessages = responseData.data;
        totalPagesResponse = responseData.totalPages || 1;
      } else if (Array.isArray(responseData)) {
        newMessages = responseData;
      } else {
        const extracted = extractArrayFromResponse(response.data);
        newMessages = extracted.items;
        totalPagesResponse = extracted.totalPages || 1;
      }

      if (!mountedRef.current) return;

      const normalizedMessages = newMessages
        .map((msg) => normalizeMessage(msg, currentUserId))
        .filter((msg) => msg !== null);

      const container = messageContainerRef.current;
      const scrollHeightBefore = container?.scrollHeight || 0;
      const scrollTopBefore = container?.scrollTop || 0;

      setMessagesMap((prev) => {
        const existing = prev[convId] || [];
        const existingIds = new Set(existing.map((m) => m.id));
        const uniqueNew = normalizedMessages.filter(
          (m) => !existingIds.has(m.id)
        );

        return {
          ...prev,
          [convId]: [...uniqueNew, ...existing].sort(
            (a, b) => new Date(a.createdDate) - new Date(b.createdDate)
          ),
        };
      });

      setMessagesPageMap((prev) => ({ ...prev, [convId]: nextPage }));
      setMessagesTotalPagesMap((prev) => ({
        ...prev,
        [convId]: totalPagesResponse,
      }));

      setTimeout(() => {
        if (container) {
          const scrollHeightAfter = container.scrollHeight;
          const scrollDiff = scrollHeightAfter - scrollHeightBefore;
          container.scrollTop = scrollTopBefore + scrollDiff;
        }
      }, 0);
    } catch (err) {
      console.error("Error loading more messages:", err);
    } finally {
      if (mountedRef.current) {
        setLoadingMoreMessages((prev) => ({ ...prev, [convId]: false }));
      }
    }
  };

  const handleConversationInfoOpen = async () => {
    if (!selectedConversation?.id) return;

    try {
      const response = await getConversationDetail(selectedConversation.id);
      if (!mountedRef.current) return;

      const detailData = response.data?.result || response.data;
      setConversationDetail(detailData);
      setConversationInfoOpen(true);
    } catch (err) {
      console.error("Error loading conversation detail:", err);
      setError("Không thể tải thông tin cuộc trò chuyện.");
    }
  };

  const handleConversationInfoClose = () => {
    setConversationInfoOpen(false);
    setConversationDetail(null);
  };

  const handleTyping = useCallback(
    (e) => {
      if (!selectedConversation?.id || !currentUserId) return;

      const convId = selectedConversation.id;

      if (
        websocketService &&
        typeof websocketService.sendTypingIndicator === "function"
      ) {
        try {
          websocketService.sendTypingIndicator(convId, currentUserId, true);
        } catch (err) {
          console.error("Error sending typing indicator:", err);
        }
      }

      if (typingTimeoutRef.current[convId]) {
        clearTimeout(typingTimeoutRef.current[convId]);
      }

      typingTimeoutRef.current[convId] = setTimeout(() => {
        if (
          websocketService &&
          typeof websocketService.sendTypingIndicator === "function"
        ) {
          try {
            websocketService.sendTypingIndicator(
              convId,
              currentUserId,
              false
            );
          } catch (err) {
            console.error("Error sending typing stop:", err);
          }
        }
      }, 3000);
    },
    [selectedConversation, currentUserId]
  );

  const cardHeight = isMobile
    ? "calc(100vh - 64px - 64px)"
    : "calc(100vh - 64px - 32px)";

  return (
    <PageLayout>
      <Box
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", md: 1400 },
          height: cardHeight,
          maxHeight: "100%",
          mx: "auto",
          display: "flex",
          flexDirection: "row",
          overflow: "hidden",
          pl: 0,
          pr: { xs: 1, md: 1 },
        }}
      >
        <Card
          sx={(t) => ({
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "row",
            overflow: "hidden",
            borderRadius: { xs: 0, md: 2 },
            boxShadow: t.shadows[1],
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            boxSizing: "border-box",
          })}
        >
          {/* Conversations List */}
          <Box
            sx={{
              width: { xs: "100%", md: 300 },
              borderRight: { xs: 0, md: 1 },
              borderColor: "divider",
              display: isMobile && showChatOnMobile ? "none" : "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            <Box
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderBottom: 1,
                borderColor: "divider",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                bgcolor: "background.paper",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                  fontWeight: 600,
                }}
              >
                Chats
              </Typography>
              <IconButton
                color="primary"
                size="small"
                onClick={handleNewChatClick}
                sx={{
                  "&:hover": {
                    transform: "scale(1.1)",
                  },
                }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
              <CreateChatPopover
                anchorEl={newChatAnchorEl}
                open={Boolean(newChatAnchorEl)}
                onClose={handleCloseNewChat}
                onSelectUser={handleSelectNewChatUser}
              />
            </Box>

            <Box sx={{ flexGrow: 1, overflowY: "auto", minHeight: 0 }}>
              {loading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    p: 3,
                  }}
                >
                  <CircularProgress size={28} />
                </Box>
              ) : error ? (
                <Box sx={{ p: 2 }}>
                  <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                    action={
                      <IconButton
                        color="inherit"
                        size="small"
                        onClick={fetchConversations}
                      >
                        <RefreshIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    {error}
                  </Alert>
                </Box>
              ) : conversations == null || conversations.length === 0 ? (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <Typography
                    color="text.secondary"
                    sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                  >
                    Chưa có cuộc trò chuyện. Bấm nút + để bắt đầu.
                  </Typography>
                </Box>
              ) : (
                <List sx={{ width: "100%" }}>
                  {conversations.map((conversation) => (
                    <React.Fragment key={conversation.id}>
                      <ListItem
                        alignItems="flex-start"
                        onClick={() =>
                          handleConversationSelect(conversation)
                        }
                        sx={(t) => ({
                          cursor: "pointer",
                          py: { xs: 1, sm: 1.5 },
                          px: { xs: 1.5, sm: 2 },
                          borderRadius: 1,
                          bgcolor:
                            selectedConversation?.id === conversation.id
                              ? "action.selected"
                              : "transparent",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            bgcolor: "action.hover",
                          },
                        })}
                      >
                        <ListItemAvatar>
                          <Badge
                            color="error"
                            badgeContent={conversation.unread}
                            invisible={conversation.unread === 0}
                            overlap="circular"
                          >
                            <Avatar
                              src={conversation.conversationAvatar || ""}
                              sx={{
                                width: { xs: 40, sm: 48 },
                                height: { xs: 40, sm: 48 },
                              }}
                            />
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Stack
                              direction="row"
                              display={"flex"}
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                                noWrap
                                sx={{
                                  display: "inline",
                                  fontSize: {
                                    xs: "0.875rem",
                                    sm: "0.875rem",
                                  },
                                }}
                              >
                                {conversation.conversationName}
                              </Typography>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  display: "inline",
                                  fontSize: {
                                    xs: "0.65rem",
                                    sm: "0.7rem",
                                  },
                                  ml: 1,
                                }}
                              >
                                {new Date(
                                  conversation.modifiedDate
                                ).toLocaleString("vi-VN", {
                                  year: "numeric",
                                  month: "numeric",
                                  day: "numeric",
                                })}
                              </Typography>
                            </Stack>
                          }
                          secondary={
                            <Typography
                              sx={{
                                display: "inline",
                                fontSize: {
                                  xs: "0.8rem",
                                  sm: "0.875rem",
                                },
                              }}
                              component="span"
                              variant="body2"
                              color="text.primary"
                              noWrap
                            >
                              {conversation.lastMessage ||
                                "Start a conversation"}
                            </Typography>
                          }
                          primaryTypographyProps={{
                            fontWeight:
                              conversation.unread > 0 ? "bold" : "normal",
                          }}
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            pr: 1,
                          }}
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          </Box>

          {/* Chat Area */}
          <Box
            sx={{
              flex: 1,
              display: isMobile && !showChatOnMobile ? "none" : "flex",
              flexDirection: "column",
              minHeight: 0,
              width: isMobile ? "100%" : "auto",
              overflow: "hidden",
            }}
          >
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <Box
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    borderBottom: 1,
                    borderColor: "divider",
                    display: "flex",
                    alignItems: "center",
                    bgcolor: "background.paper",
                    flexShrink: 0,
                  }}
                >
                  {isMobile && (
                    <IconButton
                      onClick={handleBackToConversations}
                      sx={{ mr: 1 }}
                      size="small"
                    >
                      <ArrowBackIcon />
                    </IconButton>
                  )}
                  <Tooltip title={wsConnected ? "Online" : "Offline"}>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                      }}
                      variant="dot"
                      sx={{
                        "& .MuiBadge-badge": {
                          backgroundColor: wsConnected
                            ? "success.main"
                            : "error.main",
                          color: wsConnected
                            ? "success.main"
                            : "error.main",
                          boxShadow: (t) =>
                            `0 0 0 2px ${
                              t.palette.mode === "dark"
                                ? t.palette.background.paper
                                : "#fff"
                            }`,
                          width: 8,
                          height: 8,
                          minWidth: 8,
                          animation: wsConnected ? "none" : "pulse 2s infinite",
                          "@keyframes pulse": {
                            "0%, 100%": { opacity: 1, transform: "scale(1)" },
                            "50%": {
                              opacity: 0.7,
                              transform: "scale(1.1)",
                            },
                          },
                        },
                      }}
                    >
                      <Avatar
                        src={selectedConversation.conversationAvatar}
                        sx={{
                          mr: { xs: 1.5, sm: 2 },
                          width: { xs: 36, sm: 40 },
                          height: { xs: 36, sm: 40 },
                        }}
                      />
                    </Badge>
                  </Tooltip>
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: { xs: "1rem", sm: "1.25rem" },
                      fontWeight: 600,
                    }}
                  >
                    {selectedConversation.conversationName}
                  </Typography>
                  <Box
                    sx={{
                      ml: "auto",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <IconButton size="small" onClick={handleConversationInfoOpen}>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Box
                  id="messageContainer"
                  ref={messageContainerRef}
                  onScroll={(e) => {
                    const container = e.target;
                    if (
                      container.scrollTop < 100 &&
                      selectedConversation?.id
                    ) {
                      const convId = selectedConversation.id;
                      const currentPage = messagesPageMap[convId] || 1;
                      const totalPages =
                        messagesTotalPagesMap[convId] || 1;

                      if (
                        currentPage < totalPages &&
                        !loadingMoreMessages[convId]
                      ) {
                        handleLoadMoreMessages();
                      }
                    }
                  }}
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    overflowX: "hidden",
                    p: { xs: 1.5, sm: 2 },
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    "&::-webkit-scrollbar": {
                      width: "8px",
                    },
                    "&::-webkit-scrollbar-track": {
                      background: "transparent",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      background: (t) =>
                        t.palette.mode === "dark"
                          ? "rgba(255, 255, 255, 0.2)"
                          : "rgba(0, 0, 0, 0.2)",
                      borderRadius: "4px",
                      "&:hover": {
                        background: (t) =>
                          t.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.3)"
                            : "rgba(0, 0, 0, 0.3)",
                      },
                    },
                  }}
                >
                  {loadingMessages[selectedConversation.id] &&
                  currentMessages.length === 0 ? (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flex: 1,
                      }}
                    >
                      <CircularProgress size={32} />
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                        justifyContent: "flex-end",
                        minHeight: "100%",
                      }}
                    >
                      {/* Load more */}
                      {selectedConversation?.id &&
                        (messagesPageMap[selectedConversation.id] || 1) <
                          (messagesTotalPagesMap[selectedConversation.id] ||
                            1) && (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              py: 1,
                              flexShrink: 0,
                            }}
                          >
                            {loadingMoreMessages[selectedConversation.id] ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <CircularProgress size={16} />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Đang tải thêm tin nhắn...
                                </Typography>
                              </Box>
                            ) : (
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={handleLoadMoreMessages}
                                sx={{ minWidth: 120 }}
                              >
                                Tải thêm tin nhắn
                              </Button>
                            )}
                          </Box>
                        )}

                      {/* Typing indicator */}
                      {selectedConversation?.id &&
                        typingUsers[selectedConversation.id]?.size > 0 && (
                          <Box
                            sx={{
                              px: 2,
                              py: 1,
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <CircularProgress size={16} />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {(() => {
                                const typingSet =
                                  typingUsers[selectedConversation.id];
                                if (!typingSet || typingSet.size === 0)
                                  return "";

                                const typingArray = Array.from(typingSet);
                                const names = typingArray.map((uid) => {
                                  const participant =
                                    conversationDetail?.participants?.find(
                                      (p) =>
                                        String(p.userId) === String(uid)
                                    ) ||
                                    selectedConversation?.participants?.find(
                                      (p) =>
                                        String(p.userId) === String(uid)
                                    );
                                  if (participant) {
                                    const fullName = `${participant.lastName ||
                                      ""} ${
                                      participant.firstName || ""
                                    }`.trim();
                                    return (
                                      fullName ||
                                      participant.username ||
                                      "Someone"
                                    );
                                  }
                                  return "Someone";
                                });

                                if (names.length === 1) {
                                  return `${names[0]} đang gõ...`;
                                } else if (names.length === 2) {
                                  return `${names[0]} và ${names[1]} đang gõ...`;
                                }
                                return `${names
                                  .slice(0, -1)
                                  .join(", ")} và ${
                                  names[names.length - 1]
                                } đang gõ...`;
                              })()}
                            </Typography>
                          </Box>
                        )}

                      {currentMessages.map((msg) => (
                        <Box
                          key={msg.id}
                          sx={{
                            display: "flex",
                            justifyContent: msg.me
                              ? "flex-end"
                              : "flex-start",
                            alignItems: "flex-end",
                            mb: { xs: 1.5, sm: 2 },
                            gap: 1,
                          }}
                        >
                          {!msg.me && (
                            <Avatar
                              src={msg.sender?.avatar}
                              sx={{
                                width: { xs: 32, sm: 36 },
                                height: { xs: 32, sm: 36 },
                                display: { xs: "none", sm: "flex" },
                              }}
                            />
                          )}
                          <Box
                            sx={{
                              position: "relative",
                              maxWidth: {
                                xs: "85%",
                                sm: "75%",
                                md: "65%",
                              },
                            }}
                          >
                            {editingMessage?.id === msg.id ? (
                              <Paper
                                elevation={2}
                                sx={(t) => ({
                                  p: { xs: 1.5, sm: 2 },
                                  backgroundColor:
                                    t.palette.mode === "dark"
                                      ? "rgba(255, 243, 205, 0.1)"
                                      : "#fff3cd",
                                  borderRadius: 3,
                                })}
                              >
                                <TextField
                                  fullWidth
                                  multiline
                                  value={editMessageText}
                                  onChange={(e) =>
                                    setEditMessageText(e.target.value)
                                  }
                                  size="small"
                                  autoFocus
                                  sx={{ mb: 1 }}
                                />
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  justifyContent="flex-end"
                                >
                                  <Button
                                    size="small"
                                    onClick={handleCancelEdit}
                                  >
                                    Hủy
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    onClick={handleSaveEditMessage}
                                  >
                                    Lưu
                                  </Button>
                                </Stack>
                              </Paper>
                            ) : (
                              <>
                                <Paper
                                  elevation={0}
                                  onContextMenu={(e) =>
                                    msg.me &&
                                    handleMessageMenuOpen(e, msg)
                                  }
                                  sx={(t) => ({
                                    p: { xs: 1.25, sm: 1.5 },
                                    backgroundColor: msg.me
                                      ? msg.failed
                                        ? t.palette.error.light
                                        : t.palette.mode === "dark"
                                        ? "rgba(25, 118, 210, 0.3)"
                                        : "rgba(25, 118, 210, 0.15)"
                                      : t.palette.mode === "dark"
                                      ? "rgba(255, 255, 255, 0.08)"
                                      : "rgba(0, 0, 0, 0.05)",
                                    borderRadius: msg.me
                                      ? "18px 18px 4px 18px"
                                      : "18px 18px 18px 4px",
                                    opacity: msg.pending ? 0.7 : 1,
                                    cursor: msg.me
                                      ? "context-menu"
                                      : "default",
                                    color: t.palette.text.primary,
                                    transition: "all 0.2s ease",
                                    "&:hover": msg.me
                                      ? {
                                          boxShadow: t.shadows[2],
                                        }
                                      : {},
                                  })}
                                >
                                  <Typography
                                    variant="body1"
                                    sx={{
                                      fontSize: {
                                        xs: "0.875rem",
                                        sm: "0.9375rem",
                                      },
                                      whiteSpace: "pre-wrap",
                                      wordBreak: "break-word",
                                    }}
                                  >
                                    {msg.message}
                                  </Typography>
                                  <Stack
                                    direction="row"
                                    spacing={0.5}
                                    alignItems="center"
                                    justifyContent="flex-end"
                                    sx={{ mt: 0.75 }}
                                  >
                                    {msg.failed && (
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontSize: {
                                            xs: "0.65rem",
                                            sm: "0.7rem",
                                          },
                                          color: "error.main",
                                        }}
                                      >
                                        Gửi thất bại
                                      </Typography>
                                    )}
                                    {msg.me && msg.pending && (
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontSize: {
                                            xs: "0.65rem",
                                            sm: "0.7rem",
                                          },
                                          color: "text.secondary",
                                        }}
                                      >
                                        Đang gửi...
                                      </Typography>
                                    )}
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        fontSize: {
                                          xs: "0.65rem",
                                          sm: "0.7rem",
                                        },
                                        color: "text.secondary",
                                        ml: 0.5,
                                      }}
                                    >
                                      {new Date(
                                        msg.createdDate
                                      ).toLocaleTimeString("vi-VN", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </Typography>
                                  </Stack>
                                </Paper>
                                {msg.me && (
                                  <IconButton
                                    size="small"
                                    sx={{
                                      position: "absolute",
                                      top: 0,
                                      right: -36,
                                      opacity: 0,
                                      transition: "opacity 0.2s ease",
                                      "&:hover": { opacity: 1 },
                                    }}
                                    onClick={(e) =>
                                      handleMessageMenuOpen(e, msg)
                                    }
                                  >
                                    <MoreVertIcon fontSize="small" />
                                  </IconButton>
                                )}
                              </>
                            )}
                          </Box>
                          {msg.me && (
                            <Avatar
                              src={user?.avatar}
                              sx={{
                                width: { xs: 32, sm: 36 },
                                height: { xs: 32, sm: 36 },
                                display: { xs: "none", sm: "flex" },
                              }}
                            >
                              {user?.username
                                ?.charAt(0)
                                ?.toUpperCase() || "Y"}
                            </Avatar>
                          )}
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>

                {/* Input */}
                <Box
                  component="form"
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    borderTop: 1,
                    borderColor: "divider",
                    display: "flex",
                    gap: { xs: 0.5, sm: 1 },
                    flexShrink: 0,
                    bgcolor: "background.paper",
                  }}
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                >
                  <TextField
                    fullWidth
                    placeholder="Type a message"
                    variant="outlined"
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      handleTyping(e);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    size="small"
                    multiline
                    maxRows={4}
                    sx={{
                      "& .MuiInputBase-input": {
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                      },
                    }}
                  />
                  <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    size={isSmallScreen ? "small" : "medium"}
                  >
                    <SendIcon
                      fontSize={isSmallScreen ? "small" : "medium"}
                    />
                  </IconButton>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  p: 3,
                }}
              >
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: "1rem", sm: "1.25rem" },
                    textAlign: "center",
                  }}
                >
                  Chọn một cuộc trò chuyện để bắt đầu
                </Typography>
              </Box>
            )}
          </Box>
        </Card>
      </Box>

      {/* Message Context Menu */}
      <Menu
        anchorEl={messageMenuAnchor}
        open={Boolean(messageMenuAnchor)}
        onClose={handleMessageMenuClose}
      >
        <MenuItem onClick={handleEditMessage}>
          <EditIcon sx={{ mr: 1, fontSize: 18 }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={handleDeleteMessage}
          sx={{ color: "error.main" }}
        >
          <DeleteIcon sx={{ mr: 1, fontSize: 18 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Conversation Info Dialog */}
      <Dialog
        open={conversationInfoOpen}
        onClose={handleConversationInfoClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              src={
                conversationDetail?.conversationAvatar ||
                selectedConversation?.conversationAvatar
              }
            />
            <Box>
              <Typography variant="h6">
                {conversationDetail?.conversationName ||
                  selectedConversation?.conversationName}
              </Typography>
              <Chip
                label={
                  conversationDetail?.typeConversation ||
                  selectedConversation?.typeConversation ||
                  "DIRECT"
                }
                size="small"
                sx={{ mt: 0.5 }}
              />
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {conversationDetail && (
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ mb: 1, mt: 2 }}
              >
                Participants (
                {conversationDetail.participants?.length || 0})
              </Typography>
              <List>
                {conversationDetail.participants?.map((participant) => (
                  <ListItem key={participant.userId}>
                    <ListItemAvatar>
                      <Avatar src={participant.avatar} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        `${participant.lastName || ""} ${
                          participant.firstName || ""
                        }`.trim() || participant.username
                      }
                      secondary={participant.username}
                    />
                    {selectedConversation?.typeConversation ===
                      "GROUP" &&
                      String(participant.userId) !==
                        String(currentUserId) && (
                        <IconButton
                          size="small"
                          onClick={async () => {
                            try {
                              await removeParticipant(
                                selectedConversation.id,
                                participant.userId
                              );
                              const response =
                                await getConversationDetail(
                                  selectedConversation.id
                                );
                              setConversationDetail(
                                response.data?.result ||
                                  response.data
                              );
                              fetchConversations();
                            } catch (err) {
                              console.error(
                                "Error removing participant:",
                                err
                              );
                              setError(
                                "Không thể xóa thành viên. Vui lòng thử lại."
                              );
                            }
                          }}
                        >
                          <PersonRemoveIcon fontSize="small" />
                        </IconButton>
                      )}
                  </ListItem>
                ))}
              </List>

              {selectedConversation?.typeConversation === "GROUP" && (
                <Box sx={{ mt: 3 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<GroupAddIcon />}
                    onClick={async () => {
                      setError(
                        "Chức năng thêm thành viên đang được phát triển."
                      );
                    }}
                    sx={{ mb: 1 }}
                  >
                    Add Members
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={<ExitToAppIcon />}
                    onClick={async () => {
                      if (
                        window.confirm(
                          "Bạn có chắc chắn muốn rời khỏi nhóm này?"
                        )
                      ) {
                        try {
                          await leaveConversation(
                            selectedConversation.id
                          );
                          handleConversationInfoClose();
                          setSelectedConversation(null);
                          fetchConversations();
                        } catch (err) {
                          console.error(
                            "Error leaving conversation:",
                            err
                          );
                          setError(
                            "Không thể rời khỏi nhóm. Vui lòng thử lại."
                          );
                        }
                      }
                    }}
                  >
                    Leave Group
                  </Button>
                </Box>
              )}

              {selectedConversation?.typeConversation === "DIRECT" && (
                <Box sx={{ mt: 3 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={async () => {
                      if (
                        window.confirm(
                          "Bạn có chắc chắn muốn xóa cuộc trò chuyện này?"
                        )
                      ) {
                        try {
                          await deleteConversation(
                            selectedConversation.id
                          );
                          handleConversationInfoClose();
                          setSelectedConversation(null);
                          fetchConversations();
                        } catch (err) {
                          console.error(
                            "Error deleting conversation:",
                            err
                          );
                          setError(
                            "Không thể xóa cuộc trò chuyện. Vui lòng thử lại."
                          );
                        }
                      }
                    }}
                  >
                    Delete Conversation
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConversationInfoClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
}
