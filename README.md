# Web3 Message dApp

A decentralized messaging application with Web3 wallet authentication, token/NFT transfers, MongoDB database, and smart contract integration using Hardhat.

## ✨ Features

### 🔐 Authentication & Wallet
- ✅ Wallet-based authentication (MetaMask, Taho)
- ✅ Sign-to-login with message verification
- ✅ Multi-wallet support

### 💬 Messaging
- ✅ Real-time messaging with MongoDB database
- ✅ Search users by address or username
- ✅ Messages management

### 💸 Token & NFT Transfers
- ✅ Send tokens with messages
- ✅ Send NFTs with messages
- ✅ Quick transfer with simple interaction
- ✅ Transaction hash tracking
- ✅ On-chain transaction verification

### 👤 User Profile
- ✅ Username setup and update
- ✅ Avatar URL support
- ✅ Bio/description field
- ✅ User info panel with wallet balance

### 🌐 Network Management
- ✅ Auto-switch to custom Hardhat network
- ✅ Network auto-add to MetaMask
- ✅ Custom RPC endpoint configuration
- ✅ Support for localhost and remote networks

### 🎨 UI/UX
- ✅ Modern React interface
- ✅ Real-time conversation list
- ✅ User avatar and status indicators
- ✅ Loading states and error handling
- ✅ Responsive design
- ✅ Loading animations

## Project Structure

```
web3-message-dapp/
├── contracts/              # Hardhat smart contracts
│   ├── contracts/
│   │   ├── WebMessage.sol
│   │   └── WebMessageTransfer.sol
│   ├── scripts/
│   │   └── deploy.js
│   └── test/
│       └── WebMessage.test.js
├── backend/               # Express.js server with MongoDB
│   ├── models/            # MongoDB schemas
│   │   ├── User.js
│   │   ├── Message.js
│   │   └── Conversation.js
│   ├── routes/            # API endpoints
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── messages.js
│   │   └── transfers.js
│   ├── middleware/        # Express middleware
│   │   └── auth.js
│   ├── scripts/           # Utility scripts
│   │   └── getUsers.js
│   ├── server.js          # Main server file
│   └── package.json
├── frontend/             # React application
│   ├── src/
│   │   ├── components/   # React components
│   │   │   ├── ChatWindow.js
│   │   │   ├── ConversationList.js
│   │   │   ├── NewConversation.js
│   │   │   ├── QuickTransferModal.js
│   │   │   ├── TransferModal.js
│   │   │   ├── UserInfoPanel.js
│   │   │   └── *.css
│   │   ├── pages/        # Page components
│   │   │   ├── Chat.js
│   │   │   ├── Login.js
│   │   │   └── *.css
│   │   ├── services/     # API & Web3 services
│   │   │   ├── api.js
│   │   │   ├── transfers.js
│   │   │   └── web3.js
│   │   ├── store/        # State management
│   │   │   ├── authStore.js
│   │   │   └── messageStore.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── .env.example          # Environment variables template
├── package.json          # Root package configuration
├── BACKEND_API_ENDPOINTS.md
├── QUICK_TRANSFER_FEATURE.md
└── README.md
```

## Prerequisites

- Node.js v16+
- npm or yarn
- MetaMask or similar Web3 wallet browser extension
- MongoDB instance (local or MongoDB Atlas cloud)

## Installation

### 1. Clone Repository
```bash
git clone https://github.com/xhatsu/web3-message-dapp.git
cd web3-message-dapp
```

### 2. Install All Dependencies
```bash
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
cd contracts && npm install && cd ..
```

## Environment Setup

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/web3-messages
JWT_SECRET=your_jwt_secret_key_change_this_in_production
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
CUSTOM_RPC_URL=http://127.0.0.1:8545
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=http://localhost:5000
```

### Contracts (.env)
```
HARDHAT_NETWORK=localhost
ETHEREUM_RPC_URL=http://127.0.0.1:8545
```

## Quick Start

### 1. Start MongoDB (if local)
```bash
mongod
```

### 2. Start Hardhat Node
```bash
cd contracts
npx hardhat node
```

### 3. Deploy Contracts (in another terminal)
```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

### 4. Start Backend (in another terminal)
```bash
cd backend
npm start
```

### 5. Start Frontend (in another terminal)
```bash
cd frontend
npm start
```

### 6. Access the App
Open [http://localhost:3000](http://localhost:3000) in your browser

## API Endpoints

### Authentication
- `GET /api/auth/nonce/:address` - Get nonce for signing
- `POST /api/auth/login` - Login with signed message
- `POST /api/auth/logout` - Logout

### Users
- `GET /api/users/:address` - Get user by address
- `GET /api/users` - Get current user
- `GET /api/users/search/:query` - Search users by address or username
- `PUT /api/users/profile` - Update profile (username, avatar, bio)
- `POST /api/users/send-message` - Send first message (creates conversation)

### Messages
- `GET /api/messages/list` - Get all conversations
- `GET /api/messages/conversation/:address` - Get messages with specific user
- `POST /api/messages/send` - Send message
- `DELETE /api/messages/:id` - Delete message

### Transfers
- `POST /api/transfers/send-token` - Send token with message
- `POST /api/transfers/send-nft` - Send NFT with message
- `POST /api/transfers/send-ether` - Send Ether with message
- `PUT /api/transfers/:id/claim` - Claim received transfer
- `GET /api/transfers/:id/verify` - Verify transaction on-chain

## Smart Contracts

### WebMessage.sol
- Message storage and retrieval
- User management
- Event emissions

### WebMessageTransfer.sol
- Token transfer handling
- NFT transfer handling
- Ether transfer handling
- Transfer verification

## Database Models

### User
```javascript
{
  address: String (unique),
  username: String,
  avatar: String,
  bio: String,
  nonce: Number,
  isOnline: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Message
```javascript
{
  sender: String,
  recipient: String,
  content: String,
  transfer: String, // 'none', 'token', 'nft', 'ether'
  transferData: {
    tokenAddress: String,
    tokenAmount: String,
    nftAddress: String,
    nftTokenId: String,
    etherAmount: String,
    transactionHash: String,
    claimed: Boolean,
    confirmed: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Conversation
```javascript
{
  participants: [String],
  participantsKey: String,
  lastMessage: ObjectId,
  lastMessageTime: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Technology Stack

- **Frontend**: React 18, ethers.js v6, Zustand, Lucide Icons
- **Backend**: Express.js, MongoDB/Mongoose, JWT, ethers.js
- **Smart Contracts**: Solidity 0.8.19, Hardhat
- **Authentication**: Web3 wallet signature verification
- **Styling**: CSS3 with custom components

## Features in Detail

### Secure Authentication
- No passwords required
- Sign message with wallet to login
- JWT tokens for session management
- Auto-reconnect on page reload

### Messaging System
- MongoDB-backed message storage
- Conversation threading
- Real-time updates
- Message deletion
- User search with fuzzy matching

### Web3 Transfers
- Direct wallet integration
- Automatic gas estimation
- Transaction tracking
- On-chain verification
- Support for ETH, ERC20, ERC721

### User Experience
- Clean, modern UI
- Real-time conversation updates
- Wallet balance display
- Online/offline indicators
- Error handling and loading states
