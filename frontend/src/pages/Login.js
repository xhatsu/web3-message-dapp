import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { connectWallet, signMessage, getAvailableWallets } from '../services/web3';
import { authApi } from '../services/api';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const { login, setError, setIsLoading } = useAuthStore();
  const [error, setLocalError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [availableWallets, setAvailableWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState('metamask');

  useEffect(() => {
    // Detect available wallets on mount
    const wallets = getAvailableWallets();
    setAvailableWallets(wallets);
    if (wallets.length > 0) {
      setSelectedWallet(wallets[0].id);
    }
  }, []);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    setLocalError(null);

    try {
      // Connect wallet
      const { address } = await connectWallet(selectedWallet);
      console.log('Connected address:', address);

      // Get nonce from backend
      const nonceResponse = await authApi.getNonce(address);
      console.log('Nonce response:', nonceResponse.data);
      
      const { nonce, message } = nonceResponse.data;
      
      // Validate message
      if (!message) {
        throw new Error('Failed to get message from backend. Message is undefined.');
      }

      console.log('Message to sign:', message);

      // Sign message
      const signature = await signMessage(message);
      console.log('Signature:', signature);

      // Login
      const loginResponse = await authApi.login(address, signature, message);
      const { token, user } = loginResponse.data;

      // Store auth data
      login(user, token);

      // Redirect to chat
      navigate('/chat');
    } catch (err) {
      console.error('Login error:', err);
      setLocalError(
        err.response?.data?.error ||
          err.message ||
          'Failed to connect wallet'
      );
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🔐 Web3 Message</h1>
          <p>Connect with your wallet to start messaging</p>
        </div>

        <div className="login-content">
          {error && <div className="error-message">{error}</div>}

          {availableWallets.length > 0 && (
            <div className="wallet-selector">
              <label htmlFor="wallet-select">Select Wallet:</label>
              <select
                id="wallet-select"
                value={selectedWallet}
                onChange={(e) => setSelectedWallet(e.target.value)}
                disabled={isConnecting}
                className="wallet-select"
              >
                {availableWallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.icon} {wallet.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            className="connect-button"
            onClick={handleConnectWallet}
            disabled={isConnecting || availableWallets.length === 0}
          >
            {isConnecting ? (
              <>
                <span className="spinner"></span>
                Connecting...
              </>
            ) : availableWallets.length === 0 ? (
              <>
                <span className="wallet-icon">❌</span>
                No Wallet Detected
              </>
            ) : (
              <>
                <span className="wallet-icon">{availableWallets.find(w => w.id === selectedWallet)?.icon}</span>
                Connect {availableWallets.find(w => w.id === selectedWallet)?.name}
              </>
            )}
          </button>

          <div className="info-section">
            <h3>How it works:</h3>
            <ol>
              <li>Select your wallet and connect</li>
              <li>Sign a message to authenticate</li>
              <li>Start sending encrypted messages</li>
              <li>All messages stored securely</li>
            </ol>
          </div>
        </div>

        <div className="login-footer">
          <p>
            Don't have a wallet?{' '}
            {availableWallets.length === 0 ? (
              <>
                Install{' '}
                <a
                  href="https://metamask.io"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  MetaMask
                </a>
                {' '}or{' '}
                <a
                  href="https://www.taho.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Taho
                </a>
              </>
            ) : (
              <>
                Don't see your wallet?{' '}
                <a
                  href="https://www.taho.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Try Taho
                </a>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
