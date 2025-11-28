import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useMessageStore } from '../store/messageStore';
import { messageApi } from '../services/api';
import { Send, Trash2, Gift, Coins } from 'lucide-react';
import QuickTransferModal from './QuickTransferModal';
import TransferMessage from './TransferMessage';
import './ChatWindow.css';

function ChatWindow({ conversation, onConversationUpdate }) {
  const { user } = useAuthStore();
  const { messages, addMessage, setMessages } = useMessageStore();
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(null);
  const messagesEndRef = useRef(null);

  const otherAddress = conversation.otherUser.address;

  useEffect(() => {
    loadMessages();
  }, [conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const response = await messageApi.getConversation(otherAddress);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    try {
      setIsSending(true);
      const response = await messageApi.sendMessage(otherAddress, newMessage);

      addMessage(response.data.message);
      setNewMessage('');
      onConversationUpdate();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return;

    try {
      await messageApi.deleteMessage(messageId);
      await loadMessages();
      onConversationUpdate();
    } catch (error) {
      console.error('Failed to delete message:', error);
      alert('Failed to delete message');
    }
  };

  const handleTransferSent = (newMessage) => {
    addMessage(newMessage);
    onConversationUpdate();
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="header-info">
          <h3>{conversation.otherUser.username || conversation.otherUser.address}</h3>
          <p className="header-address">
            {conversation.otherUser.address}
            {conversation.otherUser.isOnline && <span className="online-badge">Online</span>}
          </p>
        </div>
      </div>

      <div className="messages-container">
        {isLoading ? (
          <div className="loading">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="empty-messages">
            <div className="empty-icon">💬</div>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`message ${
                  msg.sender === user?.address ? 'sent' : 'received'
                }`}
              >
                {msg.transfer && msg.transfer !== 'none' ? (
                  <TransferMessage
                    message={msg}
                    currentUser={user?.address}
                    onTransferClaimed={loadMessages}
                  />
                ) : (
                  <div className="message-bubble">
                    <div className="message-text">{msg.content}</div>
                    <div className="message-meta">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {msg.sender === user?.address && (
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteMessage(msg._id)}
                          title="Delete message"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form className="message-input-container" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={isSending}
          className="message-input"
        />
        <div className="input-buttons">
          <button
            type="button"
            onClick={() => setShowTransferModal('nft')}
            disabled={isSending}
            className="transfer-btn nft-btn"
            title="Send NFT"
          >
            <Gift size={20} />
          </button>
          <button
            type="button"
            onClick={() => setShowTransferModal('token')}
            disabled={isSending}
            className="transfer-btn token-btn"
            title="Send Token"
          >
            <Coins size={20} />
          </button>
          <button
            type="submit"
            disabled={isSending || !newMessage.trim()}
            className="send-button"
          >
            <Send size={20} />
          </button>
        </div>
      </form>

      {showTransferModal && (
        <QuickTransferModal
          recipientAddress={conversation.otherUser.address}
          transferType={showTransferModal}
          onClose={() => setShowTransferModal(null)}
          onTransferSent={handleTransferSent}
        />
      )}
    </div>
  );
}

export default ChatWindow;
