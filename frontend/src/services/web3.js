import { ethers } from 'ethers';

// Custom network configuration (Hardhat localhost)
const CUSTOM_NETWORK = {
  chainId: '0x7a69', // 31337 in hex (Hardhat default)
  chainName: 'Hardhat Local',
  rpcUrls: ['http://127.0.0.1:8545'],
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  blockExplorerUrls: [],
};

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

// Switch to custom network (Hardhat localhost)
export const switchToCustomNetwork = async (ethereumProvider) => {
  try {
    // Try to switch to the network
    await ethereumProvider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: CUSTOM_NETWORK.chainId }],
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        // Add the network if it doesn't exist
        await ethereumProvider.request({
          method: 'wallet_addEthereumChain',
          params: [CUSTOM_NETWORK],
        });
      } catch (addError) {
        console.error('Failed to add custom network:', addError);
        throw new Error('Failed to add custom network to wallet');
      }
    } else if (switchError.code !== -32002) {
      // -32002 means the request is already pending, we can ignore
      console.error('Failed to switch network:', switchError);
      throw new Error('Failed to switch to custom network');
    }
  }
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
      // Request account access (this will show the wallet popup if first time)
      const accounts = await ethereumProvider.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned from wallet');
      }

      // Switch to custom network
      await switchToCustomNetwork(ethereumProvider);

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

/**
 * Reconnect to wallet without requesting account access
 * Used for restoring connection on page reload
 */
export const reconnectWallet = async (walletTypeToUse = 'metamask') => {
  try {
    let ethereumProvider = null;
    
    if (walletTypeToUse === 'taho') {
      if (!window.taho) {
        throw new Error('Taho wallet not found');
      }
      ethereumProvider = window.taho;
    } else if (walletTypeToUse === 'metamask') {
      if (!window.ethereum?.isMetaMask) {
        throw new Error('MetaMask not found');
      }
      ethereumProvider = window.ethereum;
    } else {
      throw new Error('Unsupported wallet type');
    }

    // Get currently connected accounts without prompting
    const accounts = await ethereumProvider.request({
      method: 'eth_accounts',
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('No connected accounts found');
    }

    // Setup provider and signer
    provider = new ethers.BrowserProvider(ethereumProvider);
    signer = await provider.getSigner();
    walletType = walletTypeToUse;

    // Try to switch to custom network (don't fail if it doesn't work)
    try {
      await switchToCustomNetwork(ethereumProvider);
    } catch (error) {
      console.warn('Could not switch network:', error.message);
    }

    return { success: true, walletType: walletTypeToUse, address: accounts[0] };
  } catch (error) {
    console.error('Wallet reconnection failed:', error);
    throw error;
  }
};

export const getProvider = () => provider;
export const getSigner = () => signer;
export const getWalletType = () => walletType;

/**
 * Ensure signer is initialized before using it
 * This handles cases where signer might be undefined
 */
export const ensureWalletConnected = async () => {
  if (signer) {
    return signer; // Already connected
  }

  // Try to reconnect
  try {
    const walletTypeToUse = walletType || 'metamask';
    await reconnectWallet(walletTypeToUse);
    return signer;
  } catch (error) {
    throw new Error('Wallet not connected. Please reconnect.');
  }
};

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

// Auto wallet transfer functions - these trigger wallet popups and return tx hash
export const sendTokenWithWallet = async (recipientAddress, amount) => {
  try {
    // Ensure wallet is connected
    await ensureWalletConnected();

    // This will trigger the wallet popup automatically
    const tx = await signer.sendTransaction({
      to: recipientAddress,
      value: ethers.parseEther(amount.toString()),
      data: '0x', // Simple transfer
    });

    // Wait for transaction confirmation
    const receipt = await tx.wait();
    
    if (!receipt) {
      throw new Error('Transaction failed');
    }

    return tx.hash; // Return transaction hash
  } catch (error) {
    console.error('Token transfer error:', error);
    throw error;
  }
};

export const sendNFTWithWallet = async (nftContractAddress, tokenId) => {
  try {
    // Ensure wallet is connected
    await ensureWalletConnected();

    // ERC721 safeTransferFrom ABI encoding
    const erc721Abi = ['function safeTransferFrom(address from, address to, uint256 tokenId)'];
    const iface = new ethers.Interface(erc721Abi);
    
    const signerAddress = await signer.getAddress();
    const encodedData = iface.encodeFunctionData('safeTransferFrom', [
      signerAddress,
      nftContractAddress, // recipient
      tokenId,
    ]);

    // This will trigger wallet popup
    const tx = await signer.sendTransaction({
      to: nftContractAddress,
      data: encodedData,
    });

    const receipt = await tx.wait();
    if (!receipt) {
      throw new Error('Transaction failed');
    }

    return tx.hash;
  } catch (error) {
    console.error('NFT transfer error:', error);
    throw error;
  }
};

export const sendEtherWithWallet = async (recipientAddress, amount) => {
  try {
    // Ensure wallet is connected
    await ensureWalletConnected();

    // Simple ETH transfer - wallet popup automatic
    const tx = await signer.sendTransaction({
      to: recipientAddress,
      value: ethers.parseEther(amount.toString()),
    });

    const receipt = await tx.wait();
    if (!receipt) {
      throw new Error('Transaction failed');
    }

    return tx.hash;
  } catch (error) {
    console.error('Ether transfer error:', error);
    throw error;
  }
};

export const web3Service = {
  getAvailableWallets,
  connectWallet,
  signMessage,
  getProvider,
  getSigner,
  getWalletType,
  getConnectedAddress,
  getContract,
  getContractWithSigner,
  sendTokenWithWallet,
  sendNFTWithWallet,
  sendEtherWithWallet,
};
