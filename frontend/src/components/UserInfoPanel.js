import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { web3Service } from '../services/web3';
import { Wallet, Loader, Edit2, RotateCcw } from 'lucide-react';
import EditProfileModal from './EditProfileModal';
import './UserInfoPanel.css';
import { formatUnits } from 'ethers';

function UserInfoPanel() {
  const { user, setUser } = useAuthStore();
  
  const [balance, setBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
        setError('Wallet not connected');
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
      setError('Unable to fetch balance');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSuccess = (updatedUser) => {
    // Update local state with new profile info
    setUser({ ...user, ...updatedUser });
  };

  return (
    <div className="user-info-panel">
      <div className="panel-header">
        <div className="header-left">
            <Wallet size={18} />
            <h3>WALLET INFO</h3>
        </div>
        
        {/* Edit Button */}
        <button 
            className="edit-icon-btn" 
            onClick={() => setIsEditModalOpen(true)}
            title="Edit Profile"
        >
            <Edit2 size={16} />
        </button>
      </div>

      <div className="panel-content">
        {/* Address Section */}
        <div className="info-section">
          <label>Address</label>
          <div className="address-display">
            <span className="address-text">{user?.address}</span>
            <button
              className="copy-btn"
              onClick={() => navigator.clipboard.writeText(user?.address)}
              title="Copy address"
            >
              📋
            </button>
          </div>
        </div>

        {/* Balance Section */}
        <div className="info-section">
          <label>ETH Balance</label>
          {isLoading ? (
            <div className="loading-balance">
              <Loader size={16} className="spinning" />
              <span>Loading...</span>
            </div>
          ) : error ? (
            <div className="error-balance">
              <span>{error}</span>
              <button 
                className="retry-btn" 
                onClick={fetchBalance}
                title="Retry"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          ) : balance ? (
            <div className="balance-display">
              <div className="balance-value">
                <span className="eth-amount">{balance.eth} ETH</span>
              </div>
              <div className="balance-usd">
                ≈ ${balance.usd}
              </div>
            </div>
          ) : null}
        </div>

        {/* Refresh Button */}
        <button 
          className="refresh-btn"
          onClick={fetchBalance}
          disabled={isLoading}
          title="Refresh balance"
        >
          {isLoading ? <Loader size={16} className="spinning" /> : <><RotateCcw size={14} /> Refresh Balance</>}
        </button>
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