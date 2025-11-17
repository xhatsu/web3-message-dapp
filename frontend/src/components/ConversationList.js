import React from 'react';
import './ConversationList.css';

function ConversationList({ conversations, selectedUser, onSelectUser }) {
  return (
    <div className="conversation-list">
      {conversations.map((conv) => (
        <div
          key={conv.conversation._id}
          className={`conversation-item ${
            selectedUser?.conversation._id === conv.conversation._id
              ? 'active'
              : ''
          }`}
          onClick={() => onSelectUser(conv)}
        >
          <div className="conversation-avatar">
            {conv.otherUser.avatar ? (
              <img src={conv.otherUser.avatar} alt={conv.otherUser.username} />
            ) : (
              <div className="avatar-placeholder">
                {conv.otherUser.address.slice(2, 4).toUpperCase()}
              </div>
            )}
          </div>

          <div className="conversation-info">
            <div className="conversation-header">
              <h4 className="conversation-name">
                {conv.otherUser.username ||
                  `${conv.otherUser.address.slice(0, 10)}...`}
              </h4>
              {conv.lastMessage && (
                <span className="conversation-time">
                  {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
            </div>

            <p className="conversation-preview">
              {conv.lastMessage?.content?.substring(0, 50)}
              {conv.lastMessage?.content?.length > 50 ? '...' : ''}
            </p>
          </div>

          {conv.otherUser.isOnline && <div className="online-indicator"></div>}
        </div>
      ))}
    </div>
  );
}

export default ConversationList;
