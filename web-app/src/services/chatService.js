import { API_ENDPOINTS } from '../config/apiConfig';
import { apiFetch } from './apiHelper';

/**
 * Get all conversations for current user
 * @returns {Promise<{data: any, status: number}>}
 */
export const getConversations = async () => {
  try {
    return await apiFetch(API_ENDPOINTS.CHAT.CONVERSATIONS);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

/**
 * Get conversation detail by ID
 * @param {string} conversationId - The conversation ID
 * @returns {Promise<{data: any, status: number}>}
 */
export const getConversationDetail = async (conversationId) => {
  if (!conversationId || typeof conversationId !== 'string') {
    throw new Error('Conversation ID is required');
  }

  try {
    const endpoint = API_ENDPOINTS.CHAT.CONVERSATION_DETAIL.replace(':id', conversationId);
    return await apiFetch(endpoint);
  } catch (error) {
    console.error('Error fetching conversation detail:', error);
    throw error;
  }
};

/**
 * Get messages for a specific conversation (simple list)
 * @param {string} conversationId - The conversation ID
 * @returns {Promise<{data: any, status: number}>}
 */
export const getMessages = async (conversationId) => {
  if (!conversationId || typeof conversationId !== 'string') {
    throw new Error('Conversation ID is required');
  }

  try {
    return await apiFetch(`${API_ENDPOINTS.CHAT.MESSAGES}?conversationId=${conversationId}`);
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

/**
 * Get messages for a specific conversation with pagination
 * @param {string} conversationId - The conversation ID
 * @param {number} page - Page number (default: 1)
 * @param {number} size - Page size (default: 50)
 * @returns {Promise<{data: any, status: number}>}
 */
export const getMessagesPaginated = async (conversationId, page = 1, size = 50) => {
  if (!conversationId || typeof conversationId !== 'string') {
    throw new Error('Conversation ID is required');
  }
  if (page < 1) {
    throw new Error('Page must be greater than 0');
  }
  if (size < 1) {
    throw new Error('Size must be greater than 0');
  }

  try {
    return await apiFetch(`${API_ENDPOINTS.CHAT.MESSAGES_PAGINATED}?conversationId=${conversationId}&page=${page}&size=${size}`);
  } catch (error) {
    console.error('Error fetching paginated messages:', error);
    throw error;
  }
};

/**
 * Create a new message (REST API)
 * @param {string} conversationId - The conversation ID
 * @param {string} messageText - The message content
 * @returns {Promise<{data: any, status: number}>}
 */
export const createMessage = async (conversationId, messageText) => {
  if (!conversationId || typeof conversationId !== 'string') {
    throw new Error('Conversation ID is required');
  }
  if (!messageText || typeof messageText !== 'string' || messageText.trim().length === 0) {
    throw new Error('Message text is required');
  }

  try {
    return await apiFetch(API_ENDPOINTS.CHAT.CREATE_MESSAGE, {
      method: 'POST',
      body: JSON.stringify({ 
        conversationId,
        message: messageText.trim() 
      }),
    });
  } catch (error) {
    console.error('Error creating message:', error);
    throw error;
  }
};

/**
 * Send a message to a conversation (alias for createMessage for backward compatibility)
 * @param {string} conversationId - The conversation ID
 * @param {string} messageText - The message content
 * @returns {Promise<{data: any, status: number}>}
 */
export const sendMessage = async (conversationId, messageText) => {
  return createMessage(conversationId, messageText);
};

/**
 * Get message by ID
 * @param {string} messageId - The message ID
 * @returns {Promise<{data: any, status: number}>}
 */
export const getMessage = async (messageId) => {
  if (!messageId || typeof messageId !== 'string') {
    throw new Error('Message ID is required');
  }

  try {
    const endpoint = API_ENDPOINTS.CHAT.MESSAGE_DETAIL.replace(':id', messageId);
    return await apiFetch(endpoint);
  } catch (error) {
    console.error('Error fetching message:', error);
    throw error;
  }
};

/**
 * Update a message
 * @param {string} messageId - The message ID
 * @param {string} messageText - The updated message content
 * @returns {Promise<{data: any, status: number}>}
 */
export const updateMessage = async (messageId, messageText) => {
  if (!messageId || typeof messageId !== 'string') {
    throw new Error('Message ID is required');
  }
  if (!messageText || typeof messageText !== 'string' || messageText.trim().length === 0) {
    throw new Error('Message text is required');
  }

  try {
    const endpoint = API_ENDPOINTS.CHAT.UPDATE_MESSAGE.replace(':id', messageId);
    return await apiFetch(endpoint, {
      method: 'PUT',
      body: JSON.stringify({ message: messageText.trim() }),
    });
  } catch (error) {
    console.error('Error updating message:', error);
    throw error;
  }
};

/**
 * Delete a message
 * @param {string} messageId - The message ID
 * @returns {Promise<{data: any, status: number}>}
 */
export const deleteMessage = async (messageId) => {
  if (!messageId || typeof messageId !== 'string') {
    throw new Error('Message ID is required');
  }

  try {
    const endpoint = API_ENDPOINTS.CHAT.DELETE_MESSAGE.replace(':id', messageId);
    return await apiFetch(endpoint, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

/**
 * Mark a message as read
 * @param {string} messageId - The message ID
 * @returns {Promise<{data: any, status: number}>}
 */
export const markMessageAsRead = async (messageId) => {
  if (!messageId || typeof messageId !== 'string') {
    throw new Error('Message ID is required');
  }

  try {
    const endpoint = API_ENDPOINTS.CHAT.MARK_READ.replace(':id', messageId);
    return await apiFetch(endpoint, {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

/**
 * Get read receipts for a message
 * @param {string} messageId - The message ID
 * @returns {Promise<{data: any, status: number}>}
 */
export const getReadReceipts = async (messageId) => {
  if (!messageId || typeof messageId !== 'string') {
    throw new Error('Message ID is required');
  }

  try {
    const endpoint = API_ENDPOINTS.CHAT.READ_RECEIPTS.replace(':id', messageId);
    return await apiFetch(endpoint);
  } catch (error) {
    console.error('Error fetching read receipts:', error);
    throw error;
  }
};

/**
 * Get unread message count for a conversation
 * @param {string} conversationId - The conversation ID
 * @returns {Promise<{data: any, status: number}>}
 */
export const getUnreadCount = async (conversationId) => {
  if (!conversationId || typeof conversationId !== 'string') {
    throw new Error('Conversation ID is required');
  }

  try {
    return await apiFetch(`${API_ENDPOINTS.CHAT.UNREAD_COUNT}?conversationId=${conversationId}`);
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
};

/**
 * Create a new conversation
 * @param {Object} conversationData - Conversation data { typeConversation: 'DIRECT' | 'GROUP', participantIds: string[] }
 * @returns {Promise<{data: any, status: number}>}
 */
export const createConversation = async (conversationData) => {
  if (!conversationData || typeof conversationData !== 'object') {
    throw new Error('Conversation data is required');
  }
  if (!conversationData.typeConversation) {
    throw new Error('Type conversation is required');
  }
  if (!Array.isArray(conversationData.participantIds)) {
    throw new Error('Participant IDs must be an array');
  }

  try {
    return await apiFetch(API_ENDPOINTS.CHAT.CREATE_CONVERSATION, {
      method: 'POST',
      body: JSON.stringify(conversationData),
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

/**
 * Update a conversation (only for GROUP)
 * @param {string} conversationId - The conversation ID
 * @param {Object} updateData - Update data { conversationName?, conversationAvatar? }
 * @returns {Promise<{data: any, status: number}>}
 */
export const updateConversation = async (conversationId, updateData) => {
  if (!conversationId || typeof conversationId !== 'string') {
    throw new Error('Conversation ID is required');
  }
  if (!updateData || typeof updateData !== 'object') {
    throw new Error('Update data is required');
  }

  try {
    const endpoint = API_ENDPOINTS.CHAT.UPDATE_CONVERSATION.replace(':id', conversationId);
    return await apiFetch(endpoint, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  } catch (error) {
    console.error('Error updating conversation:', error);
    throw error;
  }
};

/**
 * Delete a conversation
 * @param {string} conversationId - The conversation ID
 * @returns {Promise<{data: any, status: number}>}
 */
export const deleteConversation = async (conversationId) => {
  if (!conversationId || typeof conversationId !== 'string') {
    throw new Error('Conversation ID is required');
  }

  try {
    const endpoint = API_ENDPOINTS.CHAT.DELETE_CONVERSATION.replace(':id', conversationId);
    return await apiFetch(endpoint, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
};

/**
 * Add participants to a group conversation
 * @param {string} conversationId - The conversation ID
 * @param {string[]} participantIds - Array of participant IDs
 * @returns {Promise<{data: any, status: number}>}
 */
export const addParticipants = async (conversationId, participantIds) => {
  if (!conversationId || typeof conversationId !== 'string') {
    throw new Error('Conversation ID is required');
  }
  if (!Array.isArray(participantIds) || participantIds.length === 0) {
    throw new Error('Participant IDs must be a non-empty array');
  }

  try {
    const endpoint = API_ENDPOINTS.CHAT.ADD_PARTICIPANTS.replace(':id', conversationId);
    return await apiFetch(endpoint, {
      method: 'POST',
      body: JSON.stringify({ participantIds }),
    });
  } catch (error) {
    console.error('Error adding participants:', error);
    throw error;
  }
};

/**
 * Remove a participant from a group conversation
 * @param {string} conversationId - The conversation ID
 * @param {string} participantId - The participant ID to remove
 * @returns {Promise<{data: any, status: number}>}
 */
export const removeParticipant = async (conversationId, participantId) => {
  if (!conversationId || typeof conversationId !== 'string') {
    throw new Error('Conversation ID is required');
  }
  if (!participantId || typeof participantId !== 'string') {
    throw new Error('Participant ID is required');
  }

  try {
    const endpoint = API_ENDPOINTS.CHAT.REMOVE_PARTICIPANT
      .replace(':id', conversationId)
      .replace(':participantId', participantId);
    return await apiFetch(endpoint, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error removing participant:', error);
    throw error;
  }
};

/**
 * Leave a conversation
 * @param {string} conversationId - The conversation ID
 * @returns {Promise<{data: any, status: number}>}
 */
export const leaveConversation = async (conversationId) => {
  if (!conversationId || typeof conversationId !== 'string') {
    throw new Error('Conversation ID is required');
  }

  try {
    const endpoint = API_ENDPOINTS.CHAT.LEAVE_CONVERSATION.replace(':id', conversationId);
    return await apiFetch(endpoint, {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error leaving conversation:', error);
    throw error;
  }
};
