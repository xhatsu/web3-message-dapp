import React, { useEffect, useState } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useMessageStore } from '../store/messageStore';
import { messageApi } from '../services/api';
import { reconnectWallet } from '../services/web3';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';
import NewConversation from '../components/NewConversation';
import UserInfoPanel from '../components/UserInfoPanel';
import './Chat.css';
import { LogOut, Plus, RefreshCw } from 'lucide-react';

function Chat() {
  const navigate = useNavigate();
  const { user, logout, walletType } = useAuthStore();
  const { conversations, setConversations, setCurrentConversation } =
    useMessageStore();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleRefreshWallet = async () => {
    setIsRefreshing(true);
    try {
      if (user?.address && walletType) {
        await reconnectWallet(walletType);
        console.log('Wallet reconnected successfully');
      }
    } catch (error) {
      console.error('Failed to reconnect wallet:', error);
    } finally {
      setIsRefreshing(false);
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
    setShowNewConversation(true);
  };

  const handleConversationStart = () => {
    loadConversations();
  };

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h2>Messages</h2>
          <div className="header-buttons">
            <button
              className="header-btn refresh-btn"
              onClick={handleRefreshWallet}
              title="Reconnect wallet"
              disabled={isRefreshing}
            >
              <RefreshCw size={20} className={isRefreshing ? 'spinning' : ''} />
            </button>
            <button
              className="header-btn new-message-btn"
              onClick={handleNewConversation}
              title="New message"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        <UserInfoPanel />

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
        {showNewConversation && (
          <NewConversation
            onClose={() => setShowNewConversation(false)}
            onConversationStart={handleConversationStart}
          />
        )}
        
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
