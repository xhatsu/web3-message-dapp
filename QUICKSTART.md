# QUICK START GUIDE

## Prerequisites

- Node.js v16+
- npm or yarn
- MetaMask browser extension
- MongoDB (local or Atlas cloud)

## Installation

### 1. Install Dependencies

```bash
# From root directory
npm run install-all

# Or manually:
npm install
cd backend && npm install && cd ..
cd contracts && npm install && cd ..
cd frontend && npm install && cd ..
```

### 2. Environment Setup

Copy environment files:

```bash
# Backend
cp backend/.env.example backend/.env

# Contracts
cp contracts/.env.example contracts/.env

# Frontend
cp frontend/.env.example frontend/.env
```

Update the `.env` files with your configuration.

## Development Workflow

### Terminal 1: Smart Contracts (Local Network)

```bash
cd contracts
npx hardhat node
```

This starts a local Hardhat network on `http://127.0.0.1:8545`

### Terminal 2: Deploy Contracts

```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

Save the contract address from the output.

### Terminal 3: Backend Server

```bash
cd backend
npm run dev
```

Server runs on `http://localhost:5000`

### Terminal 4: Frontend

```bash
cd frontend
npm start
```

App runs on `http://localhost:3000`

## Complete Workflow

Or run everything at once:

```bash
# Terminal 1: Local network
cd contracts && npx hardhat node

# Terminal 2 (in new terminal)
cd contracts && npx hardhat run scripts/deploy.js --network localhost

# Terminal 3 (in new terminal)
npm run dev  # runs backend + frontend concurrently
```

## Testing

```bash
cd contracts
npm test
```

## Smart Contract Features

- **sendMessage** - Send a message to another address
- **markAsRead** - Mark a message as read
- **deleteMessage** - Delete a message
- **getUserMessages** - Retrieve messages for a user
- **getMessage** - Get specific message details

## API Endpoints

### Authentication
- `GET /api/auth/nonce/:address` - Get nonce for signing
- `POST /api/auth/login` - Login with signature
- `POST /api/auth/logout` - Logout

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/list` - Get conversations
- `GET /api/messages/conversation/:address` - Get messages with user
- `PUT /api/messages/:id/read` - Mark as read
- `DELETE /api/messages/:id` - Delete message

### Users
- `GET /api/users/:address` - Get user profile
- `GET /api/users/search/:query` - Search users
- `PUT /api/users/profile` - Update profile

## Deployment

### Deploy Backend (Heroku)

```bash
cd backend
heroku create your-app-name
git push heroku main
```

### Deploy Frontend (Vercel)

```bash
cd frontend
vercel
```

### Deploy Contract (Mainnet/Testnet)

Update `contracts/.env` with mainnet RPC URL and private key, then:

```bash
cd contracts
npx hardhat run scripts/deploy.js --network sepolia
```

## Troubleshooting

**MetaMask not detecting?**
- Ensure you're on localhost:3000
- Clear browser cache
- Reinstall MetaMask extension

**Contract deploy fails?**
- Check Hardhat node is running
- Verify private key in `.env`
- Check network configuration

**Messages not syncing?**
- Check MongoDB connection
- Verify JWT token in localStorage
- Check browser console for errors

## Architecture

```
web3-message-dapp/
├── contracts/          # Solidity smart contracts
├── backend/           # Express server + MongoDB
├── frontend/          # React UI
└── README.md
```

## Support

For issues or questions, check the README files in each directory.
