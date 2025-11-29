import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Badge,
  IconButton,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  CircularProgress,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Send as SendIcon,
  Add as AddIcon,
  GroupAdd as GroupAddIcon,
  MoreVert as MoreVertIcon,
  Close as CloseIcon,
  PersonAdd as PersonAddIcon,
  Delete as DeleteIcon,
  ExitToApp as ExitToAppIcon,
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { useUser } from '../contexts/UserContext';
import {
  getConversations,
  getMessagesPaginated,
  createConversation,
  addParticipants,
  removeParticipant,
  leaveConversation,
  deleteConversation,
  getUnreadCount,
  markMessageAsRead,
} from '../services/chatService';
import { websocketService } from '../services/websocketService';
import CreateChatPopover from './CreateChatPopover';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

export default function ChatWidget() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { user: currentUser } = useUser();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [newChatAnchorEl, setNewChatAnchorEl] = useState(null);
  const [createGroupDialog, setCreateGroupDialog] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupParticipants, setGroupParticipants] = useState([]);
  const [addParticipantDialog, setAddParticipantDialog] = useState(false);
  const [addParticipantAnchorEl, setAddParticipantAnchorEl] = useState(null);
  const [conversationMenuAnchor, setConversationMenuAnchor] = useState(null);
  const [selectedConversationForMenu, setSelectedConversationForMenu] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef({});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getConversations();
      if (response?.data?.result) {
        const convs = Array.isArray(response.data.result) 
          ? response.data.result 
          : response.data.result.items || response.data.result.content || [];
        setConversations(convs.slice(0, 5));
        
        const counts = {};
        for (const conv of convs) {
          if (conv.id) {
            try {
              const unreadRes = await getUnreadCount(conv.id);
              if (unreadRes?.data?.result !== undefined) {
                counts[conv.id] = unreadRes.data.result;
              }
            } catch (err) {
              console.error('Error loading unread count:', err);
            }
          }
        }
        setUnreadCounts(counts);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (conversationId) => {
    try {
      const response = await getMessagesPaginated(conversationId, 1, 50);
      if (response?.data?.result) {
        const data = response.data.result;
        const newMessages = Array.isArray(data.items) ? data.items : data.content || [];
        setMessages(newMessages.reverse());
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    const handleConnect = () => {
      setWsConnected(true);
      if (selectedConversation) {
        websocketService.subscribeToMessages(selectedConversation.id, handleNewMessage);
      }
    };

    const handleDisconnect = () => {
      setWsConnected(false);
    };

    websocketService.connect(handleConnect, (error) => {
      console.error('WebSocket error:', error);
      setWsConnected(false);
    });

    websocketService.onConnectionChange(setWsConnected);

    return () => {
      websocketService.offConnectionChange(setWsConnected);
      if (selectedConversation) {
        websocketService.unsubscribeFromMessages(selectedConversation.id);
      }
    };
  }, [selectedConversation]);

  const handleNewMessage = useCallback((message) => {
    setMessages(prev => {
      const exists = prev.find(m => m.id === message.id);
      if (exists) return prev;
      return [...prev, message];
    });
    setTimeout(scrollToBottom, 100);
    
    if (message.conversationId === selectedConversation?.id) {
      markMessageAsRead(message.id).catch(console.error);
      setUnreadCounts(prev => ({ ...prev, [message.conversationId]: 0 }));
    } else {
      setUnreadCounts(prev => ({
        ...prev,
        [message.conversationId]: (prev[message.conversationId] || 0) + 1
      }));
    }
    loadConversations();
  }, [selectedConversation, loadConversations]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || !wsConnected) return;

    try {
      websocketService.sendMessage(selectedConversation.id, messageInput.trim());
      setMessageInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    setChatDialogOpen(true);
    
    if (wsConnected) {
      websocketService.unsubscribeFromMessages(conversation.id);
      websocketService.subscribeToMessages(conversation.id, handleNewMessage);
    }
    
    await loadMessages(conversation.id);
    
    const unreadRes = await getUnreadCount(conversation.id);
    if (unreadRes?.data?.result) {
      setUnreadCounts(prev => ({ ...prev, [conversation.id]: 0 }));
    }
  };

  const handleCreateDirectChat = async (selectedUser) => {
    try {
      const response = await createConversation({
        typeConversation: 'DIRECT',
        participantIds: [selectedUser.userId]
      });
      
      if (response?.data?.result) {
        const newConv = response.data.result;
        setConversations(prev => [newConv, ...prev.slice(0, 4)]);
        await handleSelectConversation(newConv);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || groupParticipants.length < 2) return;

    try {
      const participantIds = groupParticipants.map(p => p.userId);
      const response = await createConversation({
        typeConversation: 'GROUP',
        participantIds,
        conversationName: groupName.trim()
      });
      
      if (response?.data?.result) {
        const newConv = response.data.result;
        setConversations(prev => [newConv, ...prev.slice(0, 4)]);
        setCreateGroupDialog(false);
        setGroupName('');
        setGroupParticipants([]);
        await handleSelectConversation(newConv);
      }
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const handleLeaveConversation = async () => {
    if (!selectedConversation) return;

    try {
      await leaveConversation(selectedConversation.id);
      setSelectedConversation(null);
      setMessages([]);
      setChatDialogOpen(false);
      await loadConversations();
      setConversationMenuAnchor(null);
    } catch (error) {
      console.error('Error leaving conversation:', error);
    }
  };

  const handleDeleteConversation = async () => {
    if (!selectedConversation) return;

    try {
      await deleteConversation(selectedConversation.id);
      setSelectedConversation(null);
      setMessages([]);
      setChatDialogOpen(false);
      await loadConversations();
      setConversationMenuAnchor(null);
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const getConversationDisplayName = (conversation) => {
    if (conversation.typeConversation === 'GROUP') {
      return conversation.conversationName || 'Nhóm chat';
    }
    
    if (conversation.participants && conversation.participants.length > 0) {
      const otherParticipant = conversation.participants.find(
        p => (p.userId || p.id) !== (currentUser?.id || currentUser?.userId)
      );
      if (otherParticipant) {
        return otherParticipant.firstName && otherParticipant.lastName
          ? `${otherParticipant.lastName} ${otherParticipant.firstName}`.trim()
          : otherParticipant.firstName || otherParticipant.lastName || otherParticipant.username || 'Người dùng';
      }
    }
    return 'Cuộc trò chuyện';
  };

  const getConversationAvatar = (conversation) => {
    if (conversation.typeConversation === 'GROUP') {
      return conversation.conversationAvatar;
    }
    
    if (conversation.participants && conversation.participants.length > 0) {
      const otherParticipant = conversation.participants.find(
        p => (p.userId || p.id) !== (currentUser?.id || currentUser?.userId)
      );
      if (otherParticipant) {
        return otherParticipant.avatar || otherParticipant.avatarUrl;
      }
    }
    return null;
  };

  const getLastMessage = (conversation) => {
    if (conversation.lastMessage) {
      return conversation.lastMessage;
    }
    if (conversation.latestMessage) {
      return conversation.latestMessage.message || 'Chưa có tin nhắn';
    }
    return 'Chưa có tin nhắn';
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return dayjs(dateString).fromNow();
  };

  const formatMessageTime = (dateString) => {
    if (!dateString) return '';
    const date = dayjs(dateString);
    if (dayjs().diff(date, 'day') < 1) {
      return date.format('HH:mm');
    }
    return date.format('DD/MM/YYYY HH:mm');
  };

  const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + (count || 0), 0);

  return (
    <>
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
        <Box sx={{ display: "flex", alignItems: "center", mb: 2, justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <ChatIcon sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 16 }}>
              Tin nhắn
            </Typography>
            {totalUnread > 0 && (
              <Chip
                label={totalUnread}
                size="small"
                color="error"
                sx={{ ml: 1, height: 20, fontSize: 11, fontWeight: 600 }}
              />
            )}
          </Box>
          <Box>
            <Tooltip title="Tạo cuộc trò chuyện">
              <IconButton
                size="small"
                onClick={(e) => setNewChatAnchorEl(e.currentTarget)}
                sx={{ mr: 0.5 }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Tạo nhóm">
              <IconButton
                size="small"
                onClick={() => setCreateGroupDialog(true)}
              >
                <GroupAddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : conversations.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
            Chưa có cuộc trò chuyện nào
          </Typography>
        ) : (
          <List sx={{ p: 0 }}>
            {conversations.map((conv) => (
              <ListItem
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                sx={{
                  cursor: "pointer",
                  borderRadius: 2,
                  mb: 0.5,
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                <ListItemAvatar>
                  <Badge
                    badgeContent={unreadCounts[conv.id] || 0}
                    color="error"
                    invisible={!unreadCounts[conv.id]}
                  >
                    <Avatar
                      src={getConversationAvatar(conv)}
                      sx={{ width: 40, height: 40 }}
                    >
                      {getConversationDisplayName(conv).charAt(0).toUpperCase()}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: unreadCounts[conv.id] ? 700 : 600,
                        fontSize: 13,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {getConversationDisplayName(conv)}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontSize: 11,
                      }}
                    >
                      {getLastMessage(conv)}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}

        {!wsConnected && (
          <Box sx={{ mt: 1, p: 0.5, bgcolor: "warning.main", color: "warning.contrastText", borderRadius: 1 }}>
            <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5, fontSize: 10 }}>
              <CircularProgress size={10} />
              Đang kết nối...
            </Typography>
          </Box>
        )}
      </Paper>

      <Dialog
        open={chatDialogOpen}
        onClose={() => {
          setChatDialogOpen(false);
          setSelectedConversation(null);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            height: '80vh',
            maxHeight: 600,
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {selectedConversation && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
              <Avatar src={getConversationAvatar(selectedConversation)}>
                {getConversationDisplayName(selectedConversation).charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {getConversationDisplayName(selectedConversation)}
                </Typography>
                {selectedConversation.typeConversation === 'GROUP' && (
                  <Typography variant="caption" color="text.secondary">
                    {selectedConversation.participants?.length || 0} thành viên
                  </Typography>
                )}
              </Box>
              <IconButton
                onClick={(e) => {
                  setConversationMenuAnchor(e.currentTarget);
                  setSelectedConversationForMenu(selectedConversation);
                }}
                size="small"
              >
                <MoreVertIcon />
              </IconButton>
              <IconButton
                onClick={() => {
                  setChatDialogOpen(false);
                  setSelectedConversation(null);
                }}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {messages.map((message) => {
                const isMe = message.me || 
                  (message.sender?.userId || message.sender?.id) === (currentUser?.id || currentUser?.userId);
                
                return (
                  <Box
                    key={message.id}
                    sx={{
                      display: 'flex',
                      justifyContent: isMe ? 'flex-end' : 'flex-start',
                      mb: 1,
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: '70%',
                        bgcolor: isMe
                          ? theme.palette.primary.main
                          : isDark
                          ? alpha('#fff', 0.1)
                          : alpha('#000', 0.05),
                        color: isMe ? 'white' : 'text.primary',
                        p: 1.5,
                        borderRadius: 2,
                        wordBreak: 'break-word',
                      }}
                    >
                      {!isMe && (
                        <Typography variant="caption" sx={{ display: 'block', mb: 0.5, opacity: 0.8 }}>
                          {message.sender?.firstName && message.sender?.lastName
                            ? `${message.sender.lastName} ${message.sender.firstName}`.trim()
                            : message.sender?.firstName || message.sender?.lastName || message.sender?.username || 'Người dùng'}
                        </Typography>
                      )}
                      <Typography variant="body2">{message.message}</Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          mt: 0.5,
                          opacity: 0.7,
                          fontSize: '0.7rem',
                        }}
                      >
                        {formatMessageTime(message.createdDate)}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
              <div ref={messagesEndRef} />
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 1, borderTop: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}` }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Nhập tin nhắn..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim() || !wsConnected}
                        color="primary"
                        size="small"
                      >
                        <SendIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </DialogActions>
          </>
        )}
      </Dialog>

      <CreateChatPopover
        anchorEl={newChatAnchorEl}
        open={Boolean(newChatAnchorEl)}
        onClose={() => setNewChatAnchorEl(null)}
        onSelectUser={handleCreateDirectChat}
      />

      <Dialog open={createGroupDialog} onClose={() => setCreateGroupDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tạo nhóm mới</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Tên nhóm"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Thành viên ({groupParticipants.length})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {groupParticipants.map((p) => (
                <Chip
                  key={p.userId}
                  label={p.displayName}
                  onDelete={() => setGroupParticipants(prev => prev.filter(x => x.userId !== p.userId))}
                  avatar={<Avatar src={p.avatar}>{p.displayName.charAt(0)}</Avatar>}
                />
              ))}
            </Box>
            <Button
              startIcon={<PersonAddIcon />}
              onClick={(e) => {
                setAddParticipantAnchorEl(e.currentTarget);
                setAddParticipantDialog(true);
              }}
              sx={{ mt: 1 }}
            >
              Thêm thành viên
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateGroupDialog(false)}>Hủy</Button>
          <Button
            onClick={handleCreateGroup}
            variant="contained"
            disabled={!groupName.trim() || groupParticipants.length < 2}
          >
            Tạo nhóm
          </Button>
        </DialogActions>
      </Dialog>

      <CreateChatPopover
        anchorEl={addParticipantAnchorEl}
        open={addParticipantDialog}
        onClose={() => {
          setAddParticipantDialog(false);
          setAddParticipantAnchorEl(null);
        }}
        onSelectUser={(user) => {
          setGroupParticipants(prev => {
            if (prev.find(p => p.userId === user.userId)) return prev;
            return [...prev, user];
          });
          setAddParticipantDialog(false);
          setAddParticipantAnchorEl(null);
        }}
      />

      <Menu
        anchorEl={conversationMenuAnchor}
        open={Boolean(conversationMenuAnchor)}
        onClose={() => {
          setConversationMenuAnchor(null);
          setSelectedConversationForMenu(null);
        }}
      >
        <MenuItem onClick={handleLeaveConversation}>
          <ExitToAppIcon sx={{ mr: 1 }} fontSize="small" />
          Rời khỏi cuộc trò chuyện
        </MenuItem>
        <MenuItem onClick={handleDeleteConversation} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Xóa cuộc trò chuyện
        </MenuItem>
      </Menu>
    </>
  );
}







