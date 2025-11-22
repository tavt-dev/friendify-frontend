import { API_ENDPOINTS } from '../config/apiConfig';
import { apiFetch } from './apiHelper';

/**
 * Get all conversations for current user
 */
export const getConversations = async () => {
  return apiFetch(API_ENDPOINTS.CHAT.CONVERSATIONS);
};

/**
 * Get conversation detail by ID
 * @param {string} conversationId - The conversation ID
 */
export const getConversationDetail = async (conversationId) => {
  const endpoint = API_ENDPOINTS.CHAT.CONVERSATION_DETAIL.replace(':id', conversationId);
  return apiFetch(endpoint);
};

/**
 * Get messages for a specific conversation (simple list)
 * @param {string} conversationId - The conversation ID
 */
export const getMessages = async (conversationId) => {
  return apiFetch(`${API_ENDPOINTS.CHAT.MESSAGES}?conversationId=${conversationId}`);
};

/**
 * Get messages for a specific conversation with pagination
 * @param {string} conversationId - The conversation ID
 * @param {number} page - Page number (default: 1)
 * @param {number} size - Page size (default: 50)
 */
export const getMessagesPaginated = async (conversationId, page = 1, size = 50) => {
  return apiFetch(`${API_ENDPOINTS.CHAT.MESSAGES_PAGINATED}?conversationId=${conversationId}&page=${page}&size=${size}`);
};

/**
 * Create a new message (REST API)
 * @param {string} conversationId - The conversation ID
 * @param {string} messageText - The message content
 */
export const createMessage = async (conversationId, messageText) => {
  return apiFetch(API_ENDPOINTS.CHAT.CREATE_MESSAGE, {
    method: 'POST',
    body: JSON.stringify({ 
      conversationId,
      message: messageText 
    }),
  });
};

/**
 * Send a message to a conversation (alias for createMessage for backward compatibility)
 * @param {string} conversationId - The conversation ID
 * @param {string} messageText - The message content
 */
export const sendMessage = async (conversationId, messageText) => {
  return createMessage(conversationId, messageText);
};

/**
 * Get message by ID
 * @param {string} messageId - The message ID
 */
export const getMessage = async (messageId) => {
  const endpoint = API_ENDPOINTS.CHAT.MESSAGE_DETAIL.replace(':id', messageId);
  return apiFetch(endpoint);
};

/**
 * Update a message
 * @param {string} messageId - The message ID
 * @param {string} messageText - The updated message content
 */
export const updateMessage = async (messageId, messageText) => {
  const endpoint = API_ENDPOINTS.CHAT.UPDATE_MESSAGE.replace(':id', messageId);
  return apiFetch(endpoint, {
    method: 'PUT',
    body: JSON.stringify({ message: messageText }),
  });
};

/**
 * Delete a message
 * @param {string} messageId - The message ID
 */
export const deleteMessage = async (messageId) => {
  const endpoint = API_ENDPOINTS.CHAT.DELETE_MESSAGE.replace(':id', messageId);
  return apiFetch(endpoint, {
    method: 'DELETE',
  });
};

/**
 * Mark a message as read
 * @param {string} messageId - The message ID
 */
export const markMessageAsRead = async (messageId) => {
  const endpoint = API_ENDPOINTS.CHAT.MARK_READ.replace(':id', messageId);
  return apiFetch(endpoint, {
    method: 'POST',
  });
};

/**
 * Get read receipts for a message
 * @param {string} messageId - The message ID
 */
export const getReadReceipts = async (messageId) => {
  const endpoint = API_ENDPOINTS.CHAT.READ_RECEIPTS.replace(':id', messageId);
  return apiFetch(endpoint);
};

/**
 * Get unread message count for a conversation
 * @param {string} conversationId - The conversation ID
 */
export const getUnreadCount = async (conversationId) => {
  return apiFetch(`${API_ENDPOINTS.CHAT.UNREAD_COUNT}?conversationId=${conversationId}`);
};

/**
 * Create a new conversation
 * @param {Object} conversationData - Conversation data { typeConversation: 'DIRECT' | 'GROUP', participantIds: string[] }
 */
export const createConversation = async (conversationData) => {
  return apiFetch(API_ENDPOINTS.CHAT.CREATE_CONVERSATION, {
    method: 'POST',
    body: JSON.stringify(conversationData),
  });
};

/**
 * Update a conversation (only for GROUP)
 * @param {string} conversationId - The conversation ID
 * @param {Object} updateData - Update data { conversationName?, conversationAvatar? }
 */
export const updateConversation = async (conversationId, updateData) => {
  const endpoint = API_ENDPOINTS.CHAT.UPDATE_CONVERSATION.replace(':id', conversationId);
  return apiFetch(endpoint, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
};

/**
 * Delete a conversation
 * @param {string} conversationId - The conversation ID
 */
export const deleteConversation = async (conversationId) => {
  const endpoint = API_ENDPOINTS.CHAT.DELETE_CONVERSATION.replace(':id', conversationId);
  return apiFetch(endpoint, {
    method: 'DELETE',
  });
};

/**
 * Add participants to a group conversation
 * @param {string} conversationId - The conversation ID
 * @param {string[]} participantIds - Array of participant IDs
 */
export const addParticipants = async (conversationId, participantIds) => {
  const endpoint = API_ENDPOINTS.CHAT.ADD_PARTICIPANTS.replace(':id', conversationId);
  return apiFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify({ participantIds }),
  });
};

/**
 * Remove a participant from a group conversation
 * @param {string} conversationId - The conversation ID
 * @param {string} participantId - The participant ID to remove
 */
export const removeParticipant = async (conversationId, participantId) => {
  const endpoint = API_ENDPOINTS.CHAT.REMOVE_PARTICIPANT
    .replace(':id', conversationId)
    .replace(':participantId', participantId);
  return apiFetch(endpoint, {
    method: 'DELETE',
  });
};

/**
 * Leave a conversation
 * @param {string} conversationId - The conversation ID
 */
export const leaveConversation = async (conversationId) => {
  const endpoint = API_ENDPOINTS.CHAT.LEAVE_CONVERSATION.replace(':id', conversationId);
  return apiFetch(endpoint, {
    method: 'POST',
  });
};
