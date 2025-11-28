import React, { useState } from 'react';
import { X, Loader } from 'lucide-react';
import { transferApi } from '../services/transfers';
import { web3Service } from '../services/web3';
import './QuickTransferModal.css';

function QuickTransferModal({ recipientAddress, transferType, onClose, onTransferSent }) {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleQuickTransfer = async () => {
    try {
      setError(null);
      setIsLoading(true);

      if (!amount || amount <= 0) {
        setError('Please enter a valid amount');
        return;
      }

      if (!recipientAddress) {
        setError('Recipient address missing');
        return;
      }

      // Trigger wallet popup and execute transfer
      let transactionHash = null;

      if (transferType === 'token') {
        // Call smart contract to send token
        transactionHash = await web3Service.sendTokenWithWallet(
          recipientAddress,
          amount
        );
      } else if (transferType === 'nft') {
        // Call smart contract to send NFT
        transactionHash = await web3Service.sendNFTWithWallet(
          recipientAddress,
          amount // This is token ID for NFT
        );
      } else if (transferType === 'ether') {
        // Send native ETH
        transactionHash = await web3Service.sendEtherWithWallet(
          recipientAddress,
          amount
        );
      }

      if (!transactionHash) {
        throw new Error('Transaction failed or was cancelled');
      }

      // Create message in backend with the tx hash from wallet
      let response;
      if (transferType === 'token') {
        response = await transferApi.sendToken(
          recipientAddress,
          message || `Sent ${amount} tokens`,
          null, // tokenAddress - could be fetched from contract
          amount,
          transactionHash
        );
      } else if (transferType === 'nft') {
        response = await transferApi.sendNFT(
          recipientAddress,
          message || `Sent NFT #${amount}`,
          null, // nftAddress - could be fetched from contract
          amount,
          transactionHash
        );
      } else if (transferType === 'ether') {
        response = await transferApi.sendEther(
          recipientAddress,
          message || `Sent ${amount} ETH`,
          amount,
          transactionHash
        );
      }

      if (onTransferSent) {
        onTransferSent(response.data.message);
      }

      onClose();
    } catch (err) {
      setError(err.message || 'Transfer failed');
      console.error('Transfer error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    if (transferType === 'token') return 'Send Token';
    if (transferType === 'nft') return 'Send NFT';
    return 'Send Ether';
  };

  const getPlaceholder = () => {
    if (transferType === 'token') return 'Enter amount (e.g., 100)';
    if (transferType === 'nft') return 'Enter Token ID (e.g., 123)';
    return 'Enter amount in ETH (e.g., 0.5)';
  };

  return (
    <div className="quick-transfer-overlay">
      <div className="quick-transfer-modal">
        <div className="quick-transfer-header">
          <h2>{getTitle()}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="quick-transfer-content">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>To: {recipientAddress?.slice(0, 10)}...{recipientAddress?.slice(-8)}</label>
          </div>

          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={getPlaceholder()}
              disabled={isLoading}
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label>Message (optional)</label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message..."
              disabled={isLoading}
            />
          </div>

          <div className="info-message">
            💡 Your wallet will pop up to confirm the transfer
          </div>

          <div className="button-group">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="cancel-btn"
            >
              Cancel
            </button>
            <button
              onClick={handleQuickTransfer}
              disabled={isLoading || !amount}
              className="send-btn"
            >
              {isLoading ? (
                <>
                  <Loader size={18} className="spinning" />
                  Processing...
                </>
              ) : (
                'Send & Confirm'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuickTransferModal;
