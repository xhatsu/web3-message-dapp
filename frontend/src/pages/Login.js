import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { connectWallet, signMessage, getAvailableWallets } from '../services/web3';
import { authApi } from '../services/api';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const { login, setError, setIsLoading } = useAuthStore();
  const [localError, setLocalError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [availableWallets, setAvailableWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState('metamask');

  useEffect(() => {
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
      // 1. Connect Wallet
      const { address } = await connectWallet(selectedWallet);
      
      // 2. Get Nonce
      const nonceResponse = await authApi.getNonce(address);
      const { nonce, message } = nonceResponse.data;
      
      if (!message) throw new Error('Failed to get signature message.');

      // 3. Sign Message
      const signature = await signMessage(message);

      // 4. Login
      const loginResponse = await authApi.login(address, signature, message);
      const { token, user } = loginResponse.data;

      login(user, token, selectedWallet);
      navigate('/chat');
    } catch (err) {
      console.error('Login error:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Connection failed';
      setLocalError(errorMsg);
      setError(errorMsg);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🔐 Web3 Message</h1>
          <p>Secure blockchain messaging</p>
        </div>

        <div className="login-content">
          {localError && <div className="error-message">⚠️ {localError}</div>}

          {/* New Wallet Selector Grid */}
          <div className="wallet-grid">
            {availableWallets.length > 0 ? (
              availableWallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className={`wallet-option ${selectedWallet === wallet.id ? 'selected' : ''}`}
                  onClick={() => !isConnecting && setSelectedWallet(wallet.id)}
                >
                  <span className="wallet-option-icon">{wallet.icon}</span>
                  <span className="wallet-option-name">{wallet.name}</span>
                </div>
              ))
            ) : (
              <div className="wallet-option disabled" style={{ gridColumn: '1 / -1' }}>
                <span className="wallet-option-icon">❌</span>
                <span className="wallet-option-name">No Wallets Found</span>
              </div>
            )}
          </div>

          <button
            className="connect-button"
            onClick={handleConnectWallet}
            disabled={isConnecting || availableWallets.length === 0}
          >
            {isConnecting ? (
              <>
                <div className="spinner"></div>
                Signing In...
              </>
            ) : (
              <>
                Connect Wallet ➔
              </>
            )}
          </button>

          <div className="info-section">
            <div className="info-steps">
              <div className="step">
                <div className="step-icon">1</div>
                Connect Wallet
              </div>
              <div className="step">
                <div className="step-icon">2</div>
                Sign Request
              </div>
              <div className="step">
                <div className="step-icon">3</div>
                Start Interacting
              </div>
            </div>
          </div>
        </div>

        <div className="login-footer">
          <p>
            New to Web3?{' '}
            <a href="https://metamask.io" target="_blank" rel="noopener noreferrer">
              Get MetaMask
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;