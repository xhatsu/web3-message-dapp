# Multi-Wallet Support Setup

Your Web3 Message dApp now supports multiple wallets! Currently supported:
- 🦊 **MetaMask**
- 🎩 **Taho**

## Installation

### MetaMask
1. Visit https://metamask.io
2. Click "Download" and follow the browser extension installation steps
3. Create or import a wallet

### Taho
1. Visit https://www.taho.xyz
2. Click "Install" and follow the browser extension installation steps
3. Create or import a wallet

## How It Works

The application automatically detects which wallets are installed in your browser:

1. **Automatic Detection**: On the login page, the app checks for installed wallets
2. **Wallet Selection**: If multiple wallets are detected, you can choose which one to use
3. **Connection**: Click "Connect [Wallet]" to initiate the connection
4. **Signature**: Sign the verification message
5. **Login**: You're now authenticated and can start messaging!

## Technical Details

### Web3 Service (`src/services/web3.js`)

**New Functions:**
- `getAvailableWallets()` - Returns array of installed wallets
  ```javascript
  {
    id: 'metamask' | 'taho',
    name: 'MetaMask' | 'Taho',
    icon: '🦊' | '🎩'
  }
  ```

- `connectWallet(selectedWallet)` - Connects to specified wallet
  ```javascript
  // Returns
  {
    address: '0x...',
    walletType: 'metamask' | 'taho'
  }
  ```

- `getWalletType()` - Returns current wallet type

### Login Component (`src/pages/Login.js`)

**Changes:**
- Detects available wallets on mount
- Shows wallet selector dropdown if multiple wallets available
- Updates UI based on wallet selection
- Dynamically displays wallet icon and name

## Supported Features

Both wallets support:
- ✅ Account connection
- ✅ Message signing
- ✅ EIP-191 signature verification
- ✅ All API interactions
- ✅ Contract interactions

## Adding More Wallets

To add support for additional wallets (e.g., Coinbase, Trust Wallet):

1. **Update `getAvailableWallets()` in `src/services/web3.js`:**
   ```javascript
   if (window.coinbaseWallet) {
     wallets.push({ id: 'coinbase', name: 'Coinbase Wallet', icon: '💙' });
   }
   ```

2. **Update `connectWallet()` to handle new wallet:**
   ```javascript
   } else if (selectedWallet === 'coinbase') {
     if (!window.coinbaseWallet) {
       throw new Error('Coinbase Wallet not detected.');
     }
     ethereumProvider = window.coinbaseWallet;
     type = 'coinbase';
   ```

3. **Update UI in `src/pages/Login.js` if needed**

## Troubleshooting

### Wallet Not Detected
- **MetaMask**: Ensure the MetaMask extension is installed and enabled
- **Taho**: Ensure the Taho extension is installed and enabled
- Clear browser cache and reload
- Check browser console for errors

### Connection Failed
1. Ensure you have accounts in your wallet
2. Check if the wallet is locked - unlock it
3. Allow the connection when prompted by the wallet
4. Try refreshing the page

### No Wallets Showing
- Check that at least one supported wallet extension is installed
- Refresh the page to re-detect wallets
- Check browser console: `getAvailableWallets()`

### Signature Verification Failed
- Make sure you're signing with the correct account
- Ensure the message text matches exactly
- Check backend is running and accessible

## Browser Support

All features work on modern browsers that support Web3 extensions:
- Chrome/Chromium-based browsers
- Firefox
- Brave
- Edge

## Security Notes

- Wallets are never stored - only addresses are saved
- Signatures are verified server-side
- Private keys never leave the wallet extension
- Use testnet (Sepolia) for development
- Always verify contract addresses before interacting

## Environment Configuration

The app automatically detects wallets through browser globals:
- MetaMask: `window.ethereum.isMetaMask === true`
- Taho: `window.taho` exists

No additional configuration needed!

## Testing Multiple Wallets Locally

1. Install both MetaMask and Taho in your browser
2. Create test accounts in each wallet
3. Visit http://localhost:3000
4. You should see both options in the wallet selector
5. Test logging in with each wallet

## API Compatibility

Both wallets implement the Ethereum JSON-RPC API, so they're compatible with:
- ethers.js (used in this project)
- web3.js
- Any EIP-1193 compliant library

## Support for Additional Chain Networks

Both wallets support multiple networks. The app connects to:
- Local Hardhat: `http://127.0.0.1:8545`
- Sepolia Testnet: `https://sepolia.infura.io/...`

To switch networks:
1. Use the wallet's network selector
2. Ensure the app's RPC URL matches
3. Restart the connection

## Future Wallet Support

Planned for future versions:
- [ ] Coinbase Wallet
- [ ] Trust Wallet
- [ ] Ledger Live
- [ ] Argent
- [ ] WalletConnect v2

## Resources

- MetaMask Docs: https://docs.metamask.io
- Taho Docs: https://www.taho.xyz/docs
- EIP-1193: https://eips.ethereum.org/EIPS/eip-1193
- ethers.js: https://docs.ethers.org

## Questions?

Check the main README.md or individual component READMEs for more information.
