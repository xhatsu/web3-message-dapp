import React, { useState, useEffect } from 'react';
import { userApi } from '../services/api';
import { X, Save, Loader } from 'lucide-react';
import './EditProfileModal.css';

const EditProfileModal = ({ isOpen, onClose, currentUser, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    avatar: '',
    bio: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Populate form with existing data when modal opens
  useEffect(() => {
    if (currentUser && isOpen) {
      setFormData({
        username: currentUser.username || '',
        avatar: currentUser.avatar || '',
        bio: currentUser.bio || ''
      });
      setError('');
    }
  }, [currentUser, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await userApi.updateProfile(
        formData.username, 
        formData.avatar, 
        formData.bio
      );
      
      // Backend returns { user: ... } in response.data
      if (onUpdateSuccess && response.data && response.data.user) {
        onUpdateSuccess(response.data.user);
      }
      onClose();
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.error || 'Failed to update profile';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="edit-modal-overlay" onClick={onClose}>
      <div className="edit-modal-container" onClick={e => e.stopPropagation()}>
        <div className="edit-modal-header">
          <h2>Edit Profile</h2>
          <button className="close-icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        {error && <div className="edit-error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="edit-modal-form">
          {/* Avatar Section */}
          <div className="form-group avatar-section">
            <div className="avatar-preview-wrapper">
              <img 
                src={formData.avatar || 'https://via.placeholder.com/150'} 
                alt="Preview" 
                className="avatar-preview-img"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Img'; }} 
              />
            </div>
            <div className="input-wrapper">
              <label>Avatar URL</label>
              <input
                type="text"
                name="avatar"
                value={formData.avatar}
                onChange={handleChange}
                placeholder="https://example.com/image.png"
              />
            </div>
          </div>

          {/* Username Section */}
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Display Name"
              maxLength={30}
            />
          </div>

          {/* Bio Section */}
          <div className="form-group">
            <label>Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us a bit about yourself..."
              rows="3"
              maxLength={160}
            />
            <div className="char-count">{formData.bio.length}/160</div>
          </div>

          <div className="edit-modal-footer">
            <button type="button" onClick={onClose} className="btn-cancel" disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={isLoading}>
              {isLoading ? <Loader size={18} className="spinning" /> : <><Save size={18} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;