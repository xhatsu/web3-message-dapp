import React, { useState, useEffect } from 'react';
import { Gift, Coins, Zap, Check, Copy, Loader } from 'lucide-react';
import { transferApi } from '../services/transfers';
import './TransferMessage.css';

function TransferMessage({ message, currentUser, onTransferClaimed }) {
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(message.transferData?.claimed || false);
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(message.transferData?.confirmed || false);
  const [verifying, setVerifying] = useState(false);
  const [tokenAddress, setTokenAddress] = useState(message.transferData?.tokenAddress);

  const isOwn = message.sender === currentUser;

  // Auto-verify transaction status on mount
  useEffect(() => {
    if (message.transferData?.transactionHash && !confirmed) {
      verifyTransaction();
    }
  }, [message._id]);

  const verifyTransaction = async () => {
    try {
      setVerifying(true);
      const response = await transferApi.verifyTransfer(message._id);
      setConfirmed(response.data.confirmed);
      if (response.data.tokenAddress) {
        setTokenAddress(response.data.tokenAddress);
      }
    } catch (error) {
      console.error('Verification error:', error);
    } finally {
      setVerifying(false);
    }
  };

  const handleClaim = async () => {
    try {
      setClaiming(true);
      await transferApi.claimTransfer(message._id);
      setClaimed(true);
      if (onTransferClaimed) {
        onTransferClaimed();
      }
    } catch (error) {
      console.error('Claim error:', error);
      alert('Failed to claim transfer');
    } finally {
      setClaiming(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTransferIcon = () => {
    switch (message.transfer) {
      case 'token':
        return <Coins size={20} />;
      case 'nft':
        return <Gift size={20} />;
      case 'ether':
        return <Zap size={20} />;
      default:
        return null;
    }
  };

  const getTransferLabel = () => {
    switch (message.transfer) {
      case 'token':
        return `Token Transfer (${message.transferData?.tokenAmount})`;
      case 'nft':
        return `NFT Transfer (#${message.transferData?.nftTokenId})`;
      case 'ether':
        return `Ether Transfer (${message.transferData?.etherAmount} ETH)`;
      default:
        return 'Transfer';
    }
  };

  if (message.transfer === 'none') {
    return null;
  }

  return (
    <div className={`transfer-message ${isOwn ? 'own' : 'other'}`}>
      <div className="transfer-header">
        <div className="transfer-icon">{getTransferIcon()}</div>
        <div className="transfer-info">
          <div className="transfer-label">{getTransferLabel()}</div>
          <div className="transfer-status">
            {claimed ? (
              <span className="claimed">
                <Check size={14} /> Claimed
              </span>
            ) : confirmed ? (
              <span className="confirmed">
                <Check size={14} /> Confirmed
              </span>
            ) : verifying ? (
              <span className="verifying">
                <Loader size={14} className="spinning" /> Verifying...
              </span>
            ) : (
              <span className="pending">⏳ Pending</span>
            )}
          </div>
        </div>
      </div>

      <div className="transfer-content">
        <p>{message.content}</p>
      </div>

      {message.transfer === 'token' && (
        <div className="transfer-details">
          <div className="detail-row">
            <span>Token:</span>
            <div className="detail-value">
              {tokenAddress ? (
                <>
                  <code>{tokenAddress.slice(0, 10)}...</code>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard(tokenAddress)}
                    title="Copy address"
                  >
                    <Copy size={14} />
                  </button>
                </>
              ) : (
                <span className="na-text">N/A (On-chain transfer)</span>
              )}
            </div>
          </div>
          <div className="detail-row">
            <span>Amount:</span>
            <span>{message.transferData?.tokenAmount}</span>
          </div>
        </div>
      )}

      {message.transfer === 'nft' && (
        <div className="transfer-details">
          <div className="detail-row">
            <span>NFT:</span>
            <div className="detail-value">
              <code>{message.transferData?.nftAddress?.slice(0, 10)}...</code>
              <button
                className="copy-btn"
                onClick={() => copyToClipboard(message.transferData?.nftAddress)}
                title="Copy address"
              >
                <Copy size={14} />
              </button>
            </div>
          </div>
          <div className="detail-row">
            <span>Token ID:</span>
            <span>{message.transferData?.nftTokenId}</span>
          </div>
        </div>
      )}

      {message.transfer === 'ether' && (
        <div className="transfer-details">
          <div className="detail-row">
            <span>Amount:</span>
            <span>{message.transferData?.etherAmount} ETH</span>
          </div>
        </div>
      )}

      <div className="transfer-tx">
        <div className="tx-row">
          <span>TX:</span>
          <div className="tx-value">
            <code>{message.transferData?.transactionHash?.slice(0, 16)}...</code>
            <button
              className="copy-btn"
              onClick={() => copyToClipboard(message.transferData?.transactionHash)}
              title={copied ? 'Copied!' : 'Copy hash'}
            >
              <Copy size={14} />
            </button>
          </div>
        </div>
      </div>

      {!isOwn && !claimed && (
        <button
          className="claim-btn"
          onClick={handleClaim}
          disabled={claiming}
        >
          {claiming ? 'Claiming...' : 'Claim Transfer'}
        </button>
      )}
    </div>
  );
}

export default TransferMessage;
