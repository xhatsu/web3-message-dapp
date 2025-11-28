import React, { useState } from 'react';
import { Send, Gift, Coins, Zap, X } from 'lucide-react';
import { transferApi } from '../services/transfers';
import './TransferModal.css';

function TransferModal({ recipientAddress, transferType: initialTransferType, onClose, onTransferSent }) {
  const [transferType, setTransferType] = useState(initialTransferType || 'none'); // none, token, nft, ether
  const [content, setContent] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [nftAddress, setNftAddress] = useState('');
  const [nftTokenId, setNftTokenId] = useState('');
  const [etherAmount, setEtherAmount] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSendTransfer = async () => {
    try {
      setError(null);
      setIsLoading(true);

      if (!content.trim()) {
        setError('Message is required');
        return;
      }

      if (!transactionHash.trim()) {
        setError('Transaction hash is required');
        return;
      }

      let response;

      if (transferType === 'token') {
        if (!tokenAddress || !tokenAmount) {
          setError('Token address and amount required');
          return;
        }
        response = await transferApi.sendToken(
          recipientAddress,
          content,
          tokenAddress,
          tokenAmount,
          transactionHash
        );
      } else if (transferType === 'nft') {
        if (!nftAddress || !nftTokenId) {
          setError('NFT address and token ID required');
          return;
        }
        response = await transferApi.sendNFT(
          recipientAddress,
          content,
          nftAddress,
          nftTokenId,
          transactionHash
        );
      } else if (transferType === 'ether') {
        if (!etherAmount) {
          setError('Ether amount required');
          return;
        }
        response = await transferApi.sendEther(
          recipientAddress,
          content,
          etherAmount,
          transactionHash
        );
      } else {
        setError('Please select a transfer type');
        return;
      }

      if (onTransferSent) {
        onTransferSent(response.data.message);
      }

      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send transfer');
      console.error('Transfer error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="transfer-modal-overlay">
      <div className="transfer-modal">
        <div className="transfer-modal-header">
          <h2>Send Transfer with Message</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="transfer-modal-content">
          {error && <div className="error-message">{error}</div>}

          {/* Transfer Type Selection */}
          <div className="transfer-types">
            <button
              className={`transfer-type-btn ${transferType === 'token' ? 'active' : ''}`}
              onClick={() => setTransferType('token')}
            >
              <Coins size={20} />
              <span>Token</span>
            </button>
            <button
              className={`transfer-type-btn ${transferType === 'nft' ? 'active' : ''}`}
              onClick={() => setTransferType('nft')}
            >
              <Gift size={20} />
              <span>NFT</span>
            </button>
            <button
              className={`transfer-type-btn ${transferType === 'ether' ? 'active' : ''}`}
              onClick={() => setTransferType('ether')}
            >
              <Zap size={20} />
              <span>Ether</span>
            </button>
          </div>

          {/* Message Input */}
          <div className="form-group">
            <label>Message</label>
            <textarea
              placeholder="Write a message to send with the transfer..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
            />
          </div>

          {/* Token Transfer */}
          {transferType === 'token' && (
            <>
              <div className="form-group">
                <label>Token Address</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input
                  type="text"
                  placeholder="Enter amount"
                  value={tokenAmount}
                  onChange={(e) => setTokenAmount(e.target.value)}
                />
              </div>
            </>
          )}

          {/* NFT Transfer */}
          {transferType === 'nft' && (
            <>
              <div className="form-group">
                <label>NFT Contract Address</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={nftAddress}
                  onChange={(e) => setNftAddress(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Token ID</label>
                <input
                  type="text"
                  placeholder="Enter token ID"
                  value={nftTokenId}
                  onChange={(e) => setNftTokenId(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Ether Transfer */}
          {transferType === 'ether' && (
            <div className="form-group">
              <label>Amount (ETH)</label>
              <input
                type="text"
                placeholder="0.5"
                value={etherAmount}
                onChange={(e) => setEtherAmount(e.target.value)}
              />
            </div>
          )}

          {/* Transaction Hash (Required for all) */}
          {transferType !== 'none' && (
            <div className="form-group">
              <label>Transaction Hash</label>
              <input
                type="text"
                placeholder="0x..."
                value={transactionHash}
                onChange={(e) => setTransactionHash(e.target.value)}
              />
              <small>Paste the transaction hash after confirming on-chain</small>
            </div>
          )}
        </div>

        <div className="transfer-modal-footer">
          <button className="cancel-btn" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button
            className="send-btn"
            onClick={handleSendTransfer}
            disabled={isLoading || transferType === 'none'}
          >
            {isLoading ? 'Sending...' : 'Send Transfer'}
            {!isLoading && <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TransferModal;
