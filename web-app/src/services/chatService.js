import { USE_MOCK_DATA_FOR_READS, getApiUrl, API_ENDPOINTS } from '../config/apiConfig';
import { mockConversations, mockMessages } from '../utils/comprehensiveMockData';
import { getToken } from './localStorageService';

const mockDelay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const getConversations = async () => {
  if (USE_MOCK_DATA_FOR_READS) {
    await mockDelay();
    return {
      data: { result: mockConversations },
      status: 200,
    };
  }

  const response = await fetch(getApiUrl(API_ENDPOINTS.CHAT.CONVERSATIONS), {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
  return { data: await response.json(), status: response.status };
};

export const getMessages = async (conversationId) => {
  if (USE_MOCK_DATA_FOR_READS) {
    await mockDelay();
    return {
      data: { result: mockMessages[conversationId] || [] },
      status: 200,
    };
  }

  const response = await fetch(
    getApiUrl(API_ENDPOINTS.CHAT.MESSAGES.replace(':id', conversationId)),
    {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return { data: await response.json(), status: response.status };
};

export const sendMessage = async (conversationId, messageText) => {
  await mockDelay(400);
  
  const newMessage = {
    id: `m-${Date.now()}`,
    message: messageText,
    createdDate: new Date().toISOString(),
    me: true,
    pending: false,
  };

  const storageKey = `chat_messages_${conversationId}`;
  const currentMessages = JSON.parse(localStorage.getItem(storageKey) || '[]');
  currentMessages.push(newMessage);
  localStorage.setItem(storageKey, JSON.stringify(currentMessages));

  const conversationsKey = 'chat_conversations';
  const conversations = JSON.parse(localStorage.getItem(conversationsKey) || JSON.stringify(mockConversations));
  const updatedConversations = conversations.map(conv => 
    conv.id === conversationId 
      ? { ...conv, lastMessage: messageText, lastTimestamp: new Date().toISOString(), modifiedDate: new Date().toISOString() }
      : conv
  );
  localStorage.setItem(conversationsKey, JSON.stringify(updatedConversations));

  const response = await fetch(
    getApiUrl(API_ENDPOINTS.CHAT.SEND.replace(':id', conversationId)),
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: messageText }),
    }
  );

  return { data: await response.json(), status: response.status };
};

export const createConversation = async (conversationData) => {
  await mockDelay(400);
  
  const newConversation = {
    ...conversationData,
    id: `conv-${Date.now()}`,
    modifiedDate: new Date().toISOString(),
    unread: 0,
    lastMessage: '',
    lastTimestamp: new Date().toISOString(),
  };

  const conversationsKey = 'chat_conversations';
  const conversations = JSON.parse(localStorage.getItem(conversationsKey) || '[]');
  conversations.unshift(newConversation);
  localStorage.setItem(conversationsKey, JSON.stringify(conversations));

  const response = await fetch(getApiUrl(API_ENDPOINTS.CHAT.CREATE_CONVERSATION), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(conversationData),
  });

  return { data: await response.json(), status: response.status };
};
