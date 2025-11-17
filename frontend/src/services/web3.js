import { ethers } from 'ethers';

let provider;
let signer;
let walletType = null; // 'metamask' or 'taho'

// Detect available wallets
export const getAvailableWallets = () => {
  const wallets = [];
  
  if (window.ethereum?.isMetaMask) {
    wallets.push({ id: 'metamask', name: 'MetaMask', icon: '🦊' });
  }
  
  if (window.taho) {
    wallets.push({ id: 'taho', name: 'Taho', icon: '🎩' });
  }
  
  return wallets;
};

export const connectWallet = async (selectedWallet = 'metamask') => {
  try {
    let ethereumProvider = null;
    let type = null;
    
    if (selectedWallet === 'taho') {
      if (!window.taho) {
        throw new Error('Taho wallet not detected. Please install Taho.');
      }
      ethereumProvider = window.taho;
      type = 'taho';
    } else if (selectedWallet === 'metamask') {
      if (!window.ethereum?.isMetaMask) {
        throw new Error('MetaMask not detected. Please install MetaMask.');
      }
      ethereumProvider = window.ethereum;
      type = 'metamask';
    } else {
      throw new Error('Unsupported wallet type');
    }

    try {
      // Request account access
      const accounts = await ethereumProvider.request({
        method: 'eth_requestAccounts',
      });

      provider = new ethers.BrowserProvider(ethereumProvider);
      signer = await provider.getSigner();
      walletType = type;

      return { address: accounts[0], walletType: type };
    } catch (err) {
      throw new Error(`${selectedWallet} connection failed: ${err.message}`);
    }
  } catch (error) {
    throw error;
  }
};

export const signMessage = async (message) => {
  if (!signer) {
    throw new Error('Wallet not connected');
  }
  return await signer.signMessage(message);
};

export const getProvider = () => provider;
export const getSigner = () => signer;
export const getWalletType = () => walletType;

export const getConnectedAddress = async () => {
  if (!provider) {
    // Try to use the wallet type stored in walletType, or default to MetaMask
    const ethereumProvider = walletType === 'taho' ? window.taho : window.ethereum;
    if (!ethereumProvider) return null;
    provider = new ethers.BrowserProvider(ethereumProvider);
  }
  try {
    const signer = await provider.getSigner();
    return await signer.getAddress();
  } catch (error) {
    return null;
  }
};

// Contract interaction
export const getContract = async (contractAddress, abi) => {
  if (!provider) {
    provider = new ethers.BrowserProvider(window.ethereum);
  }
  return new ethers.Contract(contractAddress, abi, provider);
};

export const getContractWithSigner = async (contractAddress, abi) => {
  if (!provider) {
    provider = new ethers.BrowserProvider(window.ethereum);
  }
  if (!signer) {
    signer = await provider.getSigner();
  }
  return new ethers.Contract(contractAddress, abi, signer);
};
