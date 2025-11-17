import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { userApi } from '../services/api';
import './NewConversation.css';

function NewConversation({ onClose, onConversationStart }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const response = await userApi.searchUsers(query, 10);
      setSearchResults(response.data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedUser) return;

    try {
      setIsSending(true);
      const response = await userApi.sendFirstMessage(selectedUser.address, message);
      
      if (onConversationStart) {
        onConversationStart(response.data);
      }
      onClose();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="new-conversation-overlay">
      <div className="new-conversation-modal">
        <div className="modal-header">
          <h2>Start New Conversation</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-content">
          {!selectedUser ? (
            <div className="search-section">
              <input
                type="text"
                placeholder="Search for a user by address or username..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="search-input"
              />

              {isSearching && <div className="searching">Searching...</div>}

              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((user) => (
                    <div
                      key={user.address}
                      className="search-result-item"
                      onClick={() => handleSelectUser(user)}
                    >
                      {user.avatar && (
                        <img src={user.avatar} alt={user.username} className="user-avatar" />
                      )}
                      <div className="user-info">
                        <div className="username">
                          {user.username || `${user.address.slice(0, 10)}...`}
                        </div>
                        <div className="address">{user.address}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searchQuery && searchResults.length === 0 && !isSearching && (
                <div className="no-results">No users found</div>
              )}
            </div>
          ) : (
            <div className="message-section">
              <div className="selected-user">
                {selectedUser.avatar && (
                  <img src={selectedUser.avatar} alt={selectedUser.username} className="user-avatar-large" />
                )}
                <div className="user-details">
                  <div className="username">
                    {selectedUser.username || `${selectedUser.address.slice(0, 10)}...`}
                  </div>
                  <div className="address">{selectedUser.address}</div>
                </div>
                <button className="change-btn" onClick={() => setSelectedUser(null)}>
                  Change
                </button>
              </div>

              <textarea
                placeholder="Type your first message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="message-textarea"
              />

              <div className="modal-actions">
                <button className="cancel-btn" onClick={onClose} disabled={isSending}>
                  Cancel
                </button>
                <button
                  className="send-btn"
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isSending}
                >
                  <Send size={18} />
                  {isSending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NewConversation;
