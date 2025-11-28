import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Transfer API
export const transferApi = {
  // Send token with message
  sendToken: (recipient, content, tokenAddress, tokenAmount, transactionHash) =>
    api.post('/transfers/send-token', {
      recipient,
      content,
      tokenAddress,
      tokenAmount,
      transactionHash,
    }),

  // Send NFT with message
  sendNFT: (recipient, content, nftAddress, nftTokenId, transactionHash) =>
    api.post('/transfers/send-nft', {
      recipient,
      content,
      nftAddress,
      nftTokenId,
      transactionHash,
    }),

  // Send Ether with message
  sendEther: (recipient, content, etherAmount, transactionHash) =>
    api.post('/transfers/send-ether', {
      recipient,
      content,
      etherAmount,
      transactionHash,
    }),

  // Claim transfer
  claimTransfer: (messageId) =>
    api.put(`/transfers/${messageId}/claim`),

  // Verify transfer on-chain
  verifyTransfer: (messageId) =>
    api.get(`/transfers/${messageId}/verify`),
};

export default api;
