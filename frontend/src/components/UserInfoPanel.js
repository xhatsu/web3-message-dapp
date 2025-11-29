import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { web3Service } from '../services/web3';
import { Wallet, Loader, Copy, RefreshCw, Check } from 'lucide-react';
import './UserInfoPanel.css';
import { formatUnits } from 'ethers';

function UserInfoPanel() {
  const { user } = useAuthStore();
  const [balance, setBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

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

      const balanceWei = await provider.getBalance(user.address);
      const balanceEth = formatUnits(balanceWei, 'ether');
      
      setBalance({
        eth: parseFloat(balanceEth).toFixed(4),
        usd: (parseFloat(balanceEth) * 2500).toFixed(2), // Mock price for demo
      });
    } catch (err) {
      console.error('Failed to fetch balance:', err);
      setError('Error');
    } finally {
      setIsLoading(false);
    }
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
      {/* Header with Refresh Button included */}
      <div className="panel-header">
        <div className="header-left">
            <Wallet size={16} color="#4facfe" />
            <h3>My Wallet</h3>
        </div>
        <button 
            className="header-refresh-btn" 
            onClick={fetchBalance}
            disabled={isLoading}
            title="Refresh Balance"
        >
            <RefreshCw size={14} className={isLoading ? "spinning" : ""} />
        </button>
      </div>

      <div className="panel-content">
        {/* Address Section */}
        <div className="info-section">
          {/* Label removed to save space, icon implies context */}
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

        {/* Balance Section */}
        <div className="info-section">
          {isLoading ? (
            <div className="loading-balance">
              <Loader size={12} className="spinning" />
              <span>Syncing...</span>
            </div>
          ) : error ? (
            <div className="error-balance">
              <span>Offline</span>
              <button className="retry-btn" onClick={fetchBalance}><RefreshCw size={10}/></button>
            </div>
          ) : balance ? (
            <div className="balance-display">
              <span className="eth-amount">{balance.eth} ETH</span>
              <span className="balance-usd">≈ ${balance.usd}</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default UserInfoPanel;