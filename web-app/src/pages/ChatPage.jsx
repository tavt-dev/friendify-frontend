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
  LinearProgress,
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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonIcon from "@mui/icons-material/Person";
import PageLayout from "./PageLayout";
import CreateChatPopover from "../components/CreateChatPopover";
import AddMembersDialog from "../components/AddMembersDialog";
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
  updateConversation,
  deleteConversation,
  addParticipants,
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
  const otherParticipant = participants.find(p => 
    p.userId && String(p.userId) !== String(currentUserId)
  );
  
  return {
    id: item.id || item.conversationId || item._id,
    conversationName: item.conversationName || 
      (otherParticipant ? `${otherParticipant.firstName || ''} ${otherParticipant.lastName || ''}`.trim() || otherParticipant.username : 'Unknown') ||
      'Unknown',
    conversationAvatar: item.conversationAvatar || 
      (otherParticipant?.avatar) || 
      null,
    typeConversation: item.typeConversation || item.type || 'DIRECT',
    participants: participants,
    modifiedDate: item.modifiedDate || item.updatedAt || item.lastTimestamp || new Date().toISOString(),
    createdDate: item.createdDate || item.createdAt || new Date().toISOString(),
    unread: item.unreadCount || item.unread || 0,
    lastMessage: item.lastMessage || item.lastMessageText || '',
    lastTimestamp: item.lastTimestamp || item.lastMessageDate || item.modifiedDate || new Date().toISOString(),
    participantId: otherParticipant?.userId || item.participantId || null,
  };
};

const normalizeMessage = (item, currentUserId) => {
  if (!item) return null;
  
  const sender = item.sender || {};
  const senderId = sender.userId || item.senderId || item.userId;
  
  // Ưu tiên dùng item.me từ backend (backend đã tính sẵn)
  // Sau đó mới so sánh senderId với currentUserId để đảm bảo chính xác
  let isMe = false;
  if (typeof item.me === 'boolean') {
    // Backend đã tính sẵn, ưu tiên dùng
    isMe = item.me;
  } else if (currentUserId && senderId) {
    // Fallback: so sánh senderId với currentUserId nếu backend không có item.me
    isMe = String(senderId) === String(currentUserId);
  }
  
  // Double check: nếu có senderId và currentUserId, so sánh lại để đảm bảo
  if (currentUserId && senderId && typeof item.me !== 'boolean') {
    const calculatedIsMe = String(senderId) === String(currentUserId);
    if (calculatedIsMe !== isMe) {
      console.warn('⚠️ Mismatch in me calculation:', {
        itemMe: item.me,
        calculatedIsMe,
        senderId,
        currentUserId
      });
      isMe = calculatedIsMe; // Ưu tiên tính toán từ senderId
    }
  }
  
  // Đảm bảo pending chỉ áp dụng cho message của chính mình
  const pending = isMe ? !!item.pending : false;
  
  return {
    id: item.id || item._id || `m-${Date.now()}-${Math.random()}`,
    conversationId: item.conversationId || null,
    message: item.message ?? item.content ?? item.text ?? "",
    createdDate: item.createdDate ?? item.timestamp ?? item.createdAt ?? new Date().toISOString(),
    me: isMe,
    sender: sender.userId ? {
      id: sender.userId,
      userId: sender.userId,
      username: sender.username || null,
      firstName: sender.firstName || null,
      lastName: sender.lastName || null,
      avatar: sender.avatar || null,
      role: sender.role || null,
      name: sender.firstName || sender.lastName 
        ? `${sender.firstName || ''} ${sender.lastName || ''}`.trim() 
        : sender.username || null,
    } : (isMe ? null : { 
      id: senderId,
      userId: senderId,
      avatar: item.senderAvatar || item.avatar || null,
      name: item.senderName || null,
      username: null,
    }),
    pending: pending,
    failed: isMe ? !!item.failed : false,
  };
};


