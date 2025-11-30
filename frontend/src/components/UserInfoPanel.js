import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { web3Service } from '../services/web3';
import { Wallet, Loader, Edit2, RotateCcw, Copy, Check } from 'lucide-react';
import EditProfileModal from './EditProfileModal';
import './UserInfoPanel.css';
import { formatUnits } from 'ethers';

function UserInfoPanel() {
  const { user, setUser } = useAuthStore();
  
  const [balance, setBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  
  // State for the Edit Profile Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (user?.address) {
      fetchBalance();
    }
  }, [user?.address]);

  const fetchBalance = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const provider = web3Service.getProvider();
      if (!provider) {
        setError('Disconnected');
        return;
      }

      // Get ETH balance
      const balanceWei = await provider.getBalance(user.address);
      const balanceEth = formatUnits(balanceWei, 'ether');
      
      setBalance({
        eth: parseFloat(balanceEth).toFixed(4),
        usd: (parseFloat(balanceEth) * 2500).toFixed(2), // Approximate price
      });
    } catch (err) {
      console.error('Failed to fetch balance:', err);
      setError('Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSuccess = (updatedUser) => {
    // Update local state with new profile info
    setUser({ ...user, ...updatedUser });
  };

  const handleCopy = () => {
    if (user?.address) {
      navigator.clipboard.writeText(user.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="user-info-panel">
      {/* HEADER: Title + Actions (Refresh & Edit) */}
      <div className="panel-header">
        <div className="header-left">
            <Wallet size={14} color="#4facfe" />
            <h3>WALLET</h3>
        </div>
        
        <div className="header-actions">
            <button 
                className="action-btn" 
                onClick={fetchBalance}
                disabled={isLoading}
                title="Refresh Balance"
            >
                <RotateCcw size={14} className={isLoading ? "spinning" : ""} />
            </button>
            <button 
                className="action-btn" 
                onClick={() => setIsEditModalOpen(true)}
                title="Edit Profile"
            >
                <Edit2 size={14} />
            </button>
        </div>
      </div>

      <div className="panel-content">
        {/* Address Row */}
        <div className="info-section">
          <div className="address-display">
            <span className="address-text">{user?.address}</span>
            <button
              className="copy-btn"
              onClick={handleCopy}
              title="Copy address"
            >
              {copied ? <Check size={12} color="#4ade80"/> : <Copy size={12} />}
            </button>
          </div>
        </div>

        {/* Balance Row */}
        <div className="info-section">
          {isLoading ? (
            <div className="loading-balance">
              <Loader size={12} className="spinning" />
              <span>Syncing...</span>
            </div>
          ) : error ? (
            <div className="error-balance">
              <span>Offline</span>
              <button className="retry-btn" onClick={fetchBalance}><RotateCcw size={10} /></button>
            </div>
          ) : balance ? (
            <div className="balance-display">
              <span className="eth-amount">{balance.eth} ETH</span>
              <span className="balance-usd">≈ ${balance.usd}</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentUser={user}
        onUpdateSuccess={handleUpdateSuccess}
      />
    </div>
  );
}

export default UserInfoPanel;