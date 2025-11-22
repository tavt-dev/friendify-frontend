import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { getToken } from './localStorageService';
import { CONFIG } from '../config/apiConfig';

/**
 * WebSocket Service for real-time chat
 * Uses STOMP over SockJS to connect to backend
 */
class WebSocketService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.subscriptions = new Map(); // Map<conversationId, subscription>
    this.typingSubscriptions = new Map(); // Map<conversationId, subscription>
    this.messageHandlers = new Map(); // Map<conversationId, Set<handler>>
    this.typingHandlers = new Map(); // Map<conversationId, Set<handler>>
    this.connectionHandlers = new Set(); // Set of connection state handlers
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
  }

  /**
   * Connect to WebSocket server
   * @param {Function} onConnect - Callback when connected
   * @param {Function} onError - Callback when error occurs
   */
  connect(onConnect, onError) {
    if (this.isConnected && this.client?.connected) {
      console.log('WebSocket already connected');
      if (onConnect) onConnect();
      return;
    }

    const token = getToken();
    if (!token) {
      console.error('No token available for WebSocket connection');
      if (onError) onError(new Error('No authentication token'));
      return;
    }

    // Disconnect existing connection if any
    if (this.client) {
      this.disconnect();
    }

    // Create SockJS connection
    const socket = new SockJS(CONFIG.WS_URL);
    
    // Create STOMP client
    this.client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        // Only log in development
        if (import.meta.env.DEV) {
          console.log('STOMP:', str);
        }
      },
      onConnect: (frame) => {
        console.log('WebSocket connected:', frame);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Notify all connection handlers
        this.connectionHandlers.forEach(handler => {
          try {
            handler(true);
          } catch (error) {
            console.error('Error in connection handler:', error);
          }
        });

        if (onConnect) onConnect();
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        this.isConnected = false;
        
        // Notify all connection handlers
        this.connectionHandlers.forEach(handler => {
          try {
            handler(false);
          } catch (error) {
            console.error('Error in connection handler:', error);
          }
        });

        if (onError) onError(new Error(frame.headers['message'] || 'STOMP error'));
      },
      onWebSocketClose: (event) => {
        console.log('WebSocket closed:', event);
        this.isConnected = false;
        
        // Notify all connection handlers
        this.connectionHandlers.forEach(handler => {
          try {
            handler(false);
          } catch (error) {
            console.error('Error in connection handler:', error);
          }
        });

        // Attempt to reconnect if not manually disconnected
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
          setTimeout(() => {
            if (!this.isConnected) {
              this.connect(onConnect, onError);
            }
          }, this.reconnectDelay);
        } else {
          console.error('Max reconnection attempts reached');
        }
      },
    });

    // Add authorization header
    this.client.configure({
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Activate the client
    this.client.activate();
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.client) {
      // Unsubscribe from all topics
      this.subscriptions.forEach((subscription) => {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing:', error);
        }
      });
      this.subscriptions.clear();

      this.typingSubscriptions.forEach((subscription) => {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing from typing:', error);
        }
      });
      this.typingSubscriptions.clear();

      // Deactivate client
      if (this.client.connected) {
        this.client.deactivate();
      }
      this.client = null;
    }
    this.isConnected = false;
    this.messageHandlers.clear();
    this.typingHandlers.clear();
  }

  /**
   * Subscribe to messages for a conversation
   * @param {string} conversationId - The conversation ID
   * @param {Function} onMessage - Callback when message is received
   */
  subscribeToMessages(conversationId, onMessage) {
    if (!this.client || !this.client.connected) {
      console.error('WebSocket not connected');
      return null;
    }

    // Unsubscribe if already subscribed
    if (this.subscriptions.has(conversationId)) {
      this.unsubscribeFromMessages(conversationId);
    }

    const topic = `/topic/conversation/${conversationId}`;
    
    const subscription = this.client.subscribe(topic, (message) => {
      try {
        const data = JSON.parse(message.body);
        console.log('Received message:', data);
        
        // Call all handlers for this conversation
        const handlers = this.messageHandlers.get(conversationId);
        if (handlers) {
          handlers.forEach(handler => {
            try {
              handler(data);
            } catch (error) {
              console.error('Error in message handler:', error);
            }
          });
        }
        
        if (onMessage) {
          onMessage(data);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    this.subscriptions.set(conversationId, subscription);
    
    // Add handler to set
    if (!this.messageHandlers.has(conversationId)) {
      this.messageHandlers.set(conversationId, new Set());
    }
    if (onMessage) {
      this.messageHandlers.get(conversationId).add(onMessage);
    }

    return subscription;
  }

  /**
   * Unsubscribe from messages for a conversation
   * @param {string} conversationId - The conversation ID
   */
  unsubscribeFromMessages(conversationId) {
    const subscription = this.subscriptions.get(conversationId);
    if (subscription) {
      try {
        subscription.unsubscribe();
      } catch (error) {
        console.error('Error unsubscribing:', error);
      }
      this.subscriptions.delete(conversationId);
    }
    this.messageHandlers.delete(conversationId);
  }

  /**
   * Subscribe to typing indicators for a conversation
   * @param {string} conversationId - The conversation ID
   * @param {Function} onTyping - Callback when typing indicator is received
   */
  subscribeToTyping(conversationId, onTyping) {
    if (!this.client || !this.client.connected) {
      console.error('WebSocket not connected');
      return null;
    }

    // Unsubscribe if already subscribed
    if (this.typingSubscriptions.has(conversationId)) {
      this.unsubscribeFromTyping(conversationId);
    }

    const topic = `/topic/conversation/${conversationId}/typing`;
    
    const subscription = this.client.subscribe(topic, (message) => {
      try {
        const data = JSON.parse(message.body);
        console.log('Received typing indicator:', data);
        
        // Call all handlers for this conversation
        const handlers = this.typingHandlers.get(conversationId);
        if (handlers) {
          handlers.forEach(handler => {
            try {
              handler(data);
            } catch (error) {
              console.error('Error in typing handler:', error);
            }
          });
        }
        
        if (onTyping) {
          onTyping(data);
        }
      } catch (error) {
        console.error('Error parsing typing indicator:', error);
      }
    });

    this.typingSubscriptions.set(conversationId, subscription);
    
    // Add handler to set
    if (!this.typingHandlers.has(conversationId)) {
      this.typingHandlers.set(conversationId, new Set());
    }
    if (onTyping) {
      this.typingHandlers.get(conversationId).add(onTyping);
    }

    return subscription;
  }

  /**
   * Unsubscribe from typing indicators for a conversation
   * @param {string} conversationId - The conversation ID
   */
  unsubscribeFromTyping(conversationId) {
    const subscription = this.typingSubscriptions.get(conversationId);
    if (subscription) {
      try {
        subscription.unsubscribe();
      } catch (error) {
        console.error('Error unsubscribing from typing:', error);
      }
      this.typingSubscriptions.delete(conversationId);
    }
    this.typingHandlers.delete(conversationId);
  }

  /**
   * Send a message via WebSocket
   * @param {string} conversationId - The conversation ID
   * @param {string} messageText - The message content
   */
  sendMessage(conversationId, messageText) {
    if (!this.client || !this.client.connected) {
      console.error('WebSocket not connected');
      throw new Error('WebSocket not connected');
    }

    const destination = '/app/chat.sendMessage';
    const payload = {
      conversationId,
      message: messageText,
    };

    this.client.publish({
      destination,
      body: JSON.stringify(payload),
    });

    console.log('Sent message via WebSocket:', payload);
  }

  /**
   * Send typing indicator
   * @param {string} conversationId - The conversation ID
   * @param {string} userId - The user ID
   * @param {boolean} isTyping - Whether user is typing
   */
  sendTypingIndicator(conversationId, userId, isTyping) {
    if (!this.client || !this.client.connected) {
      return; // Silently fail if not connected
    }

    const destination = '/app/chat.typing';
    const payload = {
      userId,
      conversationId,
      isTyping,
    };

    this.client.publish({
      destination,
      body: JSON.stringify(payload),
    });
  }

  /**
   * Add connection state handler
   * @param {Function} handler - Handler function(isConnected)
   */
  onConnectionChange(handler) {
    if (handler && typeof handler === 'function') {
      this.connectionHandlers.add(handler);
      // Immediately call with current state
      handler(this.isConnected);
    }
  }

  /**
   * Remove connection state handler
   * @param {Function} handler - Handler function to remove
   */
  offConnectionChange(handler) {
    this.connectionHandlers.delete(handler);
  }

  /**
   * Get current connection state
   * @returns {boolean}
   */
  getConnectionState() {
    return this.isConnected && this.client?.connected;
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
export default websocketService;