// ---------- Component ----------
export default function ChatPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
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
  const [messagesPageMap, setMessagesPageMap] = useState({}); // Track pagination per conversation
  const [messagesTotalPagesMap, setMessagesTotalPagesMap] = useState({});
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState({});
  const [loadingMoreMessages, setLoadingMoreMessages] = useState({});
  const [wsConnected, setWsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState({}); // Map<conversationId, Set<userId>>
  const [messageMenuAnchor, setMessageMenuAnchor] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editMessageText, setEditMessageText] = useState("");
  const [conversationInfoOpen, setConversationInfoOpen] = useState(false);
  const [addMembersDialogOpen, setAddMembersDialogOpen] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const messageContainerRef = useRef(null);
  const typingTimeoutRef = useRef({});

  // mounted guard to avoid setState on unmounted component
  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
      setTimeout(() => {
        if (messageContainerRef.current) {
          messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
      }, 100);
      setTimeout(() => {
        if (messageContainerRef.current) {
          messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
      }, 300);
    }
  }, []);

  // New chat popover handlers
  const handleNewChatClick = (event) => {
    setNewChatAnchorEl(event.currentTarget);
  };
  const handleCloseNewChat = () => {
    setNewChatAnchorEl(null);
  };

  // When user chooses from CreateChatPopover: create or select conversation
  const handleSelectNewChatUser = async (selectedUser) => {
    // normalized { userId, displayName, avatar }
    const exists = conversations.find((c) => 
      c.participantId && String(c.participantId) === String(selectedUser.userId)
    );
    if (exists) {
      setSelectedConversation(exists);
      if (isMobile) setShowChatOnMobile(true);
      handleCloseNewChat();
      return;
    }

    try {
      // Validate userId
      if (!selectedUser.userId) {
        setError("Không tìm thấy ID người dùng. Vui lòng thử lại.");
        handleCloseNewChat();
        return;
      }

      // Create conversation with participantIds array (backend expects typeConversation and participantIds)
      const response = await createConversation({
        typeConversation: 'DIRECT',
        participantIds: [String(selectedUser.userId).trim()],
      });
      
      const conversationData = response.data?.result || response.data;
      
      if (!conversationData) {
        setError("Không thể tạo cuộc trò chuyện. Dữ liệu trả về không hợp lệ.");
        handleCloseNewChat();
        return;
      }

      const newConversation = normalizeConversation(conversationData, currentUserId);
      
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
        setError("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
        handleCloseNewChat();
        return;
      }

      const status = err.response.status;
      const errorData = err.response.data || {};
      
      // Extract error message from various possible fields
      const errorMessage = errorData.message 
        || errorData.error 
        || errorData.msg
        || errorData.errors?.[0]?.message
        || (typeof errorData.errors === 'string' ? errorData.errors : null)
        || errorData.details;

      if (status === 400) {
        // Bad Request - extract detailed error message
        let detailedMsg = errorMessage;
        
        // Try to extract from errors array or object
        if (errorData.errors) {
          if (Array.isArray(errorData.errors)) {
            const msgs = errorData.errors
              .map(e => e.message || e.field || e)
              .filter(Boolean);
            if (msgs.length > 0) {
              detailedMsg = msgs.join(', ');
            }
          } else if (typeof errorData.errors === 'object') {
            const msgs = Object.entries(errorData.errors)
              .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
              .filter(Boolean);
            if (msgs.length > 0) {
              detailedMsg = msgs.join('; ');
            }
          } else if (typeof errorData.errors === 'string') {
            detailedMsg = errorData.errors;
          }
        }
        
        // Fallback message
        if (!detailedMsg) {
          detailedMsg = "Yêu cầu không hợp lệ. Vui lòng kiểm tra lại thông tin người dùng.";
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
        setError(errorMessage || "Không thể tạo cuộc trò chuyện. Vui lòng thử lại.");
      }
      
      handleCloseNewChat();
    }
  };

  // Fetch conversations from API
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
        .map(conv => normalizeConversation(conv, currentUserId))
        .filter(conv => conv !== null);
      setConversations(normalizedConversations);
    } catch (err) {
      if (!mountedRef.current) return;
      
      if (!err || !err.response) {
        setError("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
        return;
      }

      const status = err.response.status;
      const errorData = err.response.data || {};
      const errorMessage = errorData.message || errorData.error || errorData.msg;

      if (status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else if (status === 403) {
        setError("Bạn không có quyền xem danh sách cuộc trò chuyện.");
      } else if (status === 404) {
        // No conversations yet, not an error
        setConversations([]);
        setError(null);
      } else if (status === 500) {
        setError("Lỗi server. Vui lòng thử lại sau.");
      } else {
        setError(errorMessage || "Không thể tải danh sách cuộc trò chuyện. Vui lòng thử lại.");
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Subscribe to all conversations for real-time updates when WebSocket is connected
  useEffect(() => {
    if (!websocketService || !websocketService.getConnectionState() || conversations.length === 0) {
      return;
    }

    console.log('📡 Subscribing to all conversations for real-time updates');

    // Subscribe to all conversations
    conversations.forEach((conv) => {
      try {
        websocketService.subscribeToMessages(conv.id, (messageData) => {
          if (!mountedRef.current) return;

          console.log('📨 Received message via WebSocket for conversation:', conv.id, messageData);

          const normalizedMessage = normalizeMessage(messageData, currentUserId);
          if (!normalizedMessage) return;

          setMessagesMap((prev) => {
            const existing = prev[conv.id] || [];
            const exists = existing.some(m => m.id === normalizedMessage.id);
            if (exists) {
              // Update existing message to clear pending state if it's our message
              if (normalizedMessage.me) {
                return {
                  ...prev,
                  [conv.id]: existing.map(m => 
                    m.id === normalizedMessage.id 
                      ? { ...m, pending: false, failed: false, me: true }
                      : m
                  ),
                };
              }
              return prev;
            }

            // If this is our own message, remove any pending/temp messages
            if (normalizedMessage.me) {
              const filtered = existing.filter(m => 
                !m.id.startsWith('temp-') && 
                !(m.me && m.pending)
              );
              const serverMessage = { ...normalizedMessage, pending: false, failed: false };
              return {
                ...prev,
                [conv.id]: [...filtered, serverMessage].sort((a, b) =>
                  new Date(a.createdDate) - new Date(b.createdDate)
                ),
              };
            }

            // For messages from others, never pending
            const otherMessage = { ...normalizedMessage, pending: false, me: false };
            return {
              ...prev,
              [conv.id]: [...existing, otherMessage].sort((a, b) =>
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
                    unread: normalizedMessage.me ? 0 : (c.unread || 0) + 1,
                  }
                : c
            )
          );

          if (selectedConversation?.id === conv.id) {
            scrollToBottom();
          }
        });
        
        // Subscribe to typing indicators for all conversations
        websocketService.subscribeToTyping(conv.id, (typingData) => {
          if (!mountedRef.current) return;
          
          const userId = typingData.userId;
          if (!userId || String(userId) === String(currentUserId)) return;
          
          setTypingUsers((prev) => {
            const current = prev[conv.id] || new Set();
            const updated = new Set(current);
            
            if (typingData.isTyping) {
              updated.add(userId);
            } else {
              updated.delete(userId);
            }
            
            return {
              ...prev,
              [conv.id]: updated,
            };
          });
        });
      } catch (error) {
        console.error(`Error subscribing to conversation ${conv.id}:`, error);
      }
    });

    // Cleanup: unsubscribe when conversations change
    return () => {
      conversations.forEach((conv) => {
        try {
          websocketService.unsubscribeFromMessages(conv.id);
        } catch (error) {
          console.error(`Error unsubscribing from conversation ${conv.id}:`, error);
        }
      });
    };
  }, [conversations, currentUserId, selectedConversation, scrollToBottom]);

  // WebSocket connection and subscription management
  useEffect(() => {
    if (!currentUserId) return;

    try {
      // Track connection state
      const handleConnectionChange = (connected) => {
        if (mountedRef.current) {
          setWsConnected(connected);
          
          // When WebSocket reconnects, subscribe to all conversations
          if (connected && conversations.length > 0) {
            conversations.forEach((conv) => {
              if (websocketService && websocketService.getConnectionState()) {
                try {
                  // Subscribe to messages
                  websocketService.subscribeToMessages(conv.id, (messageData) => {
                    if (!mountedRef.current) return;

                    const normalizedMessage = normalizeMessage(messageData, currentUserId);
                    if (!normalizedMessage) return;

                    setMessagesMap((prev) => {
                      const existing = prev[conv.id] || [];
                      const exists = existing.some(m => m.id === normalizedMessage.id);
                      if (exists) {
                        return prev;
                      }

                      // If this is our own message, replace any optimistic/temp/pending messages
                      if (normalizedMessage.me) {
                        const filtered = existing.filter(m => 
                          !m.id.startsWith('temp-') && 
                          m.id !== normalizedMessage.id &&
                          !(m.me && m.pending)
                        );
                        const serverMessage = { ...normalizedMessage, pending: false, failed: false };
                        return {
                          ...prev,
                          [conv.id]: [...filtered, serverMessage].sort((a, b) =>
                            new Date(a.createdDate) - new Date(b.createdDate)
                          ),
                        };
                      }

                      // For messages from others, never pending
                      const otherMessage = { ...normalizedMessage, pending: false, me: false };
                      return {
                        ...prev,
                        [conv.id]: [...existing, otherMessage].sort((a, b) =>
                          new Date(a.createdDate) - new Date(b.createdDate)
                        ),
                      };
                    });
                    
                  // Subscribe to typing indicators
                  websocketService.subscribeToTyping(conv.id, (typingData) => {
                    if (!mountedRef.current) return;
                    
                    const userId = typingData.userId;
                    if (!userId || String(userId) === String(currentUserId)) return;
                    
                    setTypingUsers((prev) => {
                      const current = prev[conv.id] || new Set();
                      const updated = new Set(current);
                      
                      if (typingData.isTyping) {
                        updated.add(userId);
                      } else {
                        updated.delete(userId);
                      }
                      
                      return {
                        ...prev,
                        [conv.id]: updated,
                      };
                    });
                  });

                    setConversations((prev) =>
                      prev.map((c) =>
                        c.id === conv.id
                          ? {
                              ...c,
                              lastMessage: normalizedMessage.message,
                              modifiedDate: normalizedMessage.createdDate,
                              lastTimestamp: normalizedMessage.createdDate,
                              unread: normalizedMessage.me ? 0 : (c.unread || 0) + 1,
                            }
                          : c
                      )
                    );

                    if (selectedConversation?.id === conv.id) {
                      scrollToBottom();
                    }
                  });
                } catch (error) {
                  console.error(`Error subscribing to conversation ${conv.id}:`, error);
                }
              }
            });
          }
        }
      };

      if (websocketService && typeof websocketService.onConnectionChange === 'function') {
        websocketService.onConnectionChange(handleConnectionChange);

        // Connect WebSocket
        websocketService.connect(
          () => {
            console.log('✅ WebSocket connected successfully');
          },
          (error) => {
            console.error('❌ WebSocket connection error:', error);
          }
        );
      }

      // Cleanup on unmount
      return () => {
        if (websocketService && typeof websocketService.offConnectionChange === 'function') {
          websocketService.offConnectionChange(handleConnectionChange);
        }
        if (websocketService && typeof websocketService.disconnect === 'function') {
          websocketService.disconnect();
        }
      };
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
    }
  }, [currentUserId, conversations, selectedConversation, scrollToBottom]);

  // Subscribe to messages when conversation is selected
  useEffect(() => {
    if (!selectedConversation?.id || !websocketService || typeof websocketService.getConnectionState !== 'function') {
      return;
    }

    const conversationId = selectedConversation.id;

    // Function to handle incoming messages
    const handleIncomingMessage = (messageData) => {
      if (!mountedRef.current) return;

      console.log('📨 Received message via WebSocket for conversation:', conversationId, messageData);

      // Normalize the incoming message
      const normalizedMessage = normalizeMessage(messageData, currentUserId);
      if (!normalizedMessage) {
        console.warn('⚠️ Failed to normalize message:', messageData);
        return;
      }

      // Add message to the conversation
      setMessagesMap((prev) => {
        const existing = prev[conversationId] || [];
        
        // Check if message already exists (avoid duplicates)
        const exists = existing.some(m => m.id === normalizedMessage.id);
        if (exists) {
          console.log('⚠️ Duplicate message ignored, updating pending state:', normalizedMessage.id);
          // Update existing message to clear pending state if it's our message
          if (normalizedMessage.me) {
            return {
              ...prev,
              [conversationId]: existing.map(m => 
                m.id === normalizedMessage.id 
                  ? { ...m, pending: false, failed: false, ...normalizedMessage }
                  : m
              ),
            };
          }
          return prev;
        }

        // If this is our own message (me: true), replace any optimistic/temp/pending messages
        if (normalizedMessage.me) {
          // Remove all temp messages and pending messages
          const filtered = existing.filter(m => 
            !m.id.startsWith('temp-') && 
            m.id !== normalizedMessage.id &&
            !(m.me && m.pending)
          );
          console.log('✅ Replacing optimistic message with server message:', normalizedMessage.id);
          // Ensure pending is false for server message
          const serverMessage = { ...normalizedMessage, pending: false, failed: false };
          const updated = [...filtered, serverMessage].sort((a, b) =>
            new Date(a.createdDate) - new Date(b.createdDate)
          );
          return {
            ...prev,
            [conversationId]: updated,
          };
        }

        // For messages from others, just add them (never pending)
        console.log('✅ Adding new message from other user to conversation:', conversationId);
        const otherMessage = { ...normalizedMessage, pending: false, me: false };
        const updated = [...existing, otherMessage].sort((a, b) =>
          new Date(a.createdDate) - new Date(b.createdDate)
        );
        return {
          ...prev,
          [conversationId]: updated,
        };
      });

      // Update conversation list with last message
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                lastMessage: normalizedMessage.message,
                modifiedDate: normalizedMessage.createdDate,
                lastTimestamp: normalizedMessage.createdDate,
                unread: normalizedMessage.me ? 0 : (conv.unread || 0) + 1,
              }
            : conv
        )
      );

      // Scroll to bottom when new message arrives
      setTimeout(() => scrollToBottom(), 100);
    };

    // Subscribe if WebSocket is connected
    let unsubscribeMessages = null;
    let unsubscribeTyping = null;
    
    if (websocketService.getConnectionState()) {
      console.log('📡 Subscribing to conversation:', conversationId);
      unsubscribeMessages = websocketService.subscribeToMessages(conversationId, handleIncomingMessage);

      // Subscribe to typing indicators
      unsubscribeTyping = websocketService.subscribeToTyping(conversationId, (typingData) => {
      if (!mountedRef.current) return;

      console.log('⌨️ Received typing indicator:', typingData);

      const userId = typingData.userId;
      if (!userId || String(userId) === String(currentUserId)) {
        console.log('⚠️ Ignoring typing indicator from self or invalid userId');
        return;
      }

      setTypingUsers((prev) => {
        const current = prev[conversationId] || new Set();
        const updated = new Set(current);

        if (typingData.isTyping) {
          updated.add(userId);
          console.log('✅ User is typing:', userId);
        } else {
          updated.delete(userId);
          console.log('❌ User stopped typing:', userId);
        }

        return {
          ...prev,
          [conversationId]: updated,
        };
      });

      // Auto-clear typing indicator after 3 seconds if isTyping is true
      if (typingData.isTyping) {
        // Clear any existing timeout for this user
        const timeoutKey = `${conversationId}-${userId}`;
        if (typingTimeoutRef.current[timeoutKey]) {
          clearTimeout(typingTimeoutRef.current[timeoutKey]);
        }
        
        // Set new timeout to clear typing indicator
        typingTimeoutRef.current[timeoutKey] = setTimeout(() => {
          if (mountedRef.current) {
            setTypingUsers((prev) => {
              const current = prev[conversationId] || new Set();
              const updated = new Set(current);
              updated.delete(userId);
              console.log('⏱️ Auto-cleared typing indicator for user:', userId);
              return {
                ...prev,
                [conversationId]: updated,
              };
            });
          }
          delete typingTimeoutRef.current[timeoutKey];
        }, 3000);
      }
    });
    } else {
      console.warn('⚠️ WebSocket not connected, will subscribe when connected');
    }

    // Cleanup subscription when conversation changes or component unmounts
    return () => {
      if (unsubscribeMessages && websocketService) {
        websocketService.unsubscribeFromMessages(conversationId);
      }
      if (unsubscribeTyping && websocketService) {
        websocketService.unsubscribeFromTyping(conversationId);
      }
    };
  }, [selectedConversation, currentUserId, scrollToBottom, websocketService]);

  // Initialize selection when conversations arrive (only on desktop)
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation && !isMobile) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, selectedConversation, isMobile]);

  // Load messages when conversation selected
  useEffect(() => {
    let canceled = false;
    const fetchMessages = async (conversationId) => {
      if (!conversationId) return;
      
      setLoadingMessages(prev => ({ ...prev, [conversationId]: true }));
      
      try {
        const response = await getMessagesPaginated(conversationId, 1, 50);
        const responseData = response.data?.result || response.data;
        
        let messagesList = [];
        let totalPages = 1;
        let currentPage = 1;
        
        if (responseData?.data && Array.isArray(responseData.data)) {
          messagesList = responseData.data;
          totalPages = responseData.totalPages || 1;
          currentPage = responseData.currentPage || 1;
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
          .map(msg => normalizeMessage(msg, currentUserId))
          .filter(msg => msg !== null);
        
        setMessagesMap((prev) => ({
          ...prev,
          [conversationId]: normalizedMessages.sort((a, b) => 
            new Date(a.createdDate) - new Date(b.createdDate)
          ),
        }));
        
        setMessagesPageMap(prev => ({ ...prev, [conversationId]: 1 }));
        setMessagesTotalPagesMap(prev => ({ ...prev, [conversationId]: totalPages }));
        
        // Mark unread messages as read
        const unreadMessages = normalizedMessages.filter(msg => !msg.me);
        if (unreadMessages.length > 0) {
          // Mark all unread messages as read (batch operation)
          Promise.all(
            unreadMessages.slice(0, 10).map(msg => 
              markMessageAsRead(msg.id).catch(err => {
                console.error('Error marking message as read:', err);
                return null;
              })
            )
          );
        }
        
        // Update unread count
        try {
          const unreadResponse = await getUnreadCount(conversationId);
          const unreadCount = unreadResponse.data?.result || 0;
          setUnreadCounts(prev => ({ ...prev, [conversationId]: unreadCount }));
          
          // Update conversation unread count
          setConversations((prev) =>
            prev.map((conv) => (conv.id === conversationId ? { ...conv, unread: unreadCount } : conv))
          );
        } catch (err) {
          console.error('Error getting unread count:', err);
          // mark read locally
          setConversations((prev) =>
            prev.map((conv) => (conv.id === conversationId ? { ...conv, unread: 0 } : conv))
          );
        }
      } catch (err) {
        if (!canceled && mountedRef.current) {
          // Don't show error if it's 404 (no messages yet)
          if (err.response?.status === 404) {
            setMessagesMap((prev) => ({
              ...prev,
              [conversationId]: prev[conversationId] || [],
            }));
            return;
          }

          // Handle other errors
          if (!err || !err.response) {
            setError("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
          } else {
            const status = err.response.status;
            const errorData = err.response.data || {};
            const errorMessage = errorData.message || errorData.error || errorData.msg;

            if (status === 401) {
              setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            } else if (status === 403) {
              setError("Bạn không có quyền xem tin nhắn này.");
            } else if (status === 500) {
              setError("Lỗi server. Vui lòng thử lại sau.");
            } else {
              setError(errorMessage || "Không thể tải tin nhắn. Vui lòng thử lại.");
            }
          }

          // Initialize empty messages array
          setMessagesMap((prev) => ({
            ...prev,
            [conversationId]: prev[conversationId] || [],
          }));
        }
      } finally {
        if (!canceled && mountedRef.current) {
          setLoadingMessages(prev => ({ ...prev, [conversationId]: false }));
        }
      }
    };

    if (selectedConversation?.id) {
      fetchMessages(selectedConversation.id);
    }

    return () => {
      canceled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation, currentUserId]);

  const currentMessages = selectedConversation ? messagesMap[selectedConversation.id] || [] : [];

  // auto-scroll to bottom when messages change or conversation changes
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

  // Send message (optimistic UI) with proper replace of temp message
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

    // optimistic update (append)
    setMessagesMap((prev) => ({
      ...prev,
      [convId]: [...(prev[convId] || []), optimistic],
    }));

    // update last message in conversation list
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

    // Try to send via WebSocket first, fallback to REST API
    let useWebSocket = false;
    if (websocketService && typeof websocketService.getConnectionState === 'function') {
      useWebSocket = websocketService.getConnectionState();
    }
    
    if (useWebSocket && websocketService && typeof websocketService.sendMessage === 'function') {
      try {
        console.log('📤 Sending message via WebSocket:', { convId, messageText });
        // Send via WebSocket
        websocketService.sendMessage(convId, messageText);
        
        // WebSocket will broadcast the message back to all subscribers including sender
        // The optimistic message will be replaced when we receive the server message via subscription
        // Set a timeout to clear pending if no response after 5 seconds
        setTimeout(() => {
          if (mountedRef.current) {
            setMessagesMap((prev) => {
              const existing = prev[convId] || [];
              const hasPending = existing.some(m => m.id === tempId && m.pending);
              if (hasPending) {
                console.warn('⚠️ No WebSocket response after 5s, clearing pending state');
                return {
                  ...prev,
                  [convId]: existing.map(m => 
                    m.id === tempId ? { ...m, pending: false } : m
                  ),
                };
              }
              return prev;
            });
          }
        }, 5000);
      } catch (wsError) {
        console.error('❌ WebSocket send error, falling back to REST:', wsError);
        // Fall through to REST API fallback
        useWebSocket = false;
      }
    } else if (useWebSocket) {
      // WebSocket service not available, fallback to REST
      useWebSocket = false;
    }

    // Fallback to REST API if WebSocket is not available or failed
    if (!useWebSocket) {
      try {
        const response = await sendMessage(convId, messageText);
        if (!mountedRef.current) return;

        const serverMessageData = response.data?.result || response.data;
        const serverMessage = normalizeMessage(serverMessageData, currentUserId);
        
        if (!serverMessage) {
          console.error('Failed to normalize server message:', serverMessageData);
          // Remove temp message if normalization failed
          setMessagesMap((prev) => {
            const existing = prev[convId] || [];
            return { ...prev, [convId]: existing.filter((m) => m.id !== tempId) };
          });
          return;
        }

        // replace temp with server message (dedupe)
        setMessagesMap((prev) => {
          const existing = prev[convId] || [];
          const filtered = existing.filter((m) => m.id !== tempId);
          // Check if server message already exists (avoid duplicates)
          const exists = filtered.some(m => m.id === serverMessage.id);
          if (exists) {
            return { ...prev, [convId]: filtered };
          }
          return {
            ...prev,
            [convId]: [...filtered, serverMessage].sort((a, b) => 
              new Date(a.createdDate) - new Date(b.createdDate)
            ),
          };
        });
      } catch (err) {
        if (!mountedRef.current) return;
        
        // mark temp as failed
        setMessagesMap((prev) => {
          const updated = (prev[convId] || []).map((m) =>
            m.id === tempId ? { ...m, failed: true, pending: false } : m
          );
          return { ...prev, [convId]: updated };
        });
        
        // Handle error with proper message
        if (!err || !err.response) {
          setError("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
          return;
        }

        const status = err.response.status;
        const errorData = err.response.data || {};
        const errorMessage = errorData.message || errorData.error || errorData.msg;

        if (status === 401) {
          setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        } else if (status === 403) {
          setError("Bạn không có quyền gửi tin nhắn vào cuộc trò chuyện này.");
        } else if (status === 404) {
          setError("Cuộc trò chuyện không tồn tại.");
        } else if (status === 500) {
          setError("Lỗi server. Vui lòng thử lại sau.");
        } else {
          setError(errorMessage || "Không thể gửi tin nhắn. Vui lòng thử lại.");
        }
      }
    }
  };

  // Handler functions for new features
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
      const response = await updateMessage(editingMessage.id, editMessageText.trim());
      if (!mountedRef.current) return;

      const updatedMessageData = response.data?.result || response.data;
      const updatedMessage = normalizeMessage(updatedMessageData, currentUserId);
      
      if (!updatedMessage) {
        console.error('Failed to normalize updated message:', updatedMessageData);
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
      console.error('Error updating message:', err);
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
        [convId]: (prev[convId] || []).filter((m) => m.id !== selectedMessage.id),
      }));

      handleMessageMenuClose();
    } catch (err) {
      console.error('Error deleting message:', err);
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

    setLoadingMoreMessages(prev => ({ ...prev, [convId]: true }));

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
        .map(msg => normalizeMessage(msg, currentUserId))
        .filter(msg => msg !== null);

      // Save scroll position before adding new messages
      const container = messageContainerRef.current;
      const scrollHeightBefore = container?.scrollHeight || 0;
      const scrollTopBefore = container?.scrollTop || 0;

      setMessagesMap((prev) => {
        const existing = prev[convId] || [];
        const existingIds = new Set(existing.map(m => m.id));
        const uniqueNew = normalizedMessages.filter(m => !existingIds.has(m.id));
        
        return {
          ...prev,
          [convId]: [...uniqueNew, ...existing].sort((a, b) =>
            new Date(a.createdDate) - new Date(b.createdDate)
          ),
        };
      });

      setMessagesPageMap(prev => ({ ...prev, [convId]: nextPage }));
      setMessagesTotalPagesMap(prev => ({ ...prev, [convId]: totalPagesResponse }));

      // Restore scroll position after messages are added
      setTimeout(() => {
        if (container) {
          const scrollHeightAfter = container.scrollHeight;
          const scrollDiff = scrollHeightAfter - scrollHeightBefore;
          container.scrollTop = scrollTopBefore + scrollDiff;
        }
      }, 0);
    } catch (err) {
      console.error('Error loading more messages:', err);
    } finally {
      if (mountedRef.current) {
        setLoadingMoreMessages(prev => ({ ...prev, [convId]: false }));
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
      console.error('Error loading conversation detail:', err);
      setError("Không thể tải thông tin cuộc trò chuyện.");
    }
  };

  const handleConversationInfoClose = () => {
    setConversationInfoOpen(false);
    setConversationDetail(null);
  };

  const handleTyping = useCallback((e) => {
    if (!selectedConversation?.id || !currentUserId) return;

    const convId = selectedConversation.id;
    
    // Send typing indicator via WebSocket
    if (websocketService && typeof websocketService.sendTypingIndicator === 'function') {
      try {
        websocketService.sendTypingIndicator(convId, currentUserId, true);
      } catch (err) {
        console.error('Error sending typing indicator:', err);
      }
    }

    // Clear existing timeout
    if (typingTimeoutRef.current[convId]) {
      clearTimeout(typingTimeoutRef.current[convId]);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current[convId] = setTimeout(() => {
      if (websocketService && typeof websocketService.sendTypingIndicator === 'function') {
        try {
          websocketService.sendTypingIndicator(convId, currentUserId, false);
        } catch (err) {
          console.error('Error sending typing stop:', err);
        }
      }
    }, 3000);
  }, [selectedConversation, currentUserId]);

  // Calculate height based on screen size
  const cardHeight = isMobile 
    ? 'calc(100vh - 64px - 64px)' // subtract header and bottom nav
    : 'calc(100vh - 64px - 32px)'; // subtract header and padding

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
            width: { xs: '100%', md: 300 },
            borderRight: { xs: 0, md: 1 },
            borderColor: "divider",
            display: isMobile && showChatOnMobile ? 'none' : 'flex',
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
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
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
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress size={28} />
              </Box>
            ) : error ? (
              <Box sx={{ p: 2 }}>
                <Alert
                  severity="error"
                  sx={{ mb: 2 }}
                  action={
                    <IconButton color="inherit" size="small" onClick={fetchConversations}>
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  {error}
                </Alert>
              </Box>
            ) : conversations == null || conversations.length === 0 ? (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  Chưa có cuộc trò chuyện. Bấm nút + để bắt đầu.
                </Typography>
              </Box>
            ) : (
              <List sx={{ width: "100%" }}>
                {conversations.map((conversation) => (
                  <React.Fragment key={conversation.id}>
                    <ListItem
                      alignItems="flex-start"
                      onClick={() => handleConversationSelect(conversation)}
                      sx={(t) => ({
                        cursor: "pointer",
                        py: { xs: 1, sm: 1.5 },
                        px: { xs: 1.5, sm: 2 },
                        borderRadius: 1,
                        bgcolor: selectedConversation?.id === conversation.id 
                          ? "action.selected"
                          : "transparent",
                        transition: "all 0.2s ease",
                        "&:hover": { 
                          bgcolor: "action.hover",
                        },
                      })}
                    >
                      <ListItemAvatar>
                        <Badge color="error" badgeContent={conversation.unread} invisible={conversation.unread === 0} overlap="circular">
                          <Avatar 
                            src={conversation.conversationAvatar || ""} 
                            sx={{ width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 } }}
                          />
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Stack direction="row" display={"flex"} justifyContent="space-between" alignItems="center">
                            <Typography 
                              component="span" 
                              variant="body2" 
                              color="text.primary" 
                              noWrap 
                              sx={{ 
                                display: "inline",
                                fontSize: { xs: '0.875rem', sm: '0.875rem' }
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
                                fontSize: { xs: '0.65rem', sm: '0.7rem' },
                                ml: 1
                              }}
                            >
                              {new Date(conversation.modifiedDate).toLocaleString("vi-VN", { year: "numeric", month: "numeric", day: "numeric" })}
                            </Typography>
                          </Stack>
                        }
                        secondary={
                          <Typography 
                            sx={{ display: "inline", fontSize: { xs: '0.8rem', sm: '0.875rem' } }} 
                            component="span" 
                            variant="body2" 
                            color="text.primary" 
                            noWrap
                          >
                            {conversation.lastMessage || "Start a conversation"}
                          </Typography>
                        }
                        primaryTypographyProps={{ fontWeight: conversation.unread > 0 ? "bold" : "normal" }}
                        sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", pr: 1 }}
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
            display: isMobile && !showChatOnMobile ? 'none' : 'flex',
            flexDirection: "column",
            minHeight: 0,
            width: isMobile ? '100%' : 'auto',
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
                <Tooltip title={wsConnected ? 'Online' : 'Offline'}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                    sx={{
                      '& .MuiBadge-badge': {
                        backgroundColor: wsConnected ? 'success.main' : 'error.main',
                        color: wsConnected ? 'success.main' : 'error.main',
                        boxShadow: (t) => `0 0 0 2px ${t.palette.mode === 'dark' ? t.palette.background.paper : '#fff'}`,
                        width: 8,
                        height: 8,
                        minWidth: 8,
                        animation: wsConnected ? 'none' : 'pulse 2s infinite',
                        '@keyframes pulse': {
                          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                          '50%': { opacity: 0.7, transform: 'scale(1.1)' },
                        },
                      },
                    }}
                  >
                    <Avatar 
                      src={selectedConversation.conversationAvatar} 
                      sx={{ 
                        mr: { xs: 1.5, sm: 2 },
                        width: { xs: 36, sm: 40 },
                        height: { xs: 36, sm: 40 }
                      }} 
                    />
                  </Badge>
                </Tooltip>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    fontWeight: 600,
                  }}
                >
                  {selectedConversation.conversationName}
                </Typography>
                <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
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
                  // Load more when scrolled to top
                  if (container.scrollTop < 100 && selectedConversation?.id) {
                    const convId = selectedConversation.id;
                    const currentPage = messagesPageMap[convId] || 1;
                    const totalPages = messagesTotalPagesMap[convId] || 1;
                    
                    if (currentPage < totalPages && !loadingMoreMessages[convId]) {
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
                    background: (t) => t.palette.mode === "dark" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
                    borderRadius: "4px",
                    "&:hover": {
                      background: (t) => t.palette.mode === "dark" ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)",
                    },
                  },
                }}
              >
                {loadingMessages[selectedConversation.id] && currentMessages.length === 0 ? (
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
                    <CircularProgress size={32} />
                  </Box>
                ) : (
                <Box sx={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  width: "100%",
                  justifyContent: "flex-end",
                  minHeight: "100%",
                }}>
                  {/* Load More Indicator */}
                  {selectedConversation?.id && 
                   (messagesPageMap[selectedConversation.id] || 1) < (messagesTotalPagesMap[selectedConversation.id] || 1) && (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 1, flexShrink: 0 }}>
                      {loadingMoreMessages[selectedConversation.id] ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <CircularProgress size={16} />
                          <Typography variant="caption" color="text.secondary">
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
                  
                  {/* Typing Indicator */}
                  {selectedConversation?.id && typingUsers[selectedConversation.id]?.size > 0 && (
                    <Box sx={{ px: 2, py: 1, display: "flex", alignItems: "center", gap: 1 }}>
                      <CircularProgress size={16} />
                      <Typography variant="caption" color="text.secondary">
                        {(() => {
                          const typingSet = typingUsers[selectedConversation.id];
                          if (!typingSet || typingSet.size === 0) return '';
                          
                          const typingArray = Array.from(typingSet);
                          const names = typingArray.map((userId) => {
                            const participant = conversationDetail?.participants?.find(p => 
                              String(p.userId) === String(userId)
                            ) || selectedConversation?.participants?.find(p => 
                              String(p.userId) === String(userId)
                            );
                            if (participant) {
                              const fullName = `${participant.lastName || ''} ${participant.firstName || ''}`.trim();
                              return fullName || participant.username || 'Someone';
                            }
                            return 'Someone';
                          });
                          
                          if (names.length === 1) {
                            return `${names[0]} đang gõ...`;
                          } else if (names.length === 2) {
                            return `${names[0]} và ${names[1]} đang gõ...`;
                          } else {
                            return `${names.slice(0, -1).join(', ')} và ${names[names.length - 1]} đang gõ...`;
                          }
                        })()}
                      </Typography>
                    </Box>
                  )}
                  
                  {currentMessages.map((msg) => {
                    // Debug: log message info in dev mode
                    if (import.meta.env.DEV && msg.id === currentMessages[0]?.id) {
                      console.log('🔍 Rendering message:', {
                        id: msg.id,
                        me: msg.me,
                        senderId: msg.sender?.userId,
                        currentUserId,
                        message: msg.message?.substring(0, 20)
                      });
                    }
                    
                    return (
                    <Box 
                      key={msg.id} 
                      sx={{ 
                        display: "flex", 
                        justifyContent: msg.me ? "flex-end" : "flex-start", 
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
                            display: { xs: 'none', sm: 'flex' }
                          }} 
                        />
                      )}
                      <Box sx={{ position: 'relative', maxWidth: { xs: '85%', sm: '75%', md: '65%' } }}>
                        {editingMessage?.id === msg.id ? (
                          <Paper
                            elevation={2}
                            sx={(t) => ({
                              p: { xs: 1.5, sm: 2 },
                              backgroundColor: t.palette.mode === "dark" ? "rgba(255, 243, 205, 0.1)" : "#fff3cd",
                              borderRadius: 3,
                            })}
                          >
                            <TextField
                              fullWidth
                              multiline
                              value={editMessageText}
                              onChange={(e) => setEditMessageText(e.target.value)}
                              size="small"
                              autoFocus
                              sx={{ mb: 1 }}
                            />
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button size="small" onClick={handleCancelEdit}>
                                Hủy
                              </Button>
                              <Button size="small" variant="contained" onClick={handleSaveEditMessage}>
                                Lưu
                              </Button>
                            </Stack>
                          </Paper>
                        ) : (
                          <>
                            <Paper
                              elevation={0}
                              onContextMenu={(e) => msg.me && handleMessageMenuOpen(e, msg)}
                              sx={(t) => ({
                                p: { xs: 1.25, sm: 1.5 },
                                backgroundColor: msg.me 
                                  ? (msg.failed 
                                    ? t.palette.error.light 
                                    : t.palette.mode === "dark" 
                                      ? "rgba(25, 118, 210, 0.3)"
                                      : "rgba(25, 118, 210, 0.15)")
                                  : (t.palette.mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)"),
                                borderRadius: msg.me ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                                opacity: msg.pending ? 0.7 : 1,
                                cursor: msg.me ? 'context-menu' : 'default',
                                color: msg.me ? t.palette.text.primary : t.palette.text.primary,
                                transition: "all 0.2s ease",
                                "&:hover": msg.me ? {
                                  boxShadow: t.shadows[2],
                                } : {},
                              })}
                            >
                              <Typography 
                                variant="body1" 
                                sx={{ 
                                  fontSize: { xs: '0.875rem', sm: '0.9375rem' },
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
                                      fontSize: { xs: '0.65rem', sm: '0.7rem' },
                                      color: "error.main"
                                    }}
                                  >
                                    Gửi thất bại
                                  </Typography>
                                )}
                                {msg.me && msg.pending && (
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      fontSize: { xs: '0.65rem', sm: '0.7rem' },
                                      color: "text.secondary"
                                    }}
                                  >
                                    Đang gửi...
                                  </Typography>
                                )}
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    fontSize: { xs: '0.65rem', sm: '0.7rem' },
                                    color: "text.secondary",
                                    ml: 0.5,
                                  }}
                                >
                                  {new Date(msg.createdDate).toLocaleTimeString('vi-VN', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </Typography>
                              </Stack>
                            </Paper>
                            {msg.me && (
                              <IconButton
                                size="small"
                                sx={{
                                  position: 'absolute',
                                  top: 0,
                                  right: -36,
                                  opacity: 0,
                                  transition: "opacity 0.2s ease",
                                  '&:hover': { opacity: 1 },
                                }}
                                onClick={(e) => handleMessageMenuOpen(e, msg)}
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
                            display: { xs: 'none', sm: 'flex' }
                          }}
                        >
                          {user?.username?.charAt(0)?.toUpperCase() || "Y"}
                        </Avatar>
                      )}
                    </Box>
                    );
                  })}
                </Box>
                )}
              </Box>

              {/* Message Input Form - Always at bottom */}
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
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
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
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  size="small"
                  multiline
                  maxRows={4}
                  sx={{
                    '& .MuiInputBase-input': {
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }
                  }}
                />
                <IconButton 
                  color="primary" 
                  onClick={handleSendMessage} 
                  disabled={!message.trim()}
                  size={isSmallScreen ? "small" : "medium"}
                >
                  <SendIcon fontSize={isSmallScreen ? "small" : "medium"} />
                </IconButton>
              </Box>
            </>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%", p: 3 }}>
              <Typography 
                variant="h6" 
                color="text.secondary" 
                sx={{ 
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                  textAlign: 'center'
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
        <MenuItem onClick={handleDeleteMessage} sx={{ color: 'error.main' }}>
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
            <Avatar src={conversationDetail?.conversationAvatar || selectedConversation?.conversationAvatar} />
            <Box>
              <Typography variant="h6">{conversationDetail?.conversationName || selectedConversation?.conversationName}</Typography>
              <Chip 
                label={conversationDetail?.typeConversation || selectedConversation?.typeConversation || 'DIRECT'} 
                size="small" 
                sx={{ mt: 0.5 }}
              />
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {conversationDetail && (
            <Box>
              {/* Participants List */}
              <Typography variant="subtitle2" sx={{ mb: 1, mt: 2 }}>
                Participants ({conversationDetail.participants?.length || 0})
              </Typography>
              <List>
                {conversationDetail.participants?.map((participant) => (
                  <ListItem key={participant.userId}>
                    <ListItemAvatar>
                      <Avatar src={participant.avatar} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${participant.lastName || ''} ${participant.firstName || ''}`.trim() || participant.username}
                      secondary={participant.username}
                    />
                    {selectedConversation?.typeConversation === 'GROUP' && 
                     String(participant.userId) !== String(currentUserId) && (
                      <IconButton
                        size="small"
                        onClick={async () => {
                          try {
                            await removeParticipant(selectedConversation.id, participant.userId);
                            // Refresh conversation detail
                            const response = await getConversationDetail(selectedConversation.id);
                            setConversationDetail(response.data?.result || response.data);
                            // Refresh conversations list
                            fetchConversations();
                          } catch (err) {
                            console.error('Error removing participant:', err);
                            setError("Không thể xóa thành viên. Vui lòng thử lại.");
                          }
                        }}
                      >
                        <PersonRemoveIcon fontSize="small" />
                      </IconButton>
                    )}
                  </ListItem>
                ))}
              </List>

              {/* Actions for GROUP */}
              {selectedConversation?.typeConversation === 'GROUP' && (
                <Box sx={{ mt: 3 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<GroupAddIcon />}
                    onClick={() => {
                      setAddMembersDialogOpen(true);
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
                      if (window.confirm("Bạn có chắc chắn muốn rời khỏi nhóm này?")) {
                        try {
                          await leaveConversation(selectedConversation.id);
                          handleConversationInfoClose();
                          setSelectedConversation(null);
                          fetchConversations();
                        } catch (err) {
                          console.error('Error leaving conversation:', err);
                          setError("Không thể rời khỏi nhóm. Vui lòng thử lại.");
                        }
                      }
                    }}
                  >
                    Leave Group
                  </Button>
                </Box>
              )}

              {/* Actions for DIRECT */}
              {selectedConversation?.typeConversation === 'DIRECT' && (
                <Box sx={{ mt: 3 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={async () => {
                      if (window.confirm("Bạn có chắc chắn muốn xóa cuộc trò chuyện này?")) {
                        try {
                          await deleteConversation(selectedConversation.id);
                          handleConversationInfoClose();
                          setSelectedConversation(null);
                          fetchConversations();
                        } catch (err) {
                          console.error('Error deleting conversation:', err);
                          setError("Không thể xóa cuộc trò chuyện. Vui lòng thử lại.");
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

      {/* Add Members Dialog */}
      <AddMembersDialog
        open={addMembersDialogOpen}
        onClose={() => setAddMembersDialogOpen(false)}
        onAddMembers={async (participantIds) => {
          if (!selectedConversation?.id) return;
          
          try {
            await addParticipants(selectedConversation.id, participantIds);
            // Refresh conversation detail
            const response = await getConversationDetail(selectedConversation.id);
            setConversationDetail(response.data?.result || response.data);
            // Refresh conversations list
            fetchConversations();
            // Update selected conversation
            if (response.data?.result || response.data) {
              const updated = normalizeConversation(response.data?.result || response.data, currentUserId);
              if (updated) {
                setSelectedConversation(updated);
              }
            }
          } catch (err) {
            console.error('Error adding participants:', err);
            const errorData = err.response?.data || {};
            const errorMessage = errorData.message || errorData.error || errorData.msg;
            setError(errorMessage || "Không thể thêm thành viên. Vui lòng thử lại.");
          }
        }}
        existingParticipantIds={
          conversationDetail?.participants?.map(p => p.userId) || 
          selectedConversation?.participants?.map(p => p.userId) || 
          []
        }
      />
    </PageLayout>
  );
}
