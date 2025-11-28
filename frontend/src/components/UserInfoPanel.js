import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { web3Service } from '../services/web3';
import { Wallet, Loader } from 'lucide-react';
import './UserInfoPanel.css';
import { formatUnits } from 'ethers';

function UserInfoPanel() {
  const { user } = useAuthStore();
  const [balance, setBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

      // Get ETH balance (in wei, convert to ETH)
      const balanceWei = await provider.getBalance(user.address);
      const balanceEth = formatUnits(balanceWei, 'ether');
      //const balanceEth = await provider.formatEthers(balanceWei);
      
      setBalance({
        eth: parseFloat(balanceEth).toFixed(4),
        usd: (parseFloat(balanceEth) * 2500).toFixed(2), // Approximate ETH price
      });
    } catch (err) {
      console.error('Failed to fetch balance:', err);
      setError('Unable to fetch balance');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="user-info-panel">
      <div className="panel-header">
        <Wallet size={18} />
        <h3>Wallet Info</h3>
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
                🔄
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
          {isLoading ? <Loader size={16} className="spinning" /> : '🔄 Refresh'}
        </button>
      </div>
    </div>
  );
}

export default UserInfoPanel;
