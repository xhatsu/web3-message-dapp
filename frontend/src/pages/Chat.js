import React, { useEffect, useState } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useMessageStore } from '../store/messageStore';
import { messageApi } from '../services/api';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';
import './Chat.css';
import { LogOut, Plus } from 'lucide-react';

function Chat() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { conversations, setConversations, setCurrentConversation } =
    useMessageStore();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const response = await messageApi.getConversations();
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSelectUser = (conversation) => {
    setSelectedUser(conversation);
    setCurrentConversation(conversation);
  };

  const handleNewConversation = () => {
    setSelectedUser(null);
    setCurrentConversation(null);
  };

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h2>Messages</h2>
          <button
            className="new-message-btn"
            onClick={handleNewConversation}
            title="New message"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="user-info">
          <div className="user-address">
            {user?.address?.slice(0, 10)}...
          </div>
        </div>

        <div className="conversations-wrapper">
          {isLoading ? (
            <div className="loading">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="empty-state">
              <p>No conversations yet</p>
              <p className="small">Start a new conversation to begin</p>
            </div>
          ) : (
            <ConversationList
              conversations={conversations}
              selectedUser={selectedUser}
              onSelectUser={handleSelectUser}
            />
          )}
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </div>

      <div className="chat-main">
        {selectedUser ? (
          <ChatWindow
            conversation={selectedUser}
            onConversationUpdate={loadConversations}
          />
        ) : (
          <div className="chat-empty">
            <div className="empty-illustration">💬</div>
            <h3>No conversation selected</h3>
            <p>Choose a conversation or start a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
